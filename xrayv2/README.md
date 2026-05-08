# XRay V2

Real Time Customer Profile slide-out panel for Adobe Commerce Optimizer (ACO) Edge Delivery storefronts.

## Features
- Listens to the ACO drop-in event bus (`pdp/data`) for real-time product page views
- Persists full session event history across page navigations using sessionStorage
- Falls back to DA.live sheet data on non-Commerce pages
- Profile, Events, Offers, Architecture, and Debug tabs

## Configuration
Add the block table to your page document in DA.live:

| xray |
|------|
| /xray/xray-data.json |

## Data Sheet
The spreadsheet at the configured path needs 3 tabs:
- `profile` (columns: value, key)
- `audiences` (columns: timestamp, status, name)  
- `events` (columns: date, time, data, event-type)

## Demo Helper
To simulate a product view in the browser console:
```js
window.xraySimulateProductView('Product Name', 'SKU-123', 49.99)
```
