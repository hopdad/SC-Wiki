---
sidebar_position: 2
---

# WMS Configuration

## Overview

WMS configuration controls how the system behaves across warehouses, zones, locations, users, and devices. Configuration changes follow a change management process to ensure stability and traceability.

## System Parameters

Global parameters that affect system-wide behavior:

| Parameter | Description | Typical Value |
|---|---|---|
| **Default Putaway Strategy** | Default logic for location assignment | Directed |
| **FIFO/FEFO Mode** | Inventory rotation enforcement | FEFO for perishables, FIFO for others |
| **Wave Release Mode** | Automatic vs. manual wave release | Automatic for scheduled waves |
| **Task Interleaving** | Allow combining different task types in one trip | Enabled |
| **Cycle Count Tolerance** | Allowed variance before requiring recount | ±2% or ±1 unit |
| **Receipt Overshipment Tolerance** | Max % over PO quantity accepted | 5% |
| **ASN Required** | Whether ASN is required for receiving | Yes (configurable by vendor) |
| **License Plate Tracking** | Track inventory at LPN/pallet level | Enabled |

## Warehouse / Facility Setup

Each distribution center is configured as a separate facility in the WMS:

### Facility Master Data
- Facility code and name
- Physical address
- Time zone
- Operating hours and shift definitions
- Dock door count and numbering
- Contact information

### Zone Configuration
Zones represent physical or logical areas within the warehouse:

| Zone Type | Purpose | Example |
|---|---|---|
| **Receiving** | Inbound dock and staging | RECV-01, RECV-02 |
| **Ambient Storage** | Room-temperature reserve and pick | AMB-RESERVE, AMB-PICK |
| **Refrigerated** | Cooler areas (34-38°F) | REF-01 |
| **Frozen** | Freezer areas (-10 to 0°F) | FRZ-01 |
| **Cross-Dock** | Flow-through for immediate shipping | XDOCK-01 |
| **Shipping** | Outbound dock and staging | SHIP-01, SHIP-02 |
| **Returns** | Inbound returns processing | RTN-01 |
| **QA Hold** | Quarantine area for quality issues | QA-HOLD |

### Location Configuration

Each storage location has defined attributes:

| Attribute | Description |
|---|---|
| **Location ID** | Unique identifier (e.g., AMB-A01-03-02 = Ambient, Aisle A01, Bay 03, Level 02) |
| **Location Type** | Reserve, Pick Face, Floor, Staging, Dock Door |
| **Zone** | Parent zone assignment |
| **Dimensions** | Width, depth, height in inches |
| **Weight Capacity** | Maximum weight in lbs |
| **Temperature Zone** | Ambient, Refrigerated, Frozen |
| **Velocity Class** | A (fast), B (medium), C (slow) — drives slotting |
| **Pick Sequence** | Order in pick path traversal |
| **Status** | Active, Inactive, Locked |

## User and Role Configuration

### Role Definitions
Roles are configured with specific screen access and transaction permissions:

| Permission | Operator | Lead | Planner | Admin |
|---|---|---|---|---|
| Execute pick/putaway tasks | Yes | Yes | No | No |
| View inventory | Yes | Yes | Yes | Yes |
| Adjust inventory | No | Yes | Yes | Yes |
| Plan waves | No | No | Yes | Yes |
| Reassign tasks | No | Yes | Yes | Yes |
| Configure locations | No | No | No | Yes |
| Manage users | No | No | No | Yes |
| View reports | No | Yes | Yes | Yes |

### User Setup
- Users authenticated via Active Directory / SSO integration
- Role assigned based on job function
- Zone restrictions can limit operator to specific warehouse areas
- Equipment qualifications tracked (forklift certified, voice picking trained)

## Device Configuration

### RF Scanners
- Connected via warehouse Wi-Fi network
- WMS client application deployed to device
- Screen layouts configured per task type
- Barcode symbologies enabled: Code 128, GS1-128, ITF-14, UPC-A, EAN-13, QR

### Voice Picking
- Voice terminals paired with headsets
- Voice profiles created per operator (speech recognition training)
- Vocabulary configured per workflow (check digits, quantities, confirmations)
- Fallback to RF scanning if voice system unavailable

### Printers
- Label printers at receiving, packing, and shipping stations
- Printer assignments by zone and station
- Label formats: pallet labels (GS1-128/SSCC), shipping labels, BOL, pick lists

## Configuration Change Management

All configuration changes follow a controlled process:

1. **Change request** — Documented with business justification
2. **Impact analysis** — Review downstream effects on operations and integrations
3. **Dev/QA testing** — Change applied and validated in non-production environments
4. **Approval** — Operations and IT management approve
5. **Implementation** — Applied to production during a maintenance window or low-activity period
6. **Verification** — Post-change validation confirms expected behavior
7. **Rollback plan** — Documented steps to revert if issues arise
