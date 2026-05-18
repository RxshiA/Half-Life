# US-003 — Instant Quote & Service-Level Pricing

| Field | Detail |
|-------|--------|
| **ID** | US-003 |
| **Epic** | Pricing & Revenue |
| **Priority** | High |
| **Status** | Backlog |

---

## User Story Statement

> **As a** client,  
> **I want** to see a price estimate based on weight, dimensions, and service level before I confirm a shipment,  
> **so that** I can choose the most cost-effective option for each package.

---

## Description

At present, clients submit a shipment without any visibility into cost — they receive a bill separately. This friction reduces trust and leads to disputes. By surfacing a live price estimate in the Create Shipment form, clients can make informed decisions about service level and packaging, and the business can collect confirmed pricing at the point of booking.

The quoting engine runs **server-side** to prevent manipulation. Pricing is driven by a configurable matrix (base rate + per-kg rate × service-level multiplier) that admins can update without a code deployment. The agreed quote is locked in and stored on the shipment record at creation time.

---

## Acceptance Criteria

| # | Criterion | Pass Condition |
|---|-----------|----------------|
| AC-1 | Live estimate in form | The Create Shipment form shows a price estimate that updates automatically as `weightKg`, `dimensionsCm`, and `serviceLevel` change — no page reload required |
| AC-2 | Server-side calculation | The estimate is fetched from `POST /api/quotes` — it cannot be computed or spoofed client-side |
| AC-3 | All three service levels shown | The quote panel displays the price for `STANDARD`, `EXPRESS`, and `OVERNIGHT` simultaneously so the client can compare |
| AC-4 | Quote locked at submission | The accepted quote amount and service level are stored on the `Shipment` record at creation time and cannot be retroactively changed |
| AC-5 | Admin pricing matrix | Admins can view and edit base rates, per-kg rates, and multipliers per service level via a settings page |
| AC-6 | Quote expiry | A quote token is valid for 15 minutes; submitting an expired quote returns a `410 Gone` error with a prompt to refresh |
| AC-7 | Zero-price guard | If the calculated price is £0.00 (e.g. due to misconfigured matrix), the system blocks submission and alerts the admin |

---

## Validations

| Input | Rule |
|-------|------|
| `weightKg` | Must be a positive number before a quote is issued; max 1000 kg |
| `dimensionsCm` | Must match `LxWxH` integer format; each dimension must be between 1 and 500 cm |
| `serviceLevel` | Must be one of `STANDARD`, `EXPRESS`, `OVERNIGHT` |
| Quote token | Must be a valid, unexpired server-issued token (UUID v4, TTL 15 min) |
| Pricing matrix entry (admin) | Base rate ≥ 0; per-kg rate > 0; multiplier > 0; all values stored to 2 decimal places |

---

## Business Rules

| # | Rule |
|---|------|
| BR-1 | Pricing logic lives **entirely on the server** — the frontend only displays the returned amount |
| BR-2 | The pricing matrix is versioned; changing rates does not affect already-created shipments (their locked quote remains unchanged) |
| BR-3 | `OVERNIGHT` always costs more than `EXPRESS`, which always costs more than `STANDARD` for the same weight/dimensions — the matrix must enforce this ordering at save time |
| BR-4 | Volumetric weight (`L × W × H / 5000`) is compared against actual weight and the **greater** value is used for pricing (standard courier practice) |
| BR-5 | `declaredValue` does not affect the base shipping cost but may attract an insurance surcharge (out of scope for this story — recorded for future reference) |
| BR-6 | A quote token is single-use — once a shipment is created with it, the token is invalidated to prevent replay |
| BR-7 | If `POST /api/quotes` is unavailable, the form must display a clear error ("Pricing unavailable — please try again") and block submission rather than silently submitting without a price |
