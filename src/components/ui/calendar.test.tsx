import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Calendar, type CalendarSingleProps } from "./calendar";

afterEach(cleanup);

const JANUARY = new Date(2026, 0, 1);
const day = (iso: string) => screen.getByRole("gridcell", { name: new RegExp(`^${expectedLabel(iso)}$`) });

function expectedLabel(iso: string) {
  const [year, month, date] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(year, month - 1, date),
  );
}

function renderSingleMonth(props?: Partial<CalendarSingleProps>) {
  return render(
    <Calendar.Root defaultMonth={JANUARY} {...props}>
      <Calendar.Header>
        <Calendar.Previous />
        <Calendar.Title />
        <Calendar.Next />
      </Calendar.Header>
      <Calendar.Grid />
    </Calendar.Root>,
  );
}

function renderRangeMonth(onValueChange: (value: { from: Date | undefined; to: Date | undefined }) => void) {
  return render(
    <Calendar.Root mode="range" defaultMonth={JANUARY} onValueChange={onValueChange}>
      <Calendar.Header>
        <Calendar.Previous />
        <Calendar.Title />
        <Calendar.Next />
      </Calendar.Header>
      <Calendar.Grid />
    </Calendar.Root>,
  );
}

describe("Calendar", () => {
  it("renders the month title and its days", () => {
    renderSingleMonth();
    expect(screen.getByText("January 2026")).toBeInTheDocument();
    expect(day("2026-01-15")).toBeInTheDocument();
  });

  it("selects a single date and reports it", () => {
    const onValueChange = vi.fn();
    renderSingleMonth({ onValueChange });
    fireEvent.click(day("2026-01-14"));
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 0, 14));
    expect(day("2026-01-14")).toHaveAttribute("aria-selected", "true");
  });

  it("builds a range in two clicks and restarts on an earlier click", () => {
    const onValueChange = vi.fn();
    renderRangeMonth(onValueChange);

    fireEvent.click(day("2026-01-20"));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 0, 20), to: undefined });

    fireEvent.click(day("2026-01-24"));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 0, 20), to: new Date(2026, 0, 24) });

    fireEvent.click(day("2026-01-05"));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 0, 5), to: undefined });
  });

  it("ignores clicks on dates the predicate disables", () => {
    const onValueChange = vi.fn();
    renderSingleMonth({ onValueChange, isDateDisabled: (date) => date.getDate() === 10 });
    expect(day("2026-01-10")).toBeDisabled();
    fireEvent.click(day("2026-01-10"));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("moves keyboard focus with the arrow keys", () => {
    renderSingleMonth({ defaultValue: new Date(2026, 0, 15) });
    day("2026-01-15").focus();
    fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowRight" });
    expect(document.activeElement?.getAttribute("data-date")).toBe("2026-01-16");
  });

  it("changes the visible month from the navigation buttons", () => {
    renderSingleMonth();
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("February 2026")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText("January 2026")).toBeInTheDocument();
  });
});
