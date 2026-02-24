import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
  CSSProperties,
  ReactNode,
  ReactElement,
  Ref,
} from "react";

export interface VirtualListHandle {
  /** Scroll to bring the item at `index` into view */
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
}

export interface VirtualListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Fixed height of each item in pixels. If omitted, it will be auto-calculated from the first item. */
  itemHeight?: number;
  /** Height of the scrollable container in pixels (default: 400) */
  height?: number;
  /** Width of the scrollable container (default: "100%") */
  width?: number | string;
  /** Number of extra items to render above/below the viewport (default: 5) */
  overscan?: number;
  /** Custom render function for each item */
  renderItem?: (item: T, index: number) => ReactNode;
  /** CSS class for the outer container */
  className?: string;
  /** Inline styles for the outer container */
  style?: CSSProperties;
}

function defaultRenderItem<T>(item: T, index: number): ReactNode {
  return <div>{String(item)}</div>;
}

/**
 * A virtualized list component that renders only the items visible
 * in the viewport, plus a configurable overscan buffer.
 */
function VirtualListInner<T>(
  {
    items,
    itemHeight: propItemHeight,
    height = 400,
    width = "100%",
    overscan = 5,
    renderItem = defaultRenderItem,
    className,
    style,
  }: VirtualListProps<T>,
  ref: Ref<VirtualListHandle>
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const rafRef = useRef<number | null>(null);
  const [measuredItemHeight, setMeasuredItemHeight] = useState(0);

  const itemHeight = propItemHeight ?? measuredItemHeight;

  const totalHeight = items.length * itemHeight;

  // Expose scrollToIndex to parent via ref
  useImperativeHandle(ref, () => ({
    scrollToIndex(index: number, behavior: ScrollBehavior = "auto") {
      const container = containerRef.current;
      if (!container || itemHeight === 0) return;
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      container.scrollTo({ top: clamped * itemHeight, behavior });
    },
  }), [items.length, itemHeight]);

  // Calculate visible range with overscan buffer
  const startIndex = itemHeight > 0 ? Math.max(0, Math.floor(scrollTop / itemHeight) - overscan) : 0;
  const visibleCount = itemHeight > 0 ? Math.ceil(height / itemHeight) : 1;
  const endIndex = itemHeight > 0 ? Math.min(
    items.length,
    Math.floor(scrollTop / itemHeight) + visibleCount + overscan
  ) : 1;

  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use rAF to throttle scroll updates for smooth performance
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(container.scrollTop);
      rafRef.current = null;
    });
  }, []);

  // Clean up rAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Build only the visible items
  const visibleItems: ReactNode[] = [];
  for (let i = startIndex; i < endIndex; i++) {
    const isMeasuring = itemHeight === 0 && i === 0;
    visibleItems.push(
      <div
        key={i}
        ref={isMeasuring ? (el) => {
          if (el && el.offsetHeight > 0) {
            setMeasuredItemHeight(el.offsetHeight);
          }
        } : undefined}
        style={{
          position: "absolute",
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight > 0 ? itemHeight : undefined,
          visibility: isMeasuring ? "hidden" : "visible",
          overflow: "hidden",
        }}
      >
        {renderItem(items[i], i)}
      </div>
    );
  }

  const containerStyle: CSSProperties = {
    overflow: "auto",
    height,
    width,
    position: "relative",
    willChange: "transform",
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      onScroll={handleScroll}
    >
      {/* Spacer div to maintain correct scrollbar size */}
      <div
        style={{
          height: totalHeight,
          position: "relative",
          width: "100%",
        }}
      >
        {visibleItems}
      </div>
    </div>
  );
}

// forwardRef wrapper that preserves the generic type parameter
export const VirtualList = forwardRef(VirtualListInner) as <T>(
  props: VirtualListProps<T> & { ref?: Ref<VirtualListHandle> }
) => ReactElement;
