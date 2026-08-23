import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useItemTableNav } from "./item-table";
import type { TableItem } from "./item-table";

afterEach(cleanup);

function item(id: string): TableItem {
  return { id, state: "todo", flags: [], title: `Item ${id}`, updatedAt: 0, tags: [] };
}

const A = item("a");
const B = item("b");
const C = item("c");

type HookProps = Parameters<typeof useItemTableNav>[0];

function renderNav(props: HookProps) {
  return renderHook((nextProps: HookProps) => useItemTableNav(nextProps), { initialProps: props });
}

describe("useItemTableNav", () => {
  it("keeps the cursor on the selected id across a refetch-driven reorder", () => {
    const onSelect = vi.fn();
    const { result, rerender } = renderNav({ items: [A, B, C], mode: "instant", onSelect });

    act(() => {
      result.current.selectId("b");
    });
    expect(result.current.focusIndex).toBe(1);

    rerender({ items: [C, A, B], mode: "instant", onSelect });

    expect(result.current.selectedId).toBe("b");
    expect(result.current.focusIndex).toBe(2);
  });

  it("falls back to the nearest remaining row when the selected item vanishes", () => {
    const onSelect = vi.fn();
    const { result, rerender } = renderNav({ items: [A, B, C], mode: "instant", onSelect });

    act(() => {
      result.current.selectId("c");
    });
    expect(result.current.focusIndex).toBe(2);

    rerender({ items: [A, B], mode: "instant", onSelect });

    expect(result.current.selectedId).toBe("b");
    expect(result.current.focusIndex).toBe(1);
  });

  it("clamps the fallback when trailing items vanish", () => {
    const onSelect = vi.fn();
    const { result, rerender } = renderNav({ items: [A, B, C], mode: "instant", onSelect });

    act(() => {
      result.current.selectId("a");
    });

    rerender({ items: [A], mode: "instant", onSelect });

    expect(result.current.selectedId).toBe("a");
    expect(result.current.focusIndex).toBe(0);
  });

  it("auto-selects the first row once data arrives in instant mode", () => {
    const onSelect = vi.fn();
    const { result, rerender } = renderNav({ items: [], mode: "instant", onSelect });
    expect(result.current.selectedId).toBeUndefined();

    rerender({ items: [A, B], mode: "instant", onSelect });

    expect(result.current.selectedId).toBe("a");
    expect(result.current.focusIndex).toBe(0);
    // Bookkeeping is silent; onSelect only fires on real user commits.
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("does not auto-select in confirm mode until the user commits", () => {
    const onSelect = vi.fn();
    const { result } = renderNav({ items: [A, B], mode: "confirm", onSelect });
    expect(result.current.selectedId).toBeUndefined();

    act(() => {
      result.current.handleKeyDown(new KeyboardEvent("keydown", { key: "j" }) as never);
    });

    expect(result.current.focusIndex).toBe(1);
    expect(result.current.selectedId).toBeUndefined();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("keeps the keyboard cursor anchored in confirm mode when items reorder", () => {
    const onSelect = vi.fn();
    const { result, rerender } = renderNav({ items: [A, B, C], mode: "confirm", onSelect });

    act(() => {
      result.current.handleKeyDown(new KeyboardEvent("keydown", { key: "j" }) as never);
    });
    expect(result.current.focusIndex).toBe(1);

    rerender({ items: [B, A, C], mode: "confirm", onSelect });

    // Confirm mode keeps the browsing position; only identity moves rows.
    expect(result.current.focusIndex).toBe(1);
  });

  it("still selects nothing when a refetch returns an empty list", () => {
    const onSelect = vi.fn();
    const { result, rerender } = renderNav({ items: [A], mode: "instant", onSelect });

    rerender({ items: [], mode: "instant", onSelect });

    expect(result.current.focusIndex).toBe(-1);
  });
});
