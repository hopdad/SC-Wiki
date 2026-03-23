---
sidebar_position: 3
---

# WMS Workflows

## Overview

This document describes the key business workflows managed by the WMS, from inbound receiving through outbound shipping. Each workflow includes the system steps, operator interactions, and integration touchpoints.

## Inbound Receiving Workflow

```mermaid
graph TD
    A[ASN Received via EDI 856] --> B[Carrier Check-In at Gate]
    B --> C[Dock Door Assignment]
    C --> D[Trailer Spotted at Door]
    D --> E[Operator Opens Receipt]
    E --> F[Scan Pallet LPN / SSCC]
    F --> G{ASN Match?}
    G -->|Yes| H[Confirm Receipt]
    G -->|No| I[Exception: Manual Reconciliation]
    I --> H
    H --> J[Putaway Task Created]
    J --> K[Receipt Complete → Notify Inventory Systems]
```

### Key Steps
1. **ASN pre-receipt** — EDI 856 creates expected receipt in WMS before carrier arrival
2. **Check-in** — Guard/gate confirms carrier, assigns appointment
3. **Door assignment** — WMS or yard management assigns dock door based on product type
4. **Pallet scanning** — Operator scans GS1-128 / SSCC barcode on each pallet
5. **Validation** — System matches scanned data against ASN (item, quantity, lot, expiration)
6. **Exceptions** — Mismatches flagged; operator or supervisor resolves (accept, reject, adjust)
7. **Completion** — Receipt closed; inventory available; putaway tasks generated

## Putaway Workflow

```mermaid
graph TD
    A[Putaway Task Assigned] --> B[Operator Picks Up Pallet]
    B --> C[Travel to Directed Location]
    C --> D[Scan Location Barcode]
    D --> E{Correct Location?}
    E -->|Yes| F[Deposit Pallet]
    E -->|No| G[System Redirects]
    G --> C
    F --> H[Confirm in WMS]
    H --> I[Inventory Updated at Location]
```

### Putaway Logic
- WMS evaluates item attributes (size, weight, velocity, temperature) against available locations
- Priority: pick face replenishment > zone-directed > closest available
- Operator confirms deposit by scanning location barcode
- System updates inventory position in real-time

## Wave Planning and Order Allocation

```mermaid
graph TD
    A[Store Orders Received] --> B[Order Pool]
    B --> C[Wave Planner Groups Orders]
    C --> D[Wave Released]
    D --> E[Inventory Allocated]
    E --> F[Pick Tasks Created]
    F --> G[Tasks Assigned to Operators]
```

### Wave Planning Process
1. **Order import** — Store replenishment orders received from inventory systems
2. **Wave grouping** — Orders grouped by route, departure time, and temperature zone
3. **Allocation** — System reserves (allocates) inventory for the wave from available stock
4. **Task creation** — Individual pick tasks generated per item/location
5. **Task release** — Tasks made available to operators in priority order
6. **Monitoring** — Planner monitors wave progress; manages exceptions (short picks, re-allocations)

### Wave Grouping Criteria
| Criterion | Description |
|---|---|
| Route / Carrier | All stores on a route grouped together |
| Departure cutoff | Wave must complete before trailer departure time |
| Temperature zone | Separate waves for ambient, refrigerated, frozen |
| Product type | GM and grocery may wave separately |
| Priority | Rush orders or promotional builds wave first |

## Pick / Pack / Ship Workflow

```mermaid
graph TD
    A[Pick Task Assigned] --> B[Operator Travels to Location]
    B --> C[Confirm Location - Check Digit/Scan]
    C --> D[Pick Quantity]
    D --> E[Place on Pallet]
    E --> F{More Picks?}
    F -->|Yes| B
    F -->|No| G[Travel to Packing Station]
    G --> H[Stretch Wrap Pallet]
    H --> I[Apply Pallet Label]
    I --> J[Move to Shipping Lane]
    J --> K[Load onto Trailer]
    K --> L[Confirm Load Complete]
    L --> M[Trailer Dispatched]
```

### Picking
- Voice-directed or RF-directed depending on zone and pick type
- Operator confirms each pick with check digit (voice) or barcode scan (RF)
- Short picks reported immediately; system re-allocates if alternate inventory exists
- Pallet building rules enforced (heavy on bottom, crushable on top, weight limits)

### Packing
- Completed pallets moved to wrap station
- Stretch wrapped for transit stability
- Pallet label applied with: store number, route, stop sequence, pallet ID, weight
- Quality audit performed on random pallets

### Shipping
- Pallets staged in outbound lanes by route/stop
- Trailer loaded in reverse stop sequence
- Each pallet scanned during loading to confirm correct trailer
- Bill of Lading (BOL) generated upon load completion
- Trailer sealed; seal number recorded in WMS

## Cycle Count Workflow

```mermaid
graph TD
    A[Count Task Generated] --> B[Operator Travels to Location]
    B --> C[Count Physical Inventory]
    C --> D[Enter Count in WMS]
    D --> E{Within Tolerance?}
    E -->|Yes| F[Count Accepted]
    E -->|No| G[Recount Required]
    G --> H[Second Operator Counts]
    H --> I{Match?}
    I -->|Yes| J[Adjustment Applied]
    I -->|No| K[Supervisor Review]
    K --> J
    F --> L[Count Complete]
    J --> L
```

### Count Triggers
- Scheduled ABC counts (A-items counted more frequently)
- Negative on-hand detection
- Pick location empty unexpectedly
- Receipt discrepancy follow-up
- Annual physical inventory support

## Returns Processing Workflow

```mermaid
graph TD
    A[Returns Shipment Arrives] --> B[Receive & Scan Items]
    B --> C[Inspect Condition]
    C --> D{Disposition?}
    D -->|Restock| E[Putaway to Reserve]
    D -->|Vendor Return| F[Stage for Vendor Shipment]
    D -->|Damaged/Waste| G[Move to Damage Hold]
    D -->|Liquidation| H[Move to Salvage Area]
```

## Exception Handling

| Exception | WMS Behavior | Resolution |
|---|---|---|
| **Short pick** | Alert operator; check alternate locations | Re-allocate or short-ship |
| **Location mismatch** | Block transaction; require supervisor override | Investigate and correct data |
| **Inventory hold** | Prevent allocation of held inventory | Quality team releases or disposes |
| **System timeout** | Queue transaction for retry | Automatic retry; manual intervention if persistent |
| **Equipment failure** | Operator reports via exception screen | Reassign to alternate device; maintenance dispatch |
