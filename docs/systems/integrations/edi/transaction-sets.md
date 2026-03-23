---
sidebar_position: 2
---

# EDI Transaction Sets

## Overview

Detailed specifications for each EDI transaction set used by Meijer. All transactions follow ANSI X12 standards. This document covers the purpose, key segments, and processing rules for each transaction type.

## Procurement Transactions

### 850 — Purchase Order

The outbound purchase order is the primary mechanism for ordering products from suppliers.

| Attribute | Detail |
|---|---|
| **Direction** | Outbound (Meijer → Supplier) |
| **Trigger** | PO created and approved in ordering system |
| **Frequency** | Daily; hundreds per day |

**Key Segments:**

| Segment | Purpose |
|---|---|
| **BEG** | Beginning segment: PO number, date, type (new/change) |
| **DTM** | Date/time: requested delivery date, ship-by date |
| **N1/N3/N4** | Name/address: ship-to location (DC), bill-to |
| **PO1** | Line item: item ID (GTIN/UPC), quantity ordered, unit price, UOM |
| **PID** | Product description |
| **CTT** | Transaction totals: line count, hash total |

**Processing Rules:**
- One PO per vendor per DC per delivery date
- Items identified by GTIN-14 (case level) or GTIN-12 (UPC)
- Quantities expressed in cases (CA) unless otherwise specified
- Prices reflect current vendor cost file
- Duplicate PO numbers rejected by supplier systems

### 855 — Purchase Order Acknowledgment

Supplier confirms or modifies the purchase order.

| Attribute | Detail |
|---|---|
| **Direction** | Inbound (Supplier → Meijer) |
| **Trigger** | Supplier receives and processes PO |
| **Expected Response** | Within 24 hours of PO receipt |

**Key Segments:**

| Segment | Purpose |
|---|---|
| **BAK** | Acknowledgment type: accepted (AC), accepted with changes (AD), rejected (RJ) |
| **DTM** | Estimated ship date, estimated delivery date |
| **PO1** | Line item acknowledgment: quantity acknowledged, status per line |
| **ACK** | Line item status: accepted (IA), rejected (IR), quantity change (IQ), date change (ID) |

**Processing Rules:**
- If status = AC (accepted): PO confirmed; no changes
- If status = AD (accepted with changes): buyer notified; PO updated with new quantities/dates
- If status = RJ (rejected): PO flagged; buyer investigates and re-sources
- Unacknowledged POs after 48 hours generate alerts

### 860 — Purchase Order Change

Modifications to an existing purchase order.

| Attribute | Detail |
|---|---|
| **Direction** | Outbound (Meijer → Supplier) |
| **Trigger** | Buyer modifies or cancels PO lines |

**Supported Changes:**
- Quantity increase or decrease
- Line item cancellation
- Delivery date change
- Full PO cancellation

## Shipping & Receiving Transactions

### 856 — Advance Ship Notice (ASN)

The ASN is a critical transaction that enables automated receiving at the DC.

| Attribute | Detail |
|---|---|
| **Direction** | Inbound (Supplier → Meijer) |
| **Trigger** | Supplier ships product against a PO |
| **Required Timing** | Must be received before shipment arrives at DC |

**Key Segments:**

| Segment | Purpose |
|---|---|
| **BSN** | Shipment ID, date, time, type |
| **DTM** | Ship date, estimated delivery date |
| **HL** | Hierarchical level: Shipment → Order → Tare (pallet) → Pack (case) → Item |
| **TD1/TD5** | Transportation details: carrier, trailer number, weight |
| **REF** | References: PO number, BOL number |
| **MAN** | Marks and numbers: SSCC barcode (Serial Shipping Container Code) |
| **SN1** | Item detail: quantity shipped, UOM |
| **LIN** | Item identification: UPC, GTIN, vendor item number |

**Hierarchy Structure:**
```
Shipment (HL level S)
  └── Order (HL level O) — references PO number
       └── Tare / Pallet (HL level T) — SSCC barcode
            └── Pack / Case (HL level P)
                 └── Item (HL level I) — GTIN, quantity, lot, expiration
```

