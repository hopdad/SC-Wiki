---
sidebar_position: 1
---

# Integrations Overview

## Overview

Meijer's supply chain systems communicate through multiple integration patterns. This section documents EDI, APIs, and data flows between systems.

## Integration Architecture

```mermaid
graph TB
    subgraph External Partners
        SUP[Suppliers]
        CAR[Carriers]
        3PL[3PL Partners]
    end

    subgraph Integration Layer
        EDI[EDI Gateway]
        API[API Gateway]
        MQ[Message Queue]
        BATCH[Batch/File Transfer]
    end

    subgraph Internal Systems
        WMS[WMS]
        TMS[TMS]
        INV[Inventory]
        FIN[Finance]
    end

    SUP <-->|EDI 850/855/856/810| EDI
    CAR <-->|EDI 204/214/210| EDI
    3PL <-->|API| API

    EDI <--> WMS
    EDI <--> TMS
    API <--> WMS
    API <--> INV
    MQ <--> WMS
    MQ <--> TMS
    MQ <--> INV
    BATCH <--> FIN
```

## Integration Methods

| Method | Use Case | Partners |
|---|---|---|
| **EDI** | Structured business documents | Suppliers, carriers |
| **REST APIs** | Real-time data exchange | Internal systems, 3PLs |
| **Message Queues** | Event-driven, async processing | Internal systems |
| **Batch/SFTP** | Large data sets, reports | Finance, analytics |

## Key Docs

- [EDI Overview](/docs/systems/integrations/edi/overview)
- [EDI Transaction Sets](/docs/systems/integrations/edi/transaction-sets)
- [Trading Partners](/docs/systems/integrations/edi/trading-partners)
- [APIs](/docs/systems/integrations/apis)
- [Data Flows](/docs/systems/integrations/data-flows)
