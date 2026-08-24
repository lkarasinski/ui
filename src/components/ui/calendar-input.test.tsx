import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalendarInput } from "./calendar-input";
import { useState } from "react";

afterEach(cleanup);

const JANUARY = new Date(2026, 0, 1);
const day = (iso: string) => screen.getByRole("gridcell", { name: new RegExp(`${expectedLabel(iso)}`) });

function expectedLabel(iso: string) {
  const [year, month, date] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(year, month - 1, date),
  );
}

function openPicker() {
  fireEvent.click(screen.getByRole("button", { name: "Choose date" }));
}

describe("CalendarInput", () => {
  it("opens a calendar in a popover when the trigger is clicked", () => {
    render(<CalendarInput defaultMonth={JANUARY} placeholder="Pick a date" />);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    openPicker();
    expect(screen.getByRole("grid")).toBeInTheDocument();
    expect(day("2026-01-15")).toBeInTheDocument();
  });

  it("shows the picked date and closes after a single-mode pick", () => {
    const onValueChange = vi.fn();
    render(<CalendarInput defaultMonth={JANUARY} onValueChange={onValueChange} locale="en-GB" />);
    openPicker();
    fireEvent.click(day("2026-01-14"));
    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 0, 14));
    expect(screen.getByRole("button", { name: "Choose date" })).toHaveTextContent("14 Jan 2026");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("keeps the popover open mid-range and closes when it completes", () => {
    const onValueChange = vi.fn();
    render(<CalendarInput mode="range" defaultMonth={JANUARY} onValueChange={onValueChange} locale="en-GB" />);
    openPicker();

    fireEvent.click(day("2026-01-10"));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 0, 10), to: undefined });
    expect(screen.getByRole("grid")).toBeInTheDocument();

    fireEvent.click(day("2026-01-16"));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 0, 10), to: new Date(2026, 0, 16) });
    expect(screen.getByRole("button", { name: "Choose date" })).toHaveTextContent("10 Jan 2026 – 16 Jan 2026");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("clears through the clear action and returns focus to the trigger", () => {
    const onValueChange = vi.fn();
    render(<CalendarInput defaultValue={new Date(2026, 0, 15)} onValueChange={onValueChange} locale="en-GB" clearable />);
    const trigger = screen.getByRole("button", { name: "Choose date" });
    expect(trigger).toHaveTextContent("15 Jan 2026");

    fireEvent.click(screen.getByRole("button", { name: "Clear value" }));
    expect(onValueChange).toHaveBeenCalledWith(undefined);
    expect(trigger).not.toHaveTextContent("Jan");
    expect(document.activeElement).toBe(trigger);
  });

  it("does not open while disabled", () => {
    render(<CalendarInput disabled defaultMonth={JANUARY} />);
    openPicker();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("submits the selection through a hidden form input", () => {
    function Form() {
      const [value, setValue] = useState<Date | undefined>(new Date(2026, 0, 15));
      return <CalendarInput value={value} onValueChange={setValue} name="deadline" />;
    }
    render(<Form />);
    const hidden = document.querySelector('input[type="hidden"][name="deadline"]');
    expect(hidden).toHaveValue("2026-01-15");
  });
});
