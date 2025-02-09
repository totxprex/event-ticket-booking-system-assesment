class Event {
  constructor(eventId, totalTickets) {
    this.eventId = eventId;
    this.totalTickets = totalTickets;
    this.availableTickets = totalTickets;
    this.bookings = [];
    this.waitingList = [];
  }
}

module.exports = Event;
