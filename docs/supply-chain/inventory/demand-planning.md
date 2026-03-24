---
sidebar_position: 2
---

# Demand Planning

## Overview

Demand planning at Meijer uses statistical forecasting, promotional analysis, and market intelligence to predict customer demand across 270+ stores and tens of thousands of SKUs. Accurate demand forecasts drive replenishment, inventory positioning, workforce planning, and supply chain capacity decisions.

## Demand Planning Process

```mermaid
graph LR
    A[Historical Sales Data] --> B[Statistical Forecast]
    B --> C[Promotional Adjustments]
    C --> D[Planner Review & Override]
    D --> E[Consensus Forecast]
    E --> F[Replenishment & Ordering]
```

## Forecasting Methodologies

| Method | Description | Used For |
|---|---|---|
| **Time Series** | Statistical models based on historical sales patterns (trend, seasonality, level) | Base demand for established items |
| **Causal Models** | Incorporate external factors (price, promotions, weather, events) | Items with significant promotional lifts |
| **Machine Learning** | Advanced algorithms that detect complex demand patterns | High-SKU-count categories, new patterns |
| **Judgmental / Expert Input** | Planner overrides based on market knowledge | New items, supply disruptions, unusual events |
| **Ensemble** | Combination of multiple models weighted by accuracy | Improved accuracy across item segments |

## Forecast Hierarchy

Demand is planned at multiple levels and reconciled:

| Level | Granularity | Use |
|---|---|---|
| **Corporate** | Total company sales by category | Financial planning, capacity |
| **Category** | Product category by region | Merchandising strategy |
| **Store-SKU** | Individual item at each store | Replenishment, ordering |
| **Daily** | Day-level demand | Short-term operational planning |
| **Weekly** | Week-level demand | Medium-term inventory planning |

## Promotional Lift Planning

Promotions are a major driver of demand variability in retail:

1. **Promotional calendar** — Merchandising team publishes ad plans 4-8 weeks in advance
2. **Lift factor estimation** — Historical promotional performance used to estimate sales increase
3. **Causal modeling** — Price point, ad type (TPR, BOGO, circular feature), and display placement factored in
4. **Pre-build inventory** — Extra inventory positioned at DCs and stores before the promotion starts
5. **Post-promo adjustment** — Demand typically dips after promotions; forecast adjusted to avoid overstock

### Typical Lift Factors by Promotion Type

| Promotion Type | Expected Lift |
|---|---|
| **Temporary Price Reduction (TPR)** | 1.5x - 3x base demand |
| **Buy One Get One (BOGO)** | 2x - 4x base demand |
| **Circular Feature + Display** | 3x - 8x base demand |
| **Endcap Display** | 1.5x - 2.5x base demand |
| **Digital Coupon** | 1.2x - 2x base demand |

## Seasonal Demand Patterns

Meijer's product mix creates distinct seasonal demand cycles:

| Season | High-Demand Categories | Planning Lead Time |
|---|---|---|
| **Super Bowl / Big Game** | Snacks, beverages, dips, paper goods | 4-6 weeks |
| **Easter** | Candy, baking supplies, ham, spring décor | 6-8 weeks |
| **Memorial Day / July 4th** | Grilling, outdoor, beverages, picnic supplies | 6-8 weeks |
| **Back to School** | School supplies, lunch items, dorm essentials | 8-12 weeks |
| **Halloween** | Candy, costumes, decorations | 8-12 weeks |
| **Thanksgiving** | Turkey, baking, canned goods, produce | 8-10 weeks |
| **Holiday / Christmas** | Gifts, baking, toys, seasonal food | 12-16 weeks |
| **Spring Garden** | Lawn, garden, plants, outdoor furniture | 12-20 weeks |

## New Item Forecasting

New items lack historical sales data, so forecasting uses:
- **Like-item modeling** — Base forecast on a similar existing product's performance
- **Vendor projections** — Supplier provides expected sales data (used cautiously)
- **Test market results** — Limited store rollout data extrapolated to broader network
- **Category benchmarks** — Average performance for new items in the category
- **Rapid learning** — First 2-4 weeks of actual sales used to rapidly adjust forecast

## Collaboration

Demand planning requires input from multiple teams:

| Team | Contribution |
|---|---|
| **Merchandising / Buyers** | Promotional plans, assortment changes, pricing strategy |
| **Marketing** | Campaign timing, digital promotion plans, loyalty program impacts |
| **Store Operations** | Local market intelligence, event-driven demand, store-level overrides |
| **Supply Chain** | Capacity constraints, lead time changes, supplier issues |
| **Finance** | Sales targets, margin goals, budget alignment |

## Forecast Accuracy Metrics

| Metric | Description | Target |
|---|---|---|
| **MAPE** | Mean Absolute Percentage Error — avg forecast error as % of actuals | \<20% (varies by category) |
| **Bias** | Systematic over/under-forecasting tendency | Near 0% |
| **WMAPE** | Weighted MAPE — accounts for item volume importance | \<15% for high-volume items |
| **Forecast Value Add (FVA)** | Improvement over naive forecast (e.g., last year's sales) | Positive |
| **Tracking Signal** | Detects when forecast consistently drifts from actuals | Within ±4 |
