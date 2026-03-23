---
sidebar_position: 3
---

# Contacts

Team contacts and escalation paths for supply chain systems and operations.

:::info Internal Contacts
Contact details below are placeholders. Replace with actual team names, email addresses, Slack channels, and manager names for your organization.
:::

## System Support Teams

| System | Team | Primary Contact | Escalation |
|---|---|---|---|
| **WMS** | WMS Support Team | #wms-support (Slack) / wms-support@meijer.com | WMS Team Lead → IT Manager |
| **TMS** | Transportation Systems | #tms-support (Slack) / tms-support@meijer.com | TMS Team Lead → IT Manager |
| **Inventory Systems** | Inventory & Replenishment | #inventory-support (Slack) / inv-support@meijer.com | Inventory Team Lead → IT Manager |
| **EDI / Integrations** | Integration Services | #edi-support (Slack) / edi-support@meijer.com | Integration Team Lead → IT Manager |
| **Store Systems** | Store Technology | #store-systems (Slack) / store-tech@meijer.com | Store Systems Lead → IT Manager |
| **BI / Analytics** | Business Intelligence | #bi-support (Slack) / bi-support@meijer.com | BI Team Lead → IT Manager |

## Escalation Matrix

| Severity | Definition | Response Time | Escalation Path |
|---|---|---|---|
| **P1 — Critical** | System down; operations halted; revenue impacting | 15 minutes | On-call engineer → Team lead → IT Director → VP of IT |
| **P2 — High** | Major function impaired; workaround exists | 1 hour | Support team → Team lead → IT Manager |
| **P3 — Medium** | Non-critical issue; minor operational impact | 4 hours | Support ticket → Assigned engineer |
| **P4 — Low** | Enhancement request; cosmetic issue; documentation | Next business day | Support ticket → Sprint backlog |

### P1 Criteria Examples
- WMS completely unavailable (no receiving, picking, or shipping)
- TMS cannot tender loads (deliveries will be missed)
- Replenishment engine failed to run (no store orders generated)
- EDI gateway down (no POs, ASNs, or invoices flowing)
- POS integration failure (sales data not flowing to inventory systems)

## On-Call Rotation

| System | On-Call Coverage | Contact Method |
|---|---|---|
| **WMS** | 24/7 | PagerDuty → On-call engineer |
| **TMS** | 24/7 | PagerDuty → On-call engineer |
| **Inventory Systems** | Business hours + nightly batch window | PagerDuty → On-call engineer |
| **EDI / Integrations** | 24/7 | PagerDuty → On-call engineer |
| **Store Systems** | Store operating hours (6 AM - 12 AM) | PagerDuty → On-call engineer |

### On-Call Responsibilities
- Respond to pages within 15 minutes
- Assess severity and begin troubleshooting
- Escalate per matrix if resolution not possible within response SLA
- Document incident in ticketing system
- Conduct post-incident review for P1/P2 issues

## Operations Teams

| Team | Responsibility | Primary Contact |
|---|---|---|
| **DC Operations** | Distribution center management, shift operations | DC Operations Manager |
| **Transportation / Dispatch** | Route execution, carrier coordination, fleet management | Transportation Manager |
| **Procurement / Buying** | Vendor relationships, PO management, category management | Category Manager |
| **Inventory Planning** | Demand forecasting, replenishment parameters, inventory optimization | Inventory Planning Manager |
| **Vendor Compliance** | Vendor performance, chargebacks, labeling standards | Vendor Compliance Manager |
| **Food Safety / QA** | Product quality, recalls, temperature compliance | Food Safety Manager |
| **Loss Prevention** | Shrink reduction, security, investigations | LP Manager |

## Vendor / Partner Contacts

| Vendor/Partner | Purpose | Contact Method |
|---|---|---|
| VAN Provider | EDI connectivity, mailbox issues, transaction routing | Vendor support portal / phone |
| WMS Vendor | Software support, patches, configuration assistance | Vendor support portal / phone |
| TMS Vendor | Software support, routing engine issues | Vendor support portal / phone |
| Telematics Provider | GPS tracking, device issues, data feeds | Vendor support portal |
| Delivery Partners (Shipt, etc.) | Last-mile delivery coordination | Partner portal / dedicated contact |

## Useful Links

| Resource | Description |
|---|---|
| **IT Service Desk** | General IT support for non-system-specific issues |
| **Change Management Board** | Submit and track configuration/system changes |
| **Incident Management** | P1/P2 incident tracking and post-mortems |
| **Knowledge Base (this wiki)** | Supply chain documentation and troubleshooting guides |
