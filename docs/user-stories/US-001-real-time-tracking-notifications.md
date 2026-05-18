# US-001 — Real-Time Tracking Notifications

| Field | Detail |
|-------|--------|
| **ID** | US-001 |
| **Epic** | Shipment Visibility |
| **Priority** | High |
| **Status** | Backlog |

---

## User Story Statement

> **As a** sender,  
> **I want** to receive email or SMS notifications whenever my shipment status changes,  
> **so that** I don't have to manually refresh the tracking page to stay informed.

---

## Description

Currently, customers must actively visit the tracking page to check whether their shipment has moved between statuses (e.g. `PICKED_UP` → `IN_TRANSIT` → `DELIVERED`). This creates unnecessary friction and support load from customers asking for updates.

This feature introduces an event-driven notification pipeline. When an admin updates a shipment's status, the system dispatches an outbound notification to the shipment owner via their preferred channel (email and/or SMS). Customers retain full control through opt-in/opt-out preferences on their profile.

---

## Acceptance Criteria

| # | Criterion | Pass Condition |
|---|-----------|----------------|
| AC-1 | Email notification sent on status change | Email is delivered to the shipment owner's registered address **within 60 seconds** of the status update |
| AC-2 | Notification content is correct | Email body contains: new status label, tracking number, sender name, and a deep link to `/track/{trackingNumber}` |
| AC-3 | SMS notification (opt-in) | SMS is sent when the user has a verified phone number **and** has enabled SMS notifications in profile settings |
| AC-4 | Opt-out respected | No notifications are sent to users who have disabled all notifications; opting out takes effect immediately |
| AC-5 | No duplicate notifications | A single status update triggers exactly one email and (if opted in) one SMS — no duplicates even on retry |
| AC-6 | Delivery failures are logged | Failed email/SMS delivery attempts are recorded with error reason; the shipment status update itself is not rolled back |
| AC-7 | Notification history visible | Admins can view a log of notifications sent for a shipment on the shipment detail page |

---

## Validations

| Field / Input | Rule |
|---------------|------|
| Recipient email | Must be a valid RFC-5321 email; taken from `User.email` at time of dispatch |
| Recipient phone | Must be E.164 format (`+61400000001`); only used when `User.smsOptIn = true` |
| Notification channel | At least one channel (email or SMS) must be active; if both are disabled, skip silently |
| Status transition | Notification is triggered only when status **changes** — re-saving the same status must not re-send |
| Template variables | All template placeholders (`{{trackingNumber}}`, `{{status}}`, `{{link}}`) must be resolved before dispatch; reject template rendering errors and log them |

---

## Business Rules

| # | Rule |
|---|------|
| BR-1 | Email notifications are **on by default** for all users at registration; SMS is **off by default** and requires explicit opt-in |
| BR-2 | Notification is sent for **every** status transition except `PENDING → PENDING` (no-op) |
| BR-3 | The deep-link URL uses the public tracking endpoint (`/track/{trackingNumber}`) — no authentication required to view it |
| BR-4 | Failed notifications must be **retried up to 3 times** with exponential back-off before being marked as failed |
| BR-5 | PII (full address, phone number) must **not** appear in notification content — only the recipient's first name, tracking number, status, and link |
| BR-6 | Admin-initiated status changes and system-automated changes both trigger notifications |
| BR-7 | A user who deletes their account should have all pending notification jobs cancelled immediately |
