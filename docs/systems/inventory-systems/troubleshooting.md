---
sidebar_position: 4
---

# Inventory Systems Troubleshooting

## Overview

Common inventory system issues, root causes, and resolution steps. Use this guide as a first reference before escalating.

## Replenishment Issues

| Issue | Possible Cause | Resolution |
|---|---|---|
| Item not being replenished | Item inactive; forecast missing; parameters not set | Check item status in master data; verify forecast exists; confirm replenishment parameters |
| Over-ordering | Safety stock too high; stale demand forecast; duplicate orders | Review safety stock parameters; refresh forecast; check for duplicate PO/transfer orders |
| Under-ordering | Safety stock too low; lead time underestimated; on-hand inflated | Adjust safety stock; update lead time from recent actuals; verify store on-hand accuracy |
| Replenishment run not completing | Data error; system timeout; resource constraint | Check error logs; identify problematic item/store; run in smaller batches |
| Wrong DC sourcing | Item-DC assignment incorrect | Verify item sourcing matrix; update DC assignment |

## Order Generation Issues

| Issue | Possible Cause | Resolution |
|---|---|---|
| PO not created for vendor | Below vendor minimum order; vendor inactive | Check vendor minimum thresholds; verify vendor status |
| Incorrect cost on PO | Cost file not updated; wrong effective date | Refresh vendor cost file; verify cost effective dates |
| PO missing line items | Item not linked to vendor; item discontinued | Check item-vendor assignments; verify item active status |
| Duplicate POs | System reprocessed; manual + auto both created | Cancel duplicate; investigate trigger |
| PO sent to wrong vendor | Item-vendor mapping error | Correct mapping; cancel and recreate PO to correct vendor |

## Data Feed Issues

### POS Data
| Issue | Possible Cause | Resolution |
|---|---|---|
| Sales data not received | Store POS system down; network issue; ETL failure | Check store system status; verify network; restart ETL job |
| Stale sales data | Feed delayed; processing backlog | Check feed timestamps; monitor processing queue |
| Incorrect sales data | POS scanning errors; wrong UPC | Investigate at store level; correct UPC mapping |

### Inventory Snapshots
| Issue | Possible Cause | Resolution |
|---|---|---|
| Store on-hand not updating | Snapshot job failed; store system offline | Check job status; restart; verify store connectivity |
| Negative on-hand in system | Receiving not posted; POS timing; theft | Investigate transaction history; cycle count; post missing receipts |
| Large on-hand discrepancy | Missed cycle count; unreported shrink | Initiate cycle count; review recent transactions |

## Forecast Issues

| Issue | Possible Cause | Resolution |
|---|---|---|
| Forecast significantly high | Promotional lift not removed post-promo; outlier data | Review promotional calendar; clean outlier sales events; regenerate forecast |
| Forecast significantly low | Promotion not captured; new demand pattern | Add promotional event; allow model to learn new pattern; manual override |
| No forecast for item | New item; model failed to generate | Set up like-item forecast; create manual forecast; check model errors |
| Forecast flat (no seasonality) | Insufficient history; wrong model selected | Apply seasonal profile manually; use category-level pattern; wait for more data |

## Integration Issues

### WMS Integration
| Symptom | Check | Resolution |
|---|---|---|
| DC inventory positions stale | API feed timing; WMS snapshot job | Verify API health; check snapshot schedule; request manual refresh |
| Transfer orders not received by WMS | API error; order format issue | Check API logs; verify message format; retry transmission |
| Receipt confirmations missing | WMS not sending receipt events | Check WMS outbound interface; verify event triggers |

### EDI / Supplier Integration
| Symptom | Check | Resolution |
|---|---|---|
| EDI 850 not reaching vendor | VAN/AS2 connectivity; mapping error | Check EDI gateway; verify trading partner config; retransmit |
| EDI 855 not processing | Inbound mapping error; PO reference mismatch | Check EDI error log; verify PO number matches |
| ASN (856) not matching PO | Wrong PO reference; item cross-reference issue | Verify PO number in ASN; check item mapping |

## Escalation Procedures

| Severity | Criteria | Response Time | Contact |
|---|---|---|---|
| **P1 — Critical** | Replenishment engine down; no POs generating | Immediate | On-call support → IT manager |
| **P2 — High** | Category-wide ordering issue; data feed failure | < 1 hour | Inventory systems support lead |
| **P3 — Medium** | Single item/vendor issue; forecast error | < 4 hours | Support ticket |
| **P4 — Low** | Parameter adjustment request; reporting issue | Next business day | Support ticket |

### Before Escalating
1. Identify the specific items, stores, or vendors affected
2. Note when the issue started
3. Check if recent changes were made (parameters, master data, promotions)
4. Verify data feeds are current (POS, inventory snapshots)
5. Include error messages, item numbers, and PO references
