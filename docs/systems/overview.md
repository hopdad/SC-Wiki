---
sidebar_position: 1
---

# Systems Overview

This section documents the software systems that power Meijer's supply chain. Each system is covered with architecture details, configuration guides, workflows, and troubleshooting.

## System Landscape

```mermaid
graph TB
    subgraph External
        S[Suppliers]
        C[Carriers]
    end

    subgraph Meijer Systems
        EDI[EDI Gateway]
        WMS[Warehouse Management System]
        TMS[Transportation Management System]
        INV[Inventory Systems]
        OMS[Ordering System]
        RP[Replenishment Engine]
    end

    subgraph Store Systems
        POS[Point of Sale]
        SIM[Store Inventory Mgmt]
    end

    S <--> EDI
    EDI <--> WMS
    EDI <--> C
    WMS <--> TMS
    WMS <--> INV
    INV <--> RP
    RP <--> OMS
    OMS <--> S
    INV <--> SIM
    SIM <--> POS
```

## Systems at a Glance

| System | Purpose | Key Docs |
|---|---|---|
| **WMS** | Warehouse operations — receiving, putaway, picking, shipping | [Overview](/docs/systems/wms/overview) |
| **TMS** | Transportation planning, routing, carrier management | [Overview](/docs/systems/tms/overview) |
| **Inventory Systems** | Replenishment, ordering, demand forecasting | [Overview](/docs/systems/inventory-systems/overview) |
| **Integrations & EDI** | System-to-system communication, EDI transactions, APIs | [Overview](/docs/systems/integrations/overview) |

## Integration Architecture

All systems communicate through a combination of:
- **EDI** — Standard transaction sets (850, 856, 810, etc.) for supplier/carrier communication
- **APIs** — REST/SOAP services for internal system integration
- **Batch Files** — Scheduled data transfers for reporting and bulk operations
- **Message Queues** — Real-time event-driven communication between systems

See [Integration Overview](/docs/systems/integrations/overview) for detailed data flow diagrams.

## Environments

| Environment | Purpose |
|---|---|
| **Production** | Live systems |
| **UAT** | User acceptance testing |
| **QA** | Quality assurance and regression testing |
| **Dev** | Development and feature work |
