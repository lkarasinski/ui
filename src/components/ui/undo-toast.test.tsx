import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { UndoToast } from "./undo-toast";

describe("UndoToast", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("expires once after the duration", () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();

    render(<UndoToast message="Report dismissed" duration={5000} onExpire={onExpire} />);
    act(() => {
      vi.advanceTimersByTime(5100);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("does not expire while hovered and resumes after", () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();

    render(<UndoToast message="Report dismissed" duration={5000} onExpire={onExpire} />);
    fireEvent.mouseEnter(screen.getByTestId("undo-toast"));
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(onExpire).not.toHaveBeenCalled();

    fireEvent.mouseLeave(screen.getByTestId("undo-toast"));
    act(() => {
      vi.advanceTimersByTime(5100);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("calls onAction when the action button is pressed", () => {
    const onAction = vi.fn();
    render(<UndoToast message="Report dismissed" duration={60_000} onAction={onAction} />);

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
