---
sidebar_position: 4
---

# TMS Troubleshooting

## Overview

Common TMS issues, their root causes, and resolution steps. Use this guide as a first reference before escalating to the TMS support team.

## Routing Issues

| Issue | Possible Cause | Resolution |
|---|---|---|
| Route optimizer not completing | Too many orders; constraint conflicts | Break into smaller batches; review constraint settings; check for invalid store data |
| Store missing from route plan | Store delivery window not defined; store inactive | Verify store master data; check delivery window configuration |
| Route exceeds HOS limits | Stop sequence too long; dwell times underestimated | Adjust dwell time estimates; split route; allow overnight |
| Excessive miles per stop | Suboptimal stop clustering | Review route template; run dynamic optimization; check geocoding accuracy |

## Load Tendering Issues

| Issue | Possible Cause | Resolution |
|---|---|---|
| EDI 204 not sent to carrier | Carrier not in routing guide; EDI setup incomplete | Verify carrier assignment; check EDI trading partner config |
| Carrier not responding (no 990) | EDI connectivity issue; carrier system down | Contact carrier; check VAN/AS2 connection; tender to backup |
| All carriers rejecting load | Rate below market; equipment unavailable; short lead time | Adjust rate; extend pickup window; post to spot market |
| Duplicate tenders sent | System retry without checking previous tender status | Check tender status log; cancel duplicate; investigate trigger |

## Tracking Issues

| Issue | Possible Cause | Resolution |
|---|---|---|
| No tracking updates (EDI 214) | Carrier not sending; EDI mapping error | Contact carrier; check EDI transaction log for errors |
| GPS showing incorrect location | Telematics device malfunction; wrong vehicle assigned | Verify vehicle-to-load assignment; check device status |
| ETA not updating | Tracking data stale; calculation service down | Check tracking feed freshness; restart ETA calculation service |
| Geofence not triggering | Geofence radius too small; GPS accuracy | Adjust geofence radius; verify coordinates |

## Freight Audit Issues

| Issue | Possible Cause | Resolution |
|---|---|---|
| High volume of rate mismatches | Contract rates not updated; carrier using old rates | Update rate tables; notify carrier of correct rates |
| Accessorial charges unexpected | Detention at store; driver assist required | Verify with store operations; update accessorial agreements |
| EDI 210 not processing | Mapping error; missing reference numbers | Check EDI error log; verify load reference in carrier invoice |
| Payment delayed | Invoice stuck in exception queue | Review and resolve exceptions; process manual approval if needed |

## Integration Issues

### WMS Integration
| Symptom | Check | Resolution |
|---|---|---|
| Orders not flowing to TMS | API connectivity; order feed job | Check API health; restart order import job; verify data format |
| Load status not updating WMS | Outbound API call failing | Check API logs; verify WMS endpoint availability |
| Trailer status mismatch | Timing of yard events vs. TMS updates | Refresh trailer data; reconcile yard management system |

### EDI Gateway
| Symptom | Check | Resolution |
|---|---|---|
| Outbound EDI queued but not sent | VAN/AS2 connection down | Check connectivity; verify certificates (AS2); contact VAN support |
| Inbound EDI not processing | Mapping error; new trading partner not configured | Check error log; update mapping; add partner configuration |
| Functional acknowledgment (997) errors | Data validation failures | Review 997 error segments; fix source data; retransmit |

## Performance Issues

| Symptom | Possible Cause | Resolution |
|---|---|---|
| Route optimization slow | Large order set; complex constraints | Reduce batch size; simplify constraints; run during off-peak |
| Tender processing delays | EDI queue backlog; high transaction volume | Monitor queue depth; scale processing; prioritize critical loads |
| Dashboard loading slowly | Large date range; too many active loads displayed | Narrow date filter; archive completed loads |

## Escalation Procedures

| Severity | Criteria | Response Time | Contact |
|---|---|---|---|
| **P1 — Critical** | Tendering halted; no routes available; system down | Immediate | On-call TMS support → IT manager |
| **P2 — High** | Tracking down; audit processing stopped | < 1 hour | TMS support team lead |
| **P3 — Medium** | Single carrier issue; report not generating | < 4 hours | TMS support ticket |
| **P4 — Low** | Enhancement request; minor UI issue | Next sprint | Product backlog |

### Before Escalating
1. Document the issue with specific load/route/carrier IDs
2. Note the time the issue started and what changed
3. Check this troubleshooting guide first
4. Verify EDI and API connectivity status
5. Include error messages, screenshots, or log excerpts
