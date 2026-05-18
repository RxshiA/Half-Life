# US-002 — Bulk Shipment Import (CSV)

| Field | Detail |
|-------|--------|
| **ID** | US-002 |
| **Epic** | Operations Efficiency |
| **Priority** | Medium |
| **Status** | Backlog |

---

## User Story Statement

> **As an** operations user,  
> **I want** to upload a CSV file containing multiple shipments,  
> **so that** I can onboard high-volume clients in seconds rather than entering shipments one-by-one.

---

## Description

Enterprise or high-volume clients often have dozens or hundreds of shipments to lodge at once. The current create-shipment form is designed for single entry and is impractical at volume. This feature allows an authenticated user with appropriate permissions to upload a structured CSV, preview the parsed rows (with inline validation feedback), and submit them in a single batch operation.

The import is designed to be safe: invalid rows are rejected individually without blocking valid ones, and the full import result (success count, skip count, error detail) is available for download after the job completes.

---

## Acceptance Criteria

| # | Criterion | Pass Condition |
|---|-----------|----------------|
| AC-1 | Import CSV button visible | An "Import CSV" button appears on the Dashboard for users with `USER` or `ADMIN` role |
| AC-2 | CSV template downloadable | A "Download Template" link provides a pre-formatted CSV with all required column headers and one example row |
| AC-3 | File type enforced | Only `.csv` files are accepted; uploading any other type shows an inline error and does not submit |
| AC-4 | Preview with validation feedback | After upload, each row is displayed in a preview table; rows with errors are highlighted in red with a descriptive message per cell |
| AC-5 | Partial import proceeds | Valid rows can be submitted even if some rows have errors; the user is warned about skipped rows before confirming |
| AC-6 | Successful rows create shipments | Each valid row creates a `PENDING` shipment attributed to the authenticated user |
| AC-7 | Import result report | A post-import summary shows: total rows, successfully imported, skipped (with reasons), and offers a downloadable error report |
| AC-8 | Idempotency | Re-uploading a CSV that contains a tracking number already in the system skips that row rather than creating a duplicate |

---

## Validations

| Column | Required | Rules |
|--------|----------|-------|
| `recipientName` | Yes | Min 2 chars, max 100 chars |
| `recipientAddress` | Yes | Min 5 chars, max 300 chars |
| `recipientPhone` | Yes | E.164 format, 7–20 chars |
| `weightKg` | Yes | Positive decimal number, max 1000 |
| `dimensionsCm` | Yes | Format `LxWxH` (e.g. `30x20x10`), integers only |
| `packageType` | Yes | One of `DOCUMENT`, `PARCEL`, `FRAGILE`, `HEAVY` |
| `serviceLevel` | Yes | One of `STANDARD`, `EXPRESS`, `OVERNIGHT` |
| `declaredValue` | No | Non-negative number if present |
| `notes` | No | Max 500 chars |
| `estimatedDelivery` | No | ISO 8601 date-time, must be in the future |
| File size | — | Maximum 5 MB |
| Row count | — | Maximum 500 rows per upload |

---

## Business Rules

| # | Rule |
|---|------|
| BR-1 | The sender details (name, address) are **snapshotted from the authenticated user's profile** at import time — they cannot be overridden per row in the CSV |
| BR-2 | Each valid row generates its own unique tracking number following the `CS-XXXXXXXX` pattern |
| BR-3 | A row is skipped (not rejected entirely) if it has a non-critical warning (e.g. missing optional `notes`); a row is errored if a required field is invalid |
| BR-4 | The import job runs **synchronously** for uploads ≤ 100 rows; batches of 101–500 rows are processed asynchronously with a progress indicator |
| BR-5 | Partial success is allowed — a failed row does not roll back previously created shipments in the same batch |
| BR-6 | All import actions are **audit-logged**: who imported, when, how many rows, and how many succeeded/failed |
| BR-7 | The downloadable error report must not expose other users' data — it lists only the rows from the current upload |
