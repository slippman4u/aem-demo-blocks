# Shop the Look Block

## Overview

An editorial "Shop the Look" experience presenting a hero image, fashion editorial copy, a full-outfit model image, and a horizontally scrollable product slider. Each product tile is populated live from the Catalog Service via GraphQL. Clicking a tile navigates to the product's PDP.

## Configuration

The block is authored as a two-column table in a Google Doc or Word document. Each row has a label in the first cell and the value in the second:

| Label | Value |
|---|---|
| `hero-image` | Paste an image or enter an image URL |
| `editorial` | Rich text — 2–3 editorial paragraphs |
| `look-image` | Paste an image or enter an image URL |
| `product` | `/products/{url-key}/{sku}` — one row per product |
| `product` | `/products/{url-key}/{sku}` — repeat for additional products |

- **Images**: accepts a Google Docs `<picture>` element, a bare `<img>`, a hyperlink, or a plain-text `https://` URL.
- **Products**: add as many `product` rows as needed — each becomes one slide in the slider.

## Integration

### GraphQL

Product data (name, price, image, short description) is fetched using `fetchProductData(sku, { skipTransform: true })` from `@dropins/storefront-pdp/api.js`, with the Catalog Service endpoint inherited via `setEndpoint(CS_FETCH_GRAPHQL)`. This is the same pattern used by `scripts/components/commerce-mini-pdp`.

The block expects `initializeCommerce()` (called by `scripts/scripts.js` during eager load) to have configured `CS_FETCH_GRAPHQL` before `decorate()` runs.

### PDP links

Product tile links are generated with `getProductLink(urlKey, sku)` from `scripts/commerce.js`, which applies store root-path localisation automatically.

## Behavior patterns

- **Slider**: CSS `scroll-snap-type: x mandatory` with no JavaScript library. On mobile (~85 % viewport width per slide) and desktop (~33 % — three tiles visible).
- **Nav arrows**: Prev/Next buttons call `scrollBy()` by one slide width. Only rendered when more than one product is authored.
- **Load order**: Slide DOM nodes are appended synchronously (preserving authored order) before any fetches start. Each slide shows an animated shimmer skeleton until its GraphQL response arrives.

## Error handling

- If `fetchProductData` throws or returns no `sku`, the slide renders a neutral "Product unavailable" placeholder.
- Missing product images fall back to a neutral `background-color` placeholder `<div>`.
- `extractSku()` gracefully returns `null` for malformed URLs, which triggers the unavailable placeholder rather than an uncaught exception.
