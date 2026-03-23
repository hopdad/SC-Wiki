---
sidebar_position: 4
---

# Picking & Packing

## Overview

Picking and packing is the core fulfillment process within the distribution center. Store orders are assembled by selecting the correct products from storage locations, building pallets according to store-specific requirements, and staging completed orders for shipping.

## Order Fulfillment Flow

```mermaid
graph LR
    A[Store Orders Released] --> B[Wave Planning]
    B --> C[Task Assignment]
    C --> D[Pick Product]
    D --> E[Build Pallet]
    E --> F[Wrap & Label]
    F --> G[Stage for Shipping]
```

## Pick Methodologies

| Method | Description | Best For |
|---|---|---|
| **Wave Picking** | Orders grouped into waves by delivery route/store; all tasks in a wave released together | Standard DC-to-store fulfillment |
| **Batch Picking** | Picker works on multiple orders simultaneously, picking common items in a single pass | Small-item picking with high overlap |
| **Zone Picking** | Warehouse divided into zones; pickers work within assigned zone; pallets move between zones | Large DCs with diverse product types |
| **Discrete Picking** | One picker completes one order at a time from start to finish | Small orders, e-commerce items |

### Wave Planning
Waves are typically planned based on:
- Store delivery schedule and route departure times
- Product temperature zones (ambient, refrigerated, frozen)
- DC capacity and labor availability
- Priority orders (e.g., promotional loads, new store openings)

## Pick Technologies

### Voice Picking
- Operators wear a headset connected to a voice-directed picking system
- System verbally directs picker to location and quantity
- Picker confirms with voice commands (check digits, quantity confirmation)
- Hands-free and eyes-free operation improves safety and speed
- Used primarily in case-pick and each-pick operations

### RF Scanning
- Handheld RF (radio frequency) barcode scanners connected to the WMS
- Picker scans location barcode, then item barcode to confirm pick
- Quantity entered on device screen
- Used for pallet picking, receiving, putaway, and cycle counting

### Pick-to-Light
- Light displays at pick face locations indicate quantity to pick
- Operator picks indicated quantity and presses confirmation button
- High-speed, low-error method for high-velocity each-picking

## Pick Path Optimization

The WMS optimizes pick paths to minimize travel time:
- Picks sequenced to follow a serpentine path through the pick zone
- Heavy/large items picked first for pallet base stability
- Crushable items (bread, chips, eggs) picked last
- Temperature-sensitive items picked based on zone sequence to minimize exposure

## Pallet Building Rules

Store-bound pallets must be built to specific standards:

| Rule | Requirement |
|---|---|
| **Weight limit** | Max 2,500 lbs per pallet |
| **Height limit** | Max 60" above pallet (5 ft stack height) |
| **Stability** | Heavy items on bottom, light items on top |
| **Crushability** | Fragile items on top layers; never under heavy cases |
| **Store department** | Group by department when possible (grocery, dairy, frozen) |
| **Aisle sequence** | Build in store aisle order when supported by wave plan |

## Packing Standards

| Product Type | Packing Requirement |
|---|---|
| **Ambient grocery** | Standard stretch wrap; store/route label on two sides |
| **Refrigerated** | Thermal blanket wrap if transit exceeds 2 hours; reefer trailer required |
| **Frozen** | Ship within frozen zone trailer; no ambient exposure during staging |
| **General merchandise** | Corner protection for large items; shrink wrap for small-case pallets |
| **Fragile items** | Additional wrap layers; "FRAGILE" label applied |

## Quality Checks

- **Pick accuracy audits** — Random pallets audited before shipping; target ≥99.5% accuracy
- **Weight verification** — Pallet weighed at wrap station; significant deviation triggers re-check
- **Label verification** — Correct store number, route, and stop sequence on pallet labels
- **Temperature checks** — Refrigerated and frozen pallets verified before loading

## Productivity Metrics

| Metric | Description | Typical Target |
|---|---|---|
| **Cases Per Hour (CPH)** | Picking productivity per operator | Varies by pick type (100-250 CPH) |
| **Pick Accuracy** | % of picks without errors | ≥99.5% |
| **Wave Completion Rate** | % of waves completed on time | ≥98% |
| **Pallet Utilization** | Average % of pallet capacity used | ≥85% |
| **Lines Per Hour** | Number of order lines completed per hour | Varies by pick type |
