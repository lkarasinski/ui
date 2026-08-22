import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { clampScroll, ItemTable } from "./item-table";
import type { ItemGroup, ItemTableHandle } from "./item-table";

const NOW = Date.now();

function group(id: string, label: string, ids: string[]): ItemGroup {
  return {
    id,
    label,
    items: ids.map((id) => ({
      id,
      state: "todo",
      flags: [],
      title: `Item ${id}`,
      updatedAt: NOW,
      tags: [],
    })),
  };
}

const groups = [group("open", "Open", ["101", "102"]), group("done", "Done", ["201"])];

function renderTable(overrides: Partial<Parameters<typeof ItemTable>[0]> = {}) {
  return render(
    <ItemTable
      groups={groups}
      status={{ kind: "ready" }}
      storageKey="test.item-table"
      label="work items"
      {...overrides}
    />,
  );
}

describe("ItemTable", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("renders rows with colored prefixes", () => {
    renderTable({
      groups: [
        {
          id: "open",
          label: "Open",
          items: [
            { id: "4821", prefix: { glyph: "#", className: "text-info" }, state: "todo", flags: [], title: "Issue row", updatedAt: NOW, tags: [] },
            { id: "913", prefix: { glyph: "!", className: "text-primary" }, state: "todo", flags: [], title: "Request row", updatedAt: NOW, tags: [] },
          ],
        },
      ],
    });

    const rows = screen.getAllByTestId("item-table-row");
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain("#");
    expect(rows[0].textContent).toContain("4821");
    expect(rows[1].textContent).toContain("!");
    expect(rows[0].querySelector("span.text-info")).not.toBeNull();
    expect(rows[1].querySelector("span.text-primary")).not.toBeNull();
  });

  it("hides empty groups", () => {
    renderTable({ groups: [...groups, group("empty", "Blocked", [])] });

    expect(screen.queryByText("Blocked")).not.toBeInTheDocument();
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("moves focus with j and k and selects with Enter", () => {
    const onSelect = vi.fn();
    renderTable({ onSelect });

    const table = screen.getByRole("listbox");
    fireEvent.keyDown(table, { key: "j" });

    expect(screen.getAllByTestId("item-table-row")[1]).toHaveAttribute("data-focused");

    fireEvent.keyDown(table, { key: "k" });
    fireEvent.keyDown(table, { key: "Enter" });

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "101" }));
  });

  it("does not move focus past the ends of the list", () => {
    renderTable();

    const table = screen.getByRole("listbox");
    fireEvent.keyDown(table, { key: "k" });
    expect(screen.getAllByTestId("item-table-row")[0]).toHaveAttribute("data-focused");

    for (let i = 0; i < 10; i += 1) fireEvent.keyDown(table, { key: "j" });
    expect(screen.getAllByTestId("item-table-row")[2]).toHaveAttribute("data-focused");
  });

  it("jumps to the first and last row with Home and End", () => {
    renderTable();

    const table = screen.getByRole("listbox");
    fireEvent.keyDown(table, { key: "End" });
    expect(screen.getAllByTestId("item-table-row")[2]).toHaveAttribute("data-focused");

    fireEvent.keyDown(table, { key: "Home" });
    expect(screen.getAllByTestId("item-table-row")[0]).toHaveAttribute("data-focused");
  });

  it("marks the initially selected row as active", () => {
    renderTable({ initialSelectedId: "201" });

    const rows = screen.getAllByTestId("item-table-row");
    expect(rows[2]).toHaveAttribute("aria-selected", "true");
    expect(rows[2]).toHaveAttribute("data-focused");
    expect(rows[0]).toHaveAttribute("aria-selected", "false");
  });

  it("selects on click and moves the active row there", () => {
    const onSelect = vi.fn();
    renderTable({ onSelect });

    fireEvent.click(screen.getAllByTestId("item-table-row")[1]);

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "102" }));
    const rows = screen.getAllByTestId("item-table-row");
    expect(rows[1]).toHaveAttribute("data-focused");
    expect(rows[1]).toHaveAttribute("aria-selected", "true");
  });

  it("does not select while moving in confirm mode, only on Enter", () => {
    const onSelect = vi.fn();
    renderTable({ onSelect });

    const table = screen.getByRole("listbox");
    fireEvent.keyDown(table, { key: "j" });
    fireEvent.keyDown(table, { key: "j" });

    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.keyDown(table, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "201" }));
  });

  it("commits the selection on every step in instant mode", () => {
    const onSelect = vi.fn();
    renderTable({ onSelect, selectMode: "instant" });

    const table = screen.getByRole("listbox");
    fireEvent.keyDown(table, { key: "j" });
    fireEvent.keyDown(table, { key: "j" });

    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: "201" }));
    expect(screen.getAllByTestId("item-table-row")[2]).toHaveAttribute("aria-selected", "true");
  });

  it("selects through the imperative ref handle", () => {
    const onSelect = vi.fn();
    const ref = createRef<ItemTableHandle>();
    render(
      <ItemTable groups={groups} status={{ kind: "ready" }} storageKey="test.item-table" label="work items" onSelect={onSelect} ref={ref} />,
    );

    act(() => {
      ref.current?.selectItem("102");
    });

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "102" }));
    expect(screen.getAllByTestId("item-table-row")[1]).toHaveAttribute("data-focused");
    expect(screen.getAllByTestId("item-table-row")[1]).toHaveAttribute("aria-selected", "true");
  });

  it("persists collapsed groups across remounts", () => {
    const first = renderTable();
    fireEvent.click(screen.getByRole("button", { name: /Open/ }));
    first.unmount();

    renderTable();

    expect(screen.getAllByTestId("item-table-row")).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Open/ })).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(screen.getByRole("button", { name: /Open/ }));
    expect(screen.getAllByTestId("item-table-row")).toHaveLength(3);
  });

  it("hints at collapsed groups in the empty state", () => {
    const rendered = renderTable();
    fireEvent.click(screen.getByRole("button", { name: /Open/ }));
    fireEvent.click(screen.getByRole("button", { name: /Done/ }));
    rendered.rerender(
      <ItemTable groups={groups} status={{ kind: "ready" }} storageKey="test.item-table" label="work items" />,
    );

    expect(screen.getByTestId("item-table-empty")).toHaveTextContent("Every group is collapsed.");
  });

  it("shows the full-area empty state when nothing matches", () => {
    renderTable({ groups: [], emptyTitle: "Inbox zero", emptyHint: "Nothing to do." });

    expect(screen.getByTestId("item-table-empty")).toHaveTextContent("Inbox zero");
    expect(screen.getByTestId("item-table-empty")).toHaveTextContent("Nothing to do.");
  });

  it("shows skeleton rows while loading", () => {
    renderTable({ status: { kind: "loading" } });

    expect(screen.getByTestId("item-table-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("item-table-row")).not.toBeInTheDocument();
  });

  it("shows an error banner with retry", () => {
    const onRetry = vi.fn();
    renderTable({ status: { kind: "error", message: "The source is unreachable.", onRetry } });

    expect(screen.getByRole("alert")).toHaveTextContent("The source is unreachable.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("shows an inline banner inside the failed group with a group-scoped retry", () => {
    const onGroupRetry = vi.fn();
    const failing = { ...group("failing", "Portal", []), error: "HTTP 502" };
    renderTable({ groups: [group("open", "Open", ["101"]), failing], onGroupRetry });

    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("alert")).toHaveTextContent("HTTP 502");
    // The healthy group keeps its rows.
    expect(screen.getAllByTestId("item-table-row")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onGroupRetry).toHaveBeenCalledWith("failing");
  });
});

describe("clampScroll", () => {
  const ROW = 44;
  const PADDING = 3 * ROW;
  // A viewport of 400px shows 9 rows; padding is 132px.
  const VIEW = 400;

  it("returns null when the row is comfortably visible", () => {
    expect(clampScroll(0, VIEW, 200, ROW, PADDING)).toBeNull();
    expect(clampScroll(400, VIEW, 600, ROW, PADDING)).toBeNull();
  });

  it("keeps three rows below when the row sits at the bottom edge", () => {
    // Row bottom 312 + padding wants 444 > 0 + 400.
    expect(clampScroll(0, VIEW, 268, ROW, PADDING)).toBe(444 - VIEW);
  });

  it("keeps three rows above when the row sits above the padding line", () => {
    // Row top 133 with scroll 300: pads to content offset 1.
    expect(clampScroll(300, VIEW, 133, ROW, PADDING)).toBe(1);
    // Row top 750 with scroll 500: only reachable by scrolling down to it.
    expect(clampScroll(500, VIEW, 750, ROW, PADDING)).toBe(750 + ROW + PADDING - VIEW);
  });

  it("never returns a negative offset", () => {
    expect(clampScroll(0, VIEW, 0, ROW, PADDING)).toBe(0);
  });
});
