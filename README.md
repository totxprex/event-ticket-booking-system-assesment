# Created by Tolulope Mumuney for Great Brands Nigeria Limited Assessment

# Event Ticket Booking System

This is a Node.js application that implements an event ticket booking system. It exposes a RESTful API that allows initializing events, booking tickets (with a waiting list if sold out), canceling bookings (with automatic assignment from the waiting list), and viewing event status. Order details are saved in a SQLite database.

## Features

- **Initialize Event:** Create a new event with a specified number of tickets.
- **Book Ticket:** Book a ticket for a user. If the event is sold out, the user is added to the waiting list.
- **Cancel Booking:** Cancel a user’s booking. If a waiting list exists, automatically assign the ticket to the next waiting user.
- **Event Status:** Retrieve available tickets and waiting list count.
- **Concurrency Handling:** Uses async locks to ensure thread-safety.
- **Test-Driven Development (TDD):** Includes unit and integration tests with over 80% coverage.
- **Error Handling:** Provides meaningful error messages.

## Setup and Running Instructions

1. **Clone the repository:**
   - git clone https://github.com/totxprex/event-ticket-booking-system-assesment.git
   - cd event-ticket-booking-system-assesment
2. **Run the Server**
   - npm install
   - npm start (DB Will be Initiated in root folder on start)

## API documentation

API documentation has been published here: https://documenter.getpostman.com/view/21822607/2sAYX9kzm1

# Testing sequence using API Doc:

- Hit endpoint _POST Initialize a new event_ to create a new event in memory
- Hit endpoint _POST Book a ticket for a user_ to book a ticket for the event and save in orders table
- Try _POST Cancel a booking for a user_ endpoint to mark booking/order status as cancelled in the database
- _Retrieve the current status of an event_ is for retreieving saved orders/bookings in orders table in orders.db

**Explore SQLite DB**
Open orders.db in root with DB Browser for SQLite to explore database.
