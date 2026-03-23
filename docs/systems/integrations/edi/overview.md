---
sidebar_position: 1
---

# EDI Overview

## Overview

Electronic Data Interchange (EDI) is the primary method for exchanging structured business documents with suppliers and carriers. EDI compliance is a prerequisite for developing a supplier relationship with Meijer — all suppliers are required to exchange business documents electronically.

## What is EDI?

EDI replaces paper-based documents (purchase orders, invoices, shipping notices) with standardized electronic formats. Meijer uses **ANSI X12** standards for all EDI transactions.

## Key Transaction Sets

| Transaction | Code | Direction | Purpose |
|---|---|---|---|
| Purchase Order | 850 | Outbound | Send orders to suppliers |
| PO Acknowledgment | 855 | Inbound | Supplier confirms/rejects order |
| Advance Ship Notice | 856 | Inbound | Supplier notifies shipment details |
| Invoice | 810 | Inbound | Supplier billing |
| PO Change | 860 | Outbound | Modify existing PO |
| Credit/Debit Adjustment | 812 | Both | Chargebacks and adjustments |
| Load Tender | 204 | Outbound | Request carrier for shipment |
| Tender Response | 990 | Inbound | Carrier accepts/rejects tender |
| Shipment Status | 214 | Inbound | Carrier tracking updates |
| Freight Invoice | 210 | Inbound | Carrier billing |
| Inventory Inquiry | 846 | Both | Inventory availability |
| Functional Ack | 997 | Both | Confirm receipt of transaction |

### Minimum Supplier EDI Requirements

At minimum, all Meijer suppliers must support these transaction sets:
- **EDI 850** — Purchase Order (receive from Meijer)
- **EDI 856** — Advance Ship Notice (send to Meijer)
- **EDI 810** — Invoice (send to Meijer)

Vendors not set up for EDI can use **web forms** via the Meijer VendorNet portal as a temporary alternative.

See [Transaction Sets](/docs/systems/integrations/edi/transaction-sets) for detailed specifications.

## EDI Infrastructure

### Preferred Protocol: AS2
Meijer's preferred EDI communication protocol is **AS2** (Applicability Statement 2, EDIINT specification):
- Direct point-to-point encrypted HTTP connection
- SSL/TLS encryption + digital signatures + MDN (Message Disposition Notification) receipts
- No per-transaction VAN fees
- Real-time transmission

### VAN (Value-Added Network)
- Third-party network that routes EDI between trading partners
- Used by many suppliers who connect via their own VAN
- Handles connectivity to multiple partners with built-in error checking and archival

### Web Forms (VendorNet)
- Available via **vendornet.meijer.com** for suppliers not yet EDI-capable
- Manual entry alternative — not suitable for high-volume partners
- Vendors should transition to full EDI as soon as possible

## GS1 and Labeling Standards

Meijer requires compliance with GS1 standards for product identification:

| Standard | Requirement |
|---|---|
| **GTIN** (Global Trade Item Number) | Required on all products for unique identification |
| **SSCC-18** | Required on physical pallet labels; must match SSCC-18 in EDI 856 ASN |
| **GS1-128** barcode | Required on pallet labels with SSCC, lot, and expiration data |
| **GS1 Company Prefix** | Vendors must have a GS1 US GTIN or GS1 Company Prefix |
| **ITF-14** | Required on shipping cases |

## Meijer Supplier Guide

Meijer publishes a comprehensive **Supplier Guide** covering:
- Supply chain performance standards
- Shipping and delivery requirements
- Labeling and marking of cartons
- EDI requirements and specifications
- Invoicing and payment procedures
- Non-conforming goods procedures

The Supplier Guide is available on [Meijer VendorNet](https://vendornet.meijer.com).

## EDI Integration Providers

Several third-party providers offer Meijer EDI compliance solutions for suppliers:
- TrueCommerce
- SPS Commerce
- Cleo
- Effective Data
- Stedi

## Related Docs

- [Transaction Sets](/docs/systems/integrations/edi/transaction-sets)
- [Trading Partners](/docs/systems/integrations/edi/trading-partners)
