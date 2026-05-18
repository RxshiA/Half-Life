# US-006 — Customer Ratings & Proof of Delivery

| Field | Detail |
|-------|--------|
| **ID** | US-006 |
| **Epic** | Service Quality |
| **Priority** | Low |
| **Status** | Backlog |

---

## User Story Statement

> **As a** recipient,  
> **I want** to confirm delivery and rate the courier (with optional signature or photo capture),  
> **so that** the organisation can measure service quality and resolve disputes fairly.

---

## Description

Currently there is no mechanism to confirm that a delivery was successfully received, or to record any evidence of handover. This creates disputes when a customer claims non-delivery. By introducing a digital proof-of-delivery (POD) step — triggered when a shipment reaches `DELIVERED` status — recipients can sign off on the delivery, upload a photo of the parcel in-situ, and optionally rate the experience.

Collected POD artefacts are stored against the shipment and are accessible to admins for dispute resolution. Aggregated ratings give the operations team objective data on courier performance.

---

## Acceptance Criteria

| # | Criterion | Pass Condition |
|---|-----------|----------------|
| AC-1 | Confirmation link sent | When a shipment status changes to `DELIVERED`, the recipient receives an email/SMS with a unique, time-limited confirmation link |
| AC-2 | Photo upload | The confirmation page allows the recipient to upload a photo (JPEG/PNG, max 10 MB); the photo is stored and linked to the shipment |
| AC-3 | Digital signature | The confirmation page includes a touch/mouse-friendly canvas for a digital signature; the captured signature is stored as a PNG |
| AC-4 | Optional rating | After confirming delivery, the recipient can submit a 1–5 star rating and an optional comment (max 500 chars) |
| AC-5 | POD visible to admins | Ratings, photos, and signatures are displayed on the shipment detail page (admin view only) |
| AC-6 | Aggregated report | A "Ratings Report" page shows average rating, distribution by star count, and filterable by driver, date range, and service level |
| AC-7 | Link expiry | The confirmation link expires after 7 days; attempting to use an expired link shows a clear message and offers to contact support |

---

## Validations

| Field / Input | Rule |
|---------------|------|
| Confirmation token | Must be a valid, unexpired, single-use JWT tied to the specific shipment |
| Photo upload | File must be JPEG or PNG; max size 10 MB; at least 100×100 px resolution |
| Signature canvas | Signature must contain at least one stroke before submission is allowed |
| Rating | Integer 1–5 only; field is optional — absence of rating is distinct from a 1-star rating |
| Comment | Max 500 characters; stripped of HTML/script tags before storage |
| Confirmation action | Can only be performed once per shipment; re-submitting the same token after confirmation returns `409 Conflict` |

---

## Business Rules

| # | Rule |
|---|------|
| BR-1 | The confirmation link is addressed to the **recipient** (not the sender); the recipient's email/phone is captured at shipment creation time |
| BR-2 | Confirmation and rating submission does **not** require the recipient to have a system account — the token-authenticated page is publicly accessible via the unique link |
| BR-3 | Photo and signature artefacts are stored in **object storage** (e.g. S3-compatible); the database stores only the URL reference, not the binary content |
| BR-4 | A shipment can only be confirmed once; if the driver has already marked it `DELIVERED` and a POD has been submitted, the record is immutable |
| BR-5 | Ratings below 3 stars automatically create an internal flag visible to the quality assurance team for follow-up |
| BR-6 | PII in the confirmation flow (recipient name, address) is used only for display; it is not re-transmitted in API responses beyond the token-authenticated page |
| BR-7 | Uploaded artefacts must be retained for a minimum of **2 years** for legal and dispute-resolution purposes, even if the shipment record is otherwise archived |
| BR-8 | Aggregated ratings are **anonymised** in the report — individual recipient comments are only visible to admins with the `DISPUTE_REVIEW` permission (future role) |
