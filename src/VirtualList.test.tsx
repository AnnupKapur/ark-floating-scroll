import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { VirtualList } from "./VirtualList";

const createItems = (count: number) =>
  Array.from({ length: count }, (_, i) => `Item ${i}`);

describe("VirtualList", () => {
  it("renders only visible items plus overscan", () => {
    const items = createItems(1000);
    // height=200, itemHeight=50 → 4 visible + 5 overscan below = 9 items
    const { container } = render(
      <VirtualList
        items={items}
        itemHeight={50}
        height={200}
        overscan={5}
        renderItem={(item) => <span>{item}</span>}
      />
    );

    const rendered = container.querySelectorAll("span");
    // startIndex = max(0, floor(0/50) - 5) = 0
    // endIndex = min(1000, floor(0/50) + 4 + 5) = 9
    expect(rendered.length).toBe(9);
    expect(rendered[0].textContent).toBe("Item 0");
    expect(rendered[8].textContent).toBe("Item 8");
  });

  it("sets total height on the inner spacer div", () => {
    const items = createItems(100);
    const { container } = render(
      <VirtualList items={items} itemHeight={40} height={300} />
    );

    const spacer = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(spacer.style.height).toBe("4000px");
  });

  it("positions items absolutely at correct offsets", () => {
    const items = createItems(20);
    const { container } = render(
      <VirtualList
        items={items}
        itemHeight={30}
        height={100}
        overscan={0}
        renderItem={(item) => <span>{item}</span>}
      />
    );

    // With overscan=0: visible = ceil(100/30)=4 items, indices 0..3
    const positioned = container.querySelectorAll<HTMLElement>(
      "[style*='position: absolute']"
    );
    expect(positioned.length).toBe(4);
    expect(positioned[0].style.top).toBe("0px");
    expect(positioned[1].style.top).toBe("30px");
    expect(positioned[2].style.top).toBe("60px");
    expect(positioned[3].style.top).toBe("90px");
  });

  it("handles empty items array", () => {
    const { container } = render(
      <VirtualList items={[]} itemHeight={50} height={200} />
    );
    const spacer = container.firstElementChild!.firstElementChild as HTMLElement;
    expect(spacer.style.height).toBe("0px");
    expect(spacer.children.length).toBe(0);
  });

  it("applies className and custom style", () => {
    const { container } = render(
      <VirtualList
        items={["a"]}
        itemHeight={50}
        height={200}
        className="my-list"
        style={{ border: "1px solid red" }}
      />
    );

    const outer = container.firstElementChild as HTMLElement;
    expect(outer.classList.contains("my-list")).toBe(true);
    expect(outer.style.border).toBe("1px solid red");
  });

  it("uses default renderItem when none is provided", () => {
    const { container } = render(
      <VirtualList items={["hello"]} itemHeight={50} height={200} overscan={0} />
    );
    // default renderItem wraps in a div with String(item)
    expect(container.textContent).toContain("hello");
  });

  it("updates visible range on scroll", () => {
    // Mock requestAnimationFrame to run callbacks synchronously
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    };

    const items = createItems(1000);
    const { container } = render(
      <VirtualList
        items={items}
        itemHeight={50}
        height={200}
        overscan={2}
        renderItem={(item) => <span>{item}</span>}
      />
    );

    const scrollContainer = container.firstElementChild as HTMLElement;

    // Simulate scrolling to position 500 (item index 10)
    Object.defineProperty(scrollContainer, "scrollTop", {
      value: 500,
      writable: true,
    });
    fireEvent.scroll(scrollContainer);

    const rendered = container.querySelectorAll("span");
    // startIndex = max(0, floor(500/50) - 2) = 8
    // endIndex = min(1000, floor(500/50) + 4 + 2) = 16
    expect(rendered[0].textContent).toBe("Item 8");

    window.requestAnimationFrame = originalRAF;
  });
});