**Requirements:**
- SSCC barcode required on every pallet (GS1-128 format)
- Lot numbers and expiration dates required for perishable items
- ASN must match PO line items and quantities
- Missing or late ASNs result in vendor chargebacks

### 846 — Inventory Inquiry/Advice

Used to exchange inventory availability information between Meijer and suppliers.

| Attribute | Detail |
|---|---|
| **Direction** | Both directions |
| **Use Case** | Vendor-managed inventory (VMI), availability checks |
| **Frequency** | Daily or on-demand |

## Financial Transactions

### 810 — Invoice

Supplier billing for goods shipped and received.

| Attribute | Detail |
|---|---|
| **Direction** | Inbound (Supplier → Meijer) |
| **Trigger** | After shipment and/or delivery |

**Key Segments:**

| Segment | Purpose |
|---|---|
| **BIG** | Invoice number, date, PO reference |
| **IT1** | Line item: item ID, quantity invoiced, unit price |
| **TDS** | Total invoice amount |
| **CAD** | Carrier detail (if freight billed) |
| **ISS** | Invoice summary: total quantity, weight |

**Processing:**
- Three-way match: PO ↔ Receipt ↔ Invoice
- Invoices within tolerance auto-approved for payment
- Price or quantity discrepancies held for resolution
- Payment per vendor payment terms (typically net 30)

### 812 — Credit/Debit Adjustment

Used for chargebacks, vendor credits, and billing adjustments.

| Attribute | Detail |
|---|---|
| **Direction** | Both directions |
| **Use Cases** | Vendor compliance chargebacks, return credits, pricing adjustments, promotional allowances |

## Transportation Transactions

### 204 — Motor Carrier Load Tender

Electronically tender loads to carriers.

| Attribute | Detail |
|---|---|
| **Direction** | Outbound (Meijer → Carrier) |
| **Trigger** | Load built and ready for tender in TMS |

**Key Data:** Shipment ID, origin (DC), destination(s) (stores), pickup/delivery windows, equipment type, weight, pallet count, special instructions.

### 214 — Transportation Carrier Shipment Status

Carrier provides shipment tracking updates.

| Attribute | Detail |
|---|---|
| **Direction** | Inbound (Carrier → Meijer) |
| **Frequency** | At each status milestone |

**Common Status Codes:**

| Code | Description |
|---|---|
| AF | Carrier picked up shipment |
| OA | Out for delivery |
| X3 | Arrived at delivery location |
| D1 | Delivered |
| SE | Shipment exception / delay |

### 210 — Motor Carrier Freight Invoice

Carrier billing for transportation services.

| Attribute | Detail |
|---|---|
| **Direction** | Inbound (Carrier → Meijer) |
| **Processing** | Freight audit matches invoice to contracted rates before payment |

## Control Transactions

### 997 — Functional Acknowledgment

Confirms receipt and syntactic correctness of an EDI transaction.

| Attribute | Detail |
|---|---|
| **Direction** | Both directions |
| **Trigger** | Automatically generated upon receiving any transaction set |

**Key Segments:**

| Segment | Purpose |
|---|---|
| **AK1** | Functional group acknowledged (transaction set type) |
| **AK2/AK3/AK4** | Transaction set / segment / element error detail |
| **AK5** | Transaction set acknowledgment: Accepted (A), Accepted with Errors (E), Rejected (R) |
| **AK9** | Functional group response: accepted/rejected count |

**Processing:**
- 997 with acceptance = transaction received and valid
- 997 with errors = review error detail; fix and retransmit if rejected
- Missing 997 after SLA = alert generated; investigate connectivity

### 999 — Implementation Acknowledgment

Extended version of 997 that validates against implementation guide (IG) specifications.

| Attribute | Detail |
|---|---|
| **Direction** | Both directions |
| **Use** | Validates data content against Meijer's specific implementation guide, not just X12 syntax |
| **Processing** | Similar to 997 but provides implementation-level error detail |
