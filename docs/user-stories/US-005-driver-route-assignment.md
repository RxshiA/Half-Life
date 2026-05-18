# US-005 — Driver & Route Assignment for Ops

| Field | Detail |
|-------|--------|
| **ID** | US-005 |
| **Epic** | Delivery Operations |
| **Priority** | Medium |
| **Status** | Backlog |

---

## User Story Statement

> **As a** dispatcher,  
> **I want** to assign shipments to specific drivers and view a daily delivery route,  
> **so that** deliveries are sequenced efficiently and drivers have clear workloads.

---

## Description

At present, the system has no concept of drivers or route planning — shipments are fulfilled without structured assignment. Dispatchers must manually communicate routes out-of-band (e.g. spreadsheets, phone calls), which is error-prone and hard to track.

This feature introduces a `DRIVER` role and a Dispatch view. Dispatchers can drag-and-drop shipments onto drivers for a given day; the system calculates an optimised delivery sequence and presents it on a map. Drivers receive a digital manifest and can update delivery status on the go.

---

## Acceptance Criteria

| # | Criterion | Pass Condition |
|---|-----------|----------------|
| AC-1 | DRIVER role exists | A new `DRIVER` role can be assigned by an admin; drivers can only see and update shipments assigned to them |
| AC-2 | Dispatch view in admin | The admin dashboard has a "Dispatch" tab showing unassigned shipments for a selected date alongside a list of available drivers |
| AC-3 | Drag-and-drop assignment | A dispatcher can drag a shipment card onto a driver's column to assign it; the assignment is saved on drop |
| AC-4 | Optimised route displayed | After assignment, the system calculates and displays the recommended delivery sequence on a map, ordered to minimise travel distance |
| AC-5 | Driver manifest | Drivers receive a push notification (or SMS fallback) containing their ordered manifest; the manifest is also accessible in the app |
| AC-6 | Real-time status updates | When a driver marks a shipment `DELIVERED` (or any status), the dispatcher's view updates within 5 seconds without a page refresh |
| AC-7 | Route re-optimisation | If a shipment is added or removed after route generation, the dispatcher can trigger a re-optimise action |

---

## Validations

| Field / Action | Rule |
|----------------|------|
| Driver assignment | A shipment can only be assigned to a user with `DRIVER` role |
| Date selection | Dispatch view only allows dates from today onward; past dates are read-only |
| Route generation | Route optimisation requires at least 1 shipment assigned to the driver; triggers an error if called with 0 stops |
| Status update by driver | Drivers may only update status on shipments explicitly assigned to them; attempting to update an unassigned shipment returns `403 Forbidden` |
| Max stops per driver | A single driver manifest must not exceed 50 stops per day; the UI warns the dispatcher before exceeding this limit |

---

## Business Rules

| # | Rule |
|---|------|
| BR-1 | `DRIVER` role has a strict permission subset: read assigned shipments, update status on assigned shipments, view own manifest — no access to other users' data, pricing, or admin settings |
| BR-2 | Route optimisation uses the **nearest-neighbour heuristic** as baseline; the mapping API is used for accurate travel-time estimates |
| BR-3 | Shipments with a scheduled pickup window (US-004) must be sequenced **before** drop-off stops in the driver's manifest |
| BR-4 | A dispatcher can manually override the optimised sequence by dragging stops within a driver's column; the override is preserved and not re-optimised automatically |
| BR-5 | If the mapping API is unavailable, assignments can still be saved but route optimisation is disabled with a clear warning; manifests are generated without map order |
| BR-6 | Completed manifests (all stops `DELIVERED` or `FAILED`) are archived and retained for 90 days for performance auditing |
| BR-7 | A driver can be assigned to only one active manifest per day; attempting to assign to a second date requires the first to be completed or explicitly closed by a dispatcher |
