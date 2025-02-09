// src/routes/events.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.post("/initialize", eventController.initializeEvent);

router.post("/book", eventController.bookTicket);

router.post("/cancel", eventController.cancelBooking);

router.get("/status/:eventId", eventController.getStatus);

module.exports = router;
