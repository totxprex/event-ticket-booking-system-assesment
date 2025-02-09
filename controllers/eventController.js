const AsyncLock = require("async-lock");
const lock = new AsyncLock();
const Event = require("../models/event");
const db = require("../db/index");

const events = new Map();

/**
 * Initialize a new event.
 * Request body: { eventId: string, totalTickets: number }
 */
exports.initializeEvent = (req, res, next) => {
  try {
    const { eventId, totalTickets } = req.body;
    if (!eventId || typeof totalTickets !== "number" || totalTickets < 1) {
      return res.status(400).json({ error: "Invalid eventId or totalTickets" });
    }
    if (events.has(eventId)) {
      return res.status(400).json({ error: "Event already exists" });
    }

    const newEvent = new Event(eventId, totalTickets);
    events.set(eventId, newEvent);
    res.status(201).json({ message: "Event initialized successfully", eventId });
  } catch (error) {
    next(error);
  }
};

/**
 * Book a ticket for a user.
 * Request body: { eventId: string, user: { id: string, name: string } }
 */
exports.bookTicket = (req, res, next) => {
  const { eventId, user } = req.body;
  if (!eventId || !user || !user.id || !user.name) {
    return res.status(400).json({ error: "Missing eventId or user information" });
  }

  lock.acquire(eventId, async (done) => {
    try {
      if (!events.has(eventId)) {
        return res.status(404).json({ error: "Event not found" });
      }
      const event = events.get(eventId);
      let status;
      if (event.availableTickets > 0) {
        event.bookings.push(user);
        event.availableTickets--;
        status = "booked";
      } else {
        event.waitingList.push(user);
        status = "waiting";
      }

      const sql = `
        INSERT INTO orders (eventId, userId, userName, status, createdAt)
        VALUES (?, ?, ?, ?, datetime('now'))
      `;
      const params = [eventId, user.id, user.name, status];
      db.run(sql, params, function (err) {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Failed to save order details" });
        }
        res.status(201).json({ message: `Ticket ${status} successfully`, orderId: this.lastID });
      });
    } catch (error) {
      next(error);
    } finally {
      done();
    }
  });
};

/**
 * Cancel a booking for a user.
 * Request body: { eventId: string, userId: string }
 */
exports.cancelBooking = (req, res, next) => {
  const { eventId, userId } = req.body;
  if (!eventId || !userId) {
    return res.status(400).json({ error: "Missing eventId or userId" });
  }

  lock.acquire(eventId, async (done) => {
    try {
      if (!events.has(eventId)) {
        return res.status(404).json({ error: "Event not found" });
      }
      const event = events.get(eventId);

      const bookingIndex = event.bookings.findIndex((u) => u.id === userId);
      if (bookingIndex !== -1) {
        event.bookings.splice(bookingIndex, 1);
        event.availableTickets++;

        const updateSql = `UPDATE orders SET status = 'cancelled' WHERE eventId = ? AND userId = ? AND status = 'booked'`;
        db.run(updateSql, [eventId, userId], (err) => {
          if (err) {
            console.error("Database error on cancel:", err);
            return res.status(500).json({ error: "Failed to update order details" });
          }

          if (event.waitingList.length > 0) {
            const nextUser = event.waitingList.shift();
            event.bookings.push(nextUser);
            event.availableTickets--;

            const updateWaitingSql = `UPDATE orders SET status = 'booked' WHERE eventId = ? AND userId = ? AND status = 'waiting'`;
            db.run(updateWaitingSql, [eventId, nextUser.id], (err2) => {
              if (err2) {
                console.error("Database error on waiting list update:", err2);
                return res
                  .status(500)
                  .json({ error: "Failed to update waiting list order details" });
              }
              res.status(200).json({
                message: `Booking cancelled. Ticket assigned to waiting user ${nextUser.id}`,
              });
            });
          } else {
            res.status(200).json({ message: "Booking cancelled successfully" });
          }
        });
      } else {
        const waitingIndex = event.waitingList.findIndex((u) => u.id === userId);
        if (waitingIndex !== -1) {
          const updateSql = `UPDATE orders SET status = 'cancelled' WHERE eventId = ? AND userId = ? AND status = 'waiting'`;
          db.run(updateSql, [eventId, userId], (err) => {
            if (err) {
              console.error("Database error on waiting list cancel:", err);
              return res.status(500).json({ error: "Failed to update order details" });
            }
            res.status(200).json({ message: "Waiting list booking cancelled successfully" });
          });
        } else {
          res.status(404).json({ error: "Booking not found for the provided user" });
        }
      }
    } catch (error) {
      next(error);
    } finally {
      done();
    }
  });
};

/**
 * Retrieve event status.
 * GET /status/:eventId
 */
exports.getStatus = (req, res, next) => {
  try {
    const { eventId } = req.params;
    if (!events.has(eventId)) {
      return res.status(404).json({ error: "Event not found -T" });
    }
    const event = events.get(eventId);
    res.status(200).json({
      eventId,
      availableTickets: event.availableTickets,
      waitingListCount: event.waitingList.length,
    });
  } catch (error) {
    next(error);
  }
};
