---
sidebar_position: 2
---

# Vendor Management

## Overview

Vendor management at Meijer covers the ongoing relationship, performance tracking, compliance, and communication with suppliers after onboarding. The goal is to maintain strong supplier partnerships while ensuring consistent product quality, on-time delivery, and adherence to Meijer's operational standards.

## Vendor Performance Scorecards

Suppliers are measured on key performance indicators (KPIs) across several dimensions:

### Delivery Performance
| Metric | Description | Target |
|---|---|---|
| **On-Time Delivery** | % of POs delivered within the agreed delivery window | ≥95% |
| **Fill Rate** | % of ordered units actually shipped | ≥98% |
| **ASN Accuracy** | % of ASNs matching physical shipment | ≥98% |
| **ASN Timeliness** | % of ASNs sent before shipment arrival | ≥99% |

### Quality Metrics
| Metric | Description | Target |
|---|---|---|
| **Damage Rate** | % of units received with damage | <1% |
| **Defect Rate** | % of units with quality defects | <0.5% |
| **Recall Incidents** | Number of product recalls per year | 0 |
| **Shelf Life Compliance** | % of perishables meeting minimum remaining shelf life | ≥95% |

### Compliance Metrics
| Metric | Description | Target |
|---|---|---|
| **Labeling Accuracy** | Correct UPC, case codes, nutritional info | 100% |
| **Packaging Compliance** | Meets Meijer packaging specifications | 100% |
| **EDI Compliance** | Timely and accurate EDI transactions | ≥99% |
| **Documentation** | Complete and accurate shipping documents | 100% |

## Compliance Requirements

### Labeling Standards
- **UPC/GTIN** — All items must have valid GS1-compliant barcodes
- **Case Codes** — ITF-14 barcodes on shipping cases
- **GS1-128 Labels** — Required on pallets with SSCC, lot, and expiration data
- **Nutritional Labeling** — FDA-compliant nutrition facts panels on all food items
- **Allergen Declarations** — Clear allergen callouts per FDA requirements

### Packaging Specifications
- Pallet configuration (Ti x Hi) must match item master data
- Shipping cases must withstand standard stacking and handling
- Temperature-sensitive items require appropriate insulation and cold chain packaging
- Packaging must comply with Meijer's sustainability guidelines where applicable

### Delivery Windows
- Each DC has defined appointment windows for receiving
- Vendors must schedule delivery appointments in advance
- Early and late deliveries are tracked and may incur chargebacks
- Appointment scheduling is managed through the vendor portal or EDI

## Chargeback and Penalty Structure

Non-compliant shipments may incur chargebacks:

| Violation | Chargeback |
|---|---|
| Missing or inaccurate ASN | Per-shipment fee |
| Delivery outside appointment window | Per-occurrence fee |
| Incorrect labeling (UPC, case code) | Per-case fee |
| Pallet configuration non-compliance | Per-pallet fee |
| Short shipment without advance notice | Cost of lost sales + administrative fee |
| Unauthorized substitutions | Full cost of substituted product |

Vendors receive chargeback notifications and have a defined dispute resolution process.

## Communication Protocols

### Vendor Portal
Meijer provides a vendor portal for self-service access to:
- Purchase order visibility and status
- Invoice and payment status
- Performance scorecard review
- Item and assortment management
- Promotional calendar and event management

### EDI Communication
Primary business document exchange occurs via EDI:
- **850** — Purchase Orders
- **855** — PO Acknowledgments
- **856** — Advance Ship Notices
- **810** — Invoices
- **860** — PO Changes

See [EDI Overview](/docs/systems/integrations/edi/overview) for specifications.

### Escalation Path
1. **Day-to-day issues** — Category analyst / buyer
2. **Performance concerns** — Category manager
3. **Compliance violations** — Vendor compliance team
4. **Strategic issues** — Director of Procurement / VP

## Vendor Onboarding and Offboarding

### Onboarding Checklist
- Vendor master data created (legal name, remit-to address, tax ID)
- EDI setup and testing completed (all required transaction sets)
- Item master data loaded (UPC, description, pack size, cost, dimensions)
- Compliance documentation received (insurance, certifications, food safety)
- Logistics setup (ship-from locations, lead times, pallet configurations)
- Payment terms agreed and configured
- Initial PO placed and successfully fulfilled

### Offboarding
When a vendor relationship ends:
1. Remaining POs are fulfilled or cancelled
2. Open invoices are settled
3. Vendor portal access is deactivated
4. EDI connections are terminated
5. Item master records are end-dated (not deleted, for audit purposes)
