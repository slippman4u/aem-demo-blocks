# xray

## Overview

A fixed-position AEP-style Real Time Customer Profile x-ray panel. It renders nothing in the page flow — instead it injects a small Adobe logo trigger button and a slide-out panel into `<body>`. Clicking the trigger slides the panel in from the left, giving a live view of the visitor's AEP profile, audience memberships, and event history.

## Configuration

Data is fetched from `/xray/xray-data.json`, which is a DA.live published spreadsheet with three named sheets:

| Sheet | Columns |
|---|---|
| `profile` | `key`, `value` |
| `audiences` | `timestamp`, `status`, `name` |
| `events` | `date`, `time`, `data`, `event-type` |

The profile sheet rows use the following keys: `ecid`, `email`, `name`, `gender`, `birth-date`, `address`, `loyalty-level`, `loyalty-points`.

To change the data source, update `DATA_URL` at the top of `xray.js`.

## Integration

Add a block named **xray** to any page document. The block content itself is hidden — its only job is to trigger the `decorate()` function.

```
+-------+
| xray  |
+-------+
|       |
+-------+
```

The block can be placed anywhere in the document. No block content or configuration columns are required.

## Behavior

- **Trigger button** — fixed at `top: 16px, left: 16px`, always visible. Clicking it opens or closes the panel.
- **Panel** — slides in from the left at 420px wide, overlays page content. An overlay backdrop appears behind the panel; clicking it closes the panel.
- **Data fetching** — the JSON is fetched lazily on the first panel open. Subsequent opens reuse the cached data. The refresh icon in the panel header re-fetches the data.
- **Tabs** — five tabs are rendered: Profile and Events are functional; Offers, Architecture, and Debug render an empty panel.
- **Profile tab** — four accordions, all expanded by default:
  - *Identities* — ECID (monospace) and email address
  - *Attributes* — name, gender, birth date, address, loyalty level, loyalty points
  - *Audiences* — each audience as timestamp + status on line one, segment name on line two
  - *Utilities* — empty, reserved for future use
- **Events tab** — vertical timeline. Each event shows the date/time, the data value, and the event type as a small uppercase label.

## Error handling

If the fetch fails, an inline error message is shown inside the panel. The refresh button in the panel header re-attempts the fetch from scratch, allowing recovery without a page reload.
