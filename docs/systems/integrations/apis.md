---
sidebar_position: 5
---

# APIs

## Overview

Meijer's supply chain systems communicate through a set of internal APIs for real-time data exchange. These APIs connect the WMS, TMS, inventory systems, store systems, and business intelligence platforms. External API integrations are used for select 3PL partners and technology providers.

## API Catalog

### Internal APIs

| Service | Purpose | Protocol | Consumers |
|---|---|---|---|
| **Inventory Position API** | Current inventory by item/location | REST | Replenishment engine, store systems, BI |
| **Order Management API** | Create/update/cancel transfer orders | REST | Replenishment engine → WMS |
| **Receipt Notification API** | Notify receipt completions from WMS | REST (webhook) | Inventory systems, finance |
| **Shipment Status API** | Outbound shipment tracking and status | REST | TMS, store operations |
| **Item Master API** | Product data (UPC, description, dimensions, cost) | REST | All systems |
| **Store Master API** | Store locations, delivery windows, attributes | REST | TMS, replenishment |
| **Vendor Master API** | Supplier information and capabilities | REST | Ordering, EDI |
| **Wave Status API** | Wave planning progress and completion | REST | TMS (departure planning) |
| **Forecast API** | Demand forecast data by item/store/day | REST | BI, planning tools |

### External APIs

| Partner Type | Purpose | Protocol |
|---|---|---|
| **3PL Partners** | Inventory visibility, order status | REST |
| **Delivery Partners** | Order dispatch, tracking, POD | REST |
| **Telematics Providers** | Fleet GPS and vehicle data | REST |
| **Weather Services** | Forecast data for demand and route planning | REST |

## Authentication and Authorization

| Method | Used For |
|---|---|
| **OAuth 2.0 (Client Credentials)** | Service-to-service internal APIs |
| **API Keys** | External partner integrations |
| **JWT Tokens** | User-context API calls (portals, dashboards) |
| **mTLS** | High-security partner connections |

### Access Control
- APIs secured with role-based access control (RBAC)
- Each consuming system has a dedicated service account with scoped permissions
- API keys and credentials rotated on a regular schedule
- All API traffic encrypted via TLS 1.2+

## Rate Limiting

| Tier | Rate Limit | Use Case |
|---|---|---|
| **Internal - High Priority** | 1,000 req/sec | WMS, TMS, replenishment engine |
| **Internal - Standard** | 200 req/sec | BI, reporting, dashboards |
| **External Partners** | 50 req/sec | 3PLs, delivery partners |
| **Batch / Bulk** | Rate-limited with queuing | Large data exports |

Rate limit headers included in responses:
- `X-RateLimit-Limit` — Maximum requests per window
- `X-RateLimit-Remaining` — Requests remaining
- `X-RateLimit-Reset` — Window reset timestamp

## API Versioning

- **URL path versioning** — e.g., `/api/v1/inventory`, `/api/v2/inventory`
- **Deprecation policy** — Previous version supported for 12 months after new version release
- **Breaking changes** require version increment (field removal, type changes)
- **Non-breaking changes** added to current version (new fields, new endpoints)
- Deprecation warnings returned in response headers when calling old versions

## Common Patterns

### Request Format
```
GET /api/v1/inventory?item_id=00012345&location=STORE-001
Authorization: Bearer <token>
Content-Type: application/json
```

### Response Format
```json
{
  "status": "success",
  "data": {
    "item_id": "00012345",
    "location": "STORE-001",
    "on_hand": 24,
    "on_order": 48,
    "last_updated": "2026-03-23T08:15:00Z"
  },
  "meta": {
    "request_id": "abc-123-def",
    "timestamp": "2026-03-23T08:15:30Z"
  }
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "ITEM_NOT_FOUND",
    "message": "Item 00012345 not found at location STORE-001",
    "details": {}
  },
  "meta": {
    "request_id": "abc-123-def"
  }
}
```

## Error Handling and Retry Policies

| HTTP Status | Meaning | Retry? |
|---|---|---|
| **200** | Success | No |
| **400** | Bad request (invalid parameters) | No — fix request |
| **401** | Unauthorized (invalid/expired token) | No — re-authenticate |
| **403** | Forbidden (insufficient permissions) | No — check access |
| **404** | Resource not found | No |
| **429** | Rate limited | Yes — with exponential backoff |
| **500** | Internal server error | Yes — up to 3 retries |
| **502/503** | Service unavailable | Yes — with exponential backoff |

### Retry Strategy
- **Initial delay:** 1 second
- **Backoff multiplier:** 2x (1s, 2s, 4s)
- **Max retries:** 3
- **Jitter:** Add random 0-500ms to prevent thundering herd
- **Circuit breaker:** After sustained failures, stop retrying for 30 seconds

## Monitoring and Alerting

| Metric | Alert Threshold |
|---|---|
| **API Response Time (p99)** | >2 seconds |
| **Error Rate** | >1% of requests returning 5xx |
| **Availability** | \<99.9% uptime over rolling 1 hour |
| **Rate Limit Hits** | >10% of requests throttled |
| **Auth Failures** | Spike in 401/403 responses |
