---
sidebar_position: 1
---

# Routing

## Overview

Transportation routing determines how products move from Meijer's distribution centers to 500+ stores across the Midwest. The routing process balances delivery window requirements, trailer utilization, driver hours, fuel costs, and seasonal variations to create efficient delivery plans.

## Route Planning Process

```mermaid
graph LR
    A[Store Orders Finalized] --> B[Route Optimization Engine]
    B --> C[Route Plans Generated]
    C --> D[Dispatcher Review]
    D --> E[Load Tendering]
    E --> F[Route Execution]
    F --> G[Performance Tracking]
```

## Route Types

| Route Type | Description | Typical Use |
|---|---|---|
| **Dedicated Routes** | Fixed routes running on a regular schedule to the same stores | High-volume stores, daily deliveries |
| **Dynamic Routes** | Routes optimized daily based on order volume and constraints | Variable-demand periods, smaller stores |
| **Multi-Stop** | Single trailer delivers to 2-5 stores per trip | Stores with lower volume on shared corridors |
| **Direct/Full Truckload** | Dedicated trailer for a single high-volume store | Supercenters with large orders |
| **Backhaul** | Return trip from store delivery used to pick up from nearby suppliers | Reducing empty miles, vendor pickups |
| **Shuttle** | Short, frequent runs between DC and nearby stores or satellite locations | Local distribution |

## Route Optimization

The TMS routing engine considers multiple factors when building routes:

### Hard Constraints (Must Be Satisfied)
- Store delivery windows (arrival time requirements)
- Driver Hours of Service (HOS) regulations — 11 hours driving, 14 hours on-duty max
- Trailer type matching (dry, reefer, multi-temp)
- Maximum weight limits (80,000 lbs gross vehicle weight)
- Road restrictions (bridge clearances, prohibited routes)

### Soft Constraints (Optimized)
- Total route distance and drive time
- Fuel consumption
- Trailer cube and weight utilization
- Driver familiarity with route
- Balanced workload across drivers
- Minimize number of routes/trailers needed

## Delivery Window Management

Stores have assigned delivery windows based on:
- Store operating hours and receiving staff availability
- Product type (frozen/dairy may have different windows than grocery/GM)
- Local noise ordinances and traffic patterns
- Dock door availability at the store

| Window Type | Hours | Typical Products |
|---|---|---|
| **Early Morning** | 4:00 AM - 8:00 AM | Grocery, fresh, dairy |
| **Morning** | 8:00 AM - 12:00 PM | GM, seasonal, specialty |
| **Afternoon** | 12:00 PM - 4:00 PM | Backfill deliveries, small loads |
| **Overnight** | 10:00 PM - 4:00 AM | High-volume stores, preferred window |

## Fuel and Mileage Optimization

- **Right-sizing routes** — Consolidate partial loads where possible
- **Backhaul utilization** — Schedule vendor pickups on return legs
- **Fuel-efficient routing** — Avoid congestion, prefer highways over surface streets
- **Speed management** — Fleet governed at 65 mph for fuel efficiency
- **Idle reduction** — Anti-idle policies and APU (auxiliary power units) for reefers

## Seasonal and Weather Adjustments

| Factor | Adjustment |
|---|---|
| **Holiday surges** | Additional routes and trailers; extended DC operating hours |
| **Winter weather** | Buffer time added to routes; alternative route planning for snow/ice |
| **Construction season** | Route detours pre-programmed; added transit time |
| **Promotional events** | Extra loads scheduled for ad-break inventory builds |

## Route Compliance and Tracking

- **GPS tracking** — All fleet vehicles and carrier trailers tracked in real-time
- **Geofencing** — Automated arrival/departure notifications at DCs and stores
- **Route adherence** — Planned vs. actual route comparison for compliance monitoring
- **ETA updates** — Real-time estimated arrival times pushed to stores
- **Exception alerts** — Late departures, route deviations, and missed windows flagged to dispatch

## Routing Metrics

| Metric | Description | Target |
|---|---|---|
| **On-Time Delivery** | % of deliveries arriving within window | ≥95% |
| **Miles Per Stop** | Average distance between delivery stops | Minimize |
| **Trailer Utilization** | % of cube/weight capacity used | ≥90% |
| **Empty Miles** | % of total miles driven without freight | <15% |
| **Cost Per Case Delivered** | Transportation cost divided by cases shipped | Minimize |
| **Route Adherence** | % of routes following planned path | ≥95% |
