---
sidebar_position: 5
---

# Shipping

## Overview

Shipping is the final DC operation — completed pallets are loaded onto trailers for delivery to stores. The shipping process includes load planning, dock door assignment, staging, loading, and departure management. On-time trailer departures are critical to meeting store delivery windows.

## Shipping Process Flow

```mermaid
graph LR
    A[Pallets Staged] --> B[Load Plan Created]
    B --> C[Dock Door Assigned]
    C --> D[Trailer Spotted at Door]
    D --> E[Load Trailer]
    E --> F[Verify Load]
    F --> G[Seal & Depart]
    G --> H[BOL & ASN Transmitted]
```

## Load Planning

Load planning determines how orders are grouped onto trailers for efficient delivery:

- **Route-based loading** — Orders for stores on the same delivery route are loaded together
- **Stop sequence** — Pallets loaded in reverse stop sequence (last stop loaded first, first stop loaded last) for efficient unloading
- **Temperature segregation** — Ambient, refrigerated, and frozen products loaded on appropriate trailer types
- **Weight and cube optimization** — Maximize trailer utilization while staying within weight limits
- **Multi-stop vs. single-stop** — High-volume stores may warrant dedicated trailers; smaller stores share routes

### Trailer Types

| Trailer Type | Temp Range | Used For |
|---|---|---|
| **Dry Van** | Ambient | Grocery, GM, household |
| **Reefer (Single-Temp)** | 34°F-38°F or ≤0°F | Dairy/produce or frozen |
| **Reefer (Multi-Temp)** | Multiple zones | Mixed refrigerated and frozen |
| **Flatbed** | Ambient | Oversized items (patio furniture, grills) |

## Dock Door Assignment

Outbound dock doors are assigned based on:
- Route/carrier designation
- Trailer type availability
- Zone proximity to staged pallets (minimize travel distance)
- Door capacity and scheduling

## Staging Process

1. **Wave completion** — All pallets for a route/load are picked and wrapped
2. **Lane assignment** — Pallets staged in outbound lanes organized by route/stop
3. **Verification** — Pallet labels scanned to confirm correct staging location
4. **Sequencing** — Pallets arranged in load sequence (reverse stop order)

## Loading

- Forklifts load pallets onto trailer from staging lanes
- Each pallet scanned during loading to confirm manifest
- Driver or yard jockey positions trailer at assigned door
- Load locks and/or air bags used to secure freight in transit
- Temperature check performed on reefer trailers before loading begins

## Shipping Documentation

| Document | Purpose |
|---|---|
| **Bill of Lading (BOL)** | Legal shipping document listing contents, origin, destination |
| **Manifest** | Detailed list of all pallets, cases, and items on the trailer |
| **Seal Number** | Security seal recorded for tamper evidence |
| **Temperature Log** | Reefer trailer temperature set point and pre-cool verification |
| **Delivery Receipt** | Signed by store upon delivery as proof of delivery |

## Carrier and Fleet Coordination

- **Private fleet** — Meijer's own trucks and drivers handle a significant portion of DC-to-store deliveries
- **Common carriers** — Third-party carriers used for overflow, long-haul, and specialized freight
- **Carrier pickup scheduling** — Carriers have assigned pickup windows; late pickups escalated to transportation team
- **Yard management** — Trailer parking, spotting, and gate management in the DC yard

## Store Delivery Windows

Each store has defined delivery windows:

| Delivery Type | Typical Window | Notes |
|---|---|---|
| **Overnight/Early AM** | 10:00 PM - 6:00 AM | Preferred for grocery DCs; stock before store opens |
| **Day Delivery** | 6:00 AM - 2:00 PM | GM and specialty deliveries |
| **Frozen/Dairy** | Scheduled per route | Must be received promptly for cold chain |

Stores are notified of expected delivery times and any delays through automated dispatch notifications.

## Shipping Metrics

| Metric | Description | Target |
|---|---|---|
| **On-Time Departure** | % of loads departing within planned window | ≥97% |
| **Trailer Utilization** | % of trailer cube/weight capacity used | ≥90% |
| **Loading Accuracy** | % of loads with correct pallets/no mis-loads | ≥99.5% |
| **Seal Integrity** | % of loads arriving with intact seals | 100% |
| **Dock-to-Departure Time** | Avg time from staging complete to trailer departure | <90 minutes |
