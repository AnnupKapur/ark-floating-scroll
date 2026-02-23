import React, { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { VirtualList, VirtualListHandle } from "../src";

// ---------------------------------------------------------------------------
// Demo 1: Simple string list (10,000 items)
// ---------------------------------------------------------------------------
function SimpleListDemo() {
  const items = Array.from({ length: 10_000 }, (_, i) => `Row ${i + 1}`);

  return (
    <section>
      <h2>Simple List — 10,000 strings (Auto-measured height)</h2>
      <VirtualList
        items={items}
        height={300}
        renderItem={(item, index) => (
          <div
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid #eee",
              background: index % 2 === 0 ? "#fafafa" : "#fff",
            }}
          >
            {item}
          </div>
        )}
      />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Demo 2: Typed object list with richer rendering
// ---------------------------------------------------------------------------
interface Contact {
  id: number;
  name: string;
  email: string;
}

function ContactListDemo() {
  const contacts: Contact[] = Array.from({ length: 50_000 }, (_, i) => ({
    id: i,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
  }));

  return (
    <section>
      <h2>Contact List — 50,000 objects (Auto-measured)</h2>
      <VirtualList<Contact>
        items={contacts}
        height={350}
        renderItem={(contact) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 12px",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: `hsl(${contact.id % 360}, 60%, 70%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "#fff",
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {contact.name[0]}
            </div>
            <div>
              <div style={{ fontWeight: 500 }}>{contact.name}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{contact.email}</div>
            </div>
          </div>
        )}
      />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Demo 3: Dynamic — add / remove items
// ---------------------------------------------------------------------------
function DynamicListDemo() {
  const [items, setItems] = useState(() =>
    Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`)
  );

  return (
    <section>
      <h2>Dynamic List — add & remove</h2>
      <div style={{ marginBottom: 8, display: "flex", gap: 8 }}>
        <button
          onClick={() =>
            setItems((prev) => [...prev, `Item ${prev.length + 1}`])
          }
        >
          Add item
        </button>
        <button
          onClick={() =>
            setItems((prev) => prev.slice(0, Math.max(0, prev.length - 1)))
          }
        >
          Remove last
        </button>
        <span style={{ color: "#666", fontSize: 14, alignSelf: "center" }}>
          {items.length} items
        </span>
      </div>
      <VirtualList
        items={items}
        itemHeight={36}
        height={250}
        renderItem={(item, index) => (
          <div
            style={{
              padding: "6px 12px",
              borderBottom: "1px solid #eee",
              background: index % 2 === 0 ? "#f7f7ff" : "#fff",
            }}
          >
            {item}
          </div>
        )}
      />
    </section>
  );
}

// ---------------------------------------------------------------------------
// Demo 4: Scroll to Index
// ---------------------------------------------------------------------------
function ScrollToIndexDemo() {
  const listRef = useRef<VirtualListHandle>(null);
  const [target, setTarget] = useState("500");
  const items = Array.from({ length: 10_000 }, (_, i) => `Item ${i}`);

  const handleGo = () => {
    const index = parseInt(target, 10);
    if (!isNaN(index)) {
      listRef.current?.scrollToIndex(index, "smooth");
    }
  };

  return (
    <section>
      <h2>Scroll to Index — 10,000 items</h2>
      <div style={{ marginBottom: 8, display: "flex", gap: 8, alignItems: "center" }}>
        <label>
          Index:{" "}
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            min={0}
            max={9999}
            style={{ width: 80, padding: "4px 8px" }}
          />
        </label>
        <button onClick={handleGo}>Go (smooth)</button>
        <button
          onClick={() => {
            const index = parseInt(target, 10);
            if (!isNaN(index)) listRef.current?.scrollToIndex(index);
          }}
        >
          Go (instant)
        </button>
      </div>
      <VirtualList
        ref={listRef}
        items={items}
        itemHeight={40}
        height={300}
        renderItem={(item, index) => (
          <div
            style={{
              padding: "8px 12px",
              borderBottom: "1px solid #eee",
              background: index === parseInt(target, 10) ? "#d0ebff" : index % 2 === 0 ? "#fafafa" : "#fff",
              fontWeight: index === parseInt(target, 10) ? "bold" : "normal",
            }}
          >
            {item}
          </div>
        )}
      />
    </section>
  );
}

// ---------------------------------------------------------------------------
// App shell
// ---------------------------------------------------------------------------
function App() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>🚀 Ark Floating Scroll Demo</h1>
      <p style={{ color: "#555" }}>
        Each list below uses <code>&lt;VirtualList&gt;</code> to render only the
        visible rows. Open DevTools → Elements to confirm the DOM stays small.
      </p>
      <SimpleListDemo />
      <ScrollToIndexDemo />
      <ContactListDemo />
      <DynamicListDemo />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
