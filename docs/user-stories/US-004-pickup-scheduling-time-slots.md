# US-004 — Pickup Scheduling with Time Slots

| Field | Detail |
|-------|--------|
| **ID** | US-004 |
| **Epic** | Delivery Operations |
| **Priority** | Medium | 
| **Status** | Backlog |

---

## User Story Statement

> **As a** client,  
> **I want** to schedule a pickup window when creating a shipment,  
> **so that** the courier arrives at a time that is convenient and we reduce missed pickups.

---

## Description

A significant portion of failed first-attempt pickups occur because the courier arrives when the sender is unavailable. Allowing clients to select a preferred pickup window at booking time enables operations to pre-schedule driver routes and reduces wasted trips.

Available time slots are determined dynamically by the backend, factoring in the sender's postcode zone and current driver capacity for the selected date. Clients may reschedule up to a threshold before the window. Admins gain a calendar view to monitor daily pickup load.

---

## Acceptance Criteria

| # | Criterion | Pass Condition |
|---|-----------|----------------|
| AC-1 | Scheduling step in form | The Create Shipment form includes a "Schedule Pickup" step with a calendar date-picker and a list of available time slots for the selected date |
| AC-2 | Slots are zone-aware | Available slots are fetched from `GET /api/slots?date=&postcode=` — slots reflect actual driver capacity for the sender's zone |
| AC-3 | Appointment stored | The confirmed pickup date and slot are saved on the `Shipment` record and displayed on the shipment detail page |
| AC-4 | Reschedule allowed | A client can reschedule a pickup **up to 2 hours before** the start of the booked window; rescheduling later than 2 hours is blocked with an explanatory error |
| AC-5 | Admin calendar view | The admin dashboard includes a "Pickup Calendar" tab showing all scheduled pickups for a day, grouped by postcode zone |
| AC-6 | Slot capacity enforced | Once a slot reaches maximum bookings, it no longer appears as available to new callers |
| AC-7 | Cancellation handling | If a shipment is cancelled, its slot is released back to the available pool immediately |

---

## Validations

| Field | Rule |
|-------|------|
| Pickup date | Must be today or a future date; cannot be a public holiday (holidays list maintained by admin) |
| Time slot | Must be an unexpired slot returned by the slots API; cannot be a slot that has since been filled by another booking |
| Postcode | Derived from the authenticated user's profile `postalCode`; must belong to a configured zone |
| Reschedule window | System checks `now < appointmentStart - 2 hours`; blocks if outside window |
| Cancellation | Only allowed when shipment status is `PENDING` or `PICKED_UP` (cannot cancel an in-transit shipment's pickup retroactively) |

---

## Business Rules

| # | Rule |
|---|------|
| BR-1 | Pickup scheduling is **mandatory** for `EXPRESS` and `OVERNIGHT` service levels; it is **optional** for `STANDARD` |
| BR-2 | Slots are defined in 2-hour blocks (e.g. 08:00–10:00, 10:00–12:00); admins can configure block duration and daily capacity per zone |
| BR-3 | A shipment can only have **one** active pickup appointment; rescheduling replaces the previous appointment |
| BR-4 | Driver manifests are generated automatically at midnight for the following day, based on confirmed pickups — last-minute reschedules within 4 hours of manifest generation trigger an alert to the dispatcher |
| BR-5 | Slot availability is calculated in **real time** — no caching that could oversell capacity |
| BR-6 | If a zone has no configured slots (e.g. new postcode), the form must fall back to a free-text "preferred time" field and flag the booking for manual scheduling |
| BR-7 | The client's local timezone must be respected when displaying slots; the backend stores all times in UTC |
