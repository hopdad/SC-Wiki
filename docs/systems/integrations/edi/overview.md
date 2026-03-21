---
sidebar_position: 1
---

# EDI Overview

## Overview

Electronic Data Interchange (EDI) is the primary method for exchanging structured business documents with suppliers and carriers.

## What is EDI?

EDI replaces paper-based documents (purchase orders, invoices, shipping notices) with standardized electronic formats. Meijer uses ANSI X12 standards.

## Key Transaction Sets

| Transaction | Code | Direction | Purpose |
|---|---|---|---|
| Purchase Order | 850 | Outbound | Send orders to suppliers |
| PO Acknowledgment | 855 | Inbound | Supplier confirms/rejects order |
| Advance Ship Notice | 856 | Inbound | Supplier notifies shipment details |
| Invoice | 810 | Inbound | Supplier billing |
| Load Tender | 204 | Outbound | Request carrier for shipment |
| Shipment Status | 214 | Inbound | Carrier tracking updates |
| Freight Invoice | 210 | Inbound | Carrier billing |
| Inventory Inquiry | 846 | Both | Inventory availability |
| Functional Ack | 997 | Both | Confirm receipt of transaction |

See [Transaction Sets](/docs/systems/integrations/edi/transaction-sets) for detailed specifications.

## EDI Infrastructure

- **VAN (Value-Added Network)** — *Document VAN provider and connectivity*
- **AS2** — *Document AS2 connections for direct trading partners*
- **SFTP** — *Document SFTP-based EDI exchanges*

## Related Docs

- [Transaction Sets](/docs/systems/integrations/edi/transaction-sets)
- [Trading Partners](/docs/systems/integrations/edi/trading-partners)
