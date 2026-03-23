---
sidebar_position: 4
---

# WMS Troubleshooting

## Overview

This guide covers common WMS issues encountered during daily operations, their root causes, and resolution steps. Use this as a first reference before escalating to the support team.

## Common Issues and Resolutions

### Receiving Issues

| Issue | Possible Cause | Resolution |
|---|---|---|
| Cannot create receipt — "No matching ASN" | ASN not yet received or PO not transmitted | Check EDI gateway for ASN status; contact vendor if missing; use blind receive as fallback |
| Quantity mismatch on receipt | Physical count differs from ASN | Complete receipt with actual quantity; system creates variance record; vendor notified |
| Product received to wrong facility | ASN has incorrect DC code | Reject and redirect, or receive and arrange inter-DC transfer |
| Temperature out of range alert | Reefer trailer temp exceeded threshold | Quarantine product; notify QA team for disposition decision |

### Putaway Issues

| Issue | Possible Cause | Resolution |
|---|---|---|
| "No location available" for putaway | All matching locations full; slotting rules too restrictive | Check for open locations manually; expand zone eligibility; contact planner for overflow |
| Directed to wrong location type | Item master data incorrect (size, weight, temp zone) | Supervisor override; submit item master correction request |
| Cannot confirm putaway — "Location locked" | Location under cycle count or maintenance hold | Wait for count completion, or contact supervisor to release lock |

### Picking Issues

| Issue | Possible Cause | Resolution |
|---|---|---|
| "Zero available" at pick location | Inventory depleted; replenishment pending | Report short pick; system checks reserve for alternate allocation |
| Wrong item at pick location | Putaway or prior pick error | Report exception; supervisor investigates; adjust inventory |
| Voice system not recognizing commands | Background noise; voice profile drift | Re-train voice profile; move to quieter area; switch to RF scanning |
| Pick task not appearing | Wave not released; task assignment issue | Check wave status; verify zone/operator assignment; contact planner |

### Shipping Issues

| Issue | Possible Cause | Resolution |
|---|---|---|
| Pallet scan rejected during loading | Pallet not allocated to this load | Verify pallet label vs. load plan; may need load plan update |
| Trailer not available at dock door | Yard delay; trailer not spotted | Contact yard operations; assign alternate door if available |
| BOL not printing | Printer offline or label format error | Check printer status; restart print spooler; use backup printer |
| Load closed prematurely | Operator confirmed before all pallets loaded | Reopen load (supervisor access); continue loading |

### Inventory Issues

| Issue | Possible Cause | Resolution |
|---|---|---|
| Negative on-hand quantity | Receiving not posted; POS/adjustment timing | Investigate transaction history; perform cycle count; post missing receipt |
| Cycle count large variance | Misplaced inventory; theft; system error | Expand count to adjacent locations; investigate location history |
| Inventory on hold unexpectedly | Quality hold, lot hold, or recall | Check hold reason in inventory detail; contact QA or food safety team |
| Phantom inventory (system shows stock but shelf empty) | Missed scan, picking error, unreported damage | Cycle count and adjust; investigate root cause |

## Integration Failures

### EDI Interface Issues

| Symptom | Check | Resolution |
|---|---|---|
| ASNs not appearing | EDI gateway status, mapping errors | Check EDI transaction log; verify partner setup; retransmit |
| Outbound ship confirmations not sending | Outbound EDI queue, SFTP connectivity | Check queue for errors; verify connection to VAN/AS2; retry |
| Duplicate receipts | ASN processed multiple times | Check idempotency controls; void duplicate receipt |

### TMS Integration

| Symptom | Check | Resolution |
|---|---|---|
| Load plans not received | API connectivity, message queue | Check API health; verify queue processing; manual load creation |
| Route changes not reflected | Timing of update vs. wave release | Refresh load data; replan wave if needed |

### Inventory System Integration

| Symptom | Check | Resolution |
|---|---|---|
| Store orders not appearing | Order feed processing, data validation | Check order import log; verify store/item master data |
| Inventory snapshots stale | Batch job failure | Check scheduled job status; restart job; manual export if urgent |

## Performance Issues

| Symptom | Possible Cause | Resolution |
|---|---|---|
| Slow task assignment | High database load; wave over-release | Monitor DB performance; stagger wave releases; contact DBA |
| RF device slow or freezing | Wi-Fi coverage gap; device memory full | Move to area with stronger signal; restart device; clear cache |
| Reports timing out | Large data set; unoptimized query | Run during off-peak; add date range filter; contact BI team |
| Wave planning taking too long | Too many orders in single wave; allocation complexity | Break into smaller waves; optimize allocation rules |

## Escalation Procedures

| Severity | Criteria | Response Time | Escalation Path |
|---|---|---|---|
| **P1 — System Down** | WMS unavailable; operations halted | Immediate | On-call support → IT manager → VP of Operations |
| **P2 — Major Impact** | Key function impaired; workaround exists | < 1 hour | Support team → WMS lead → IT manager |
| **P3 — Minor Impact** | Non-critical issue; no operational impact | < 4 hours | Support team ticket |
| **P4 — Enhancement** | Feature request or minor improvement | Next sprint | Product backlog |

### Before Escalating
1. Document the issue: what happened, when, which facility, which user/device
2. Capture error messages or screenshots
3. Note any recent changes (configuration, master data, software)
4. Check this troubleshooting guide for known resolutions
5. Attempt standard recovery steps (restart device, retry transaction)
