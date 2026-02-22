# optimised-scroll

A high-performance virtualized list component for React. Renders only the items visible in the viewport, dramatically reducing DOM nodes and improving performance for long lists.

## Installation

```bash
npm install optimised-scroll
```

**Peer dependencies:** React ≥ 16.8.0

## Quick Start

```tsx
import { VirtualList } from "optimised-scroll";

const items = Array.from({ length: 10000 }, (_, i) => `Item ${i}`);

function App() {
  return (
    <VirtualList
      items={items}
      itemHeight={40}
      height={500}
      renderItem={(item, index) => (
        <div style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
          {item}
        </div>
      )}
    />
  );
}
```

## API

### `<VirtualList<T>>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | *required* | Array of items to render |
| `itemHeight` | `number` | *required* | Fixed height of each item in pixels |
| `height` | `number` | `400` | Height of the scrollable container |
| `width` | `number \| string` | `"100%"` | Width of the scrollable container |
| `overscan` | `number` | `5` | Extra items rendered above/below viewport |
| `renderItem` | `(item: T, index: number) => ReactNode` | `String(item)` | Custom render function |
| `className` | `string` | — | CSS class for the outer container |
| `style` | `CSSProperties` | — | Inline styles for the outer container |

## How It Works

1. **Scroll Detection** — Listens to the container's `scroll` event, throttled via `requestAnimationFrame` for smooth 60fps updates.
2. **Range Calculation** — Computes `startIndex` and `endIndex` from `scrollTop / itemHeight`, adding an `overscan` buffer.
3. **DOM Recycling** — Only the visible slice of items is mounted in the DOM. Items outside the viewport are unmounted, keeping memory usage constant regardless of list size.

## TypeScript

Full type definitions are included. The component is generic — your `items` type flows through to `renderItem`:

```tsx
interface User {
  id: number;
  name: string;
}

<VirtualList<User>
  items={users}
  itemHeight={60}
  renderItem={(user) => <div>{user.name}</div>}
/>
```

## Examples

The `examples/` directory includes interactive demos (simple list, typed objects, dynamic add/remove).

```bash
npm run demo
# opens at http://localhost:5173
```

Open DevTools → Elements to confirm only ~20-30 DOM nodes exist regardless of list size.

## License

MIT
# ark-floating-scroll
