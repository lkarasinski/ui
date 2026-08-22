import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ResizableDetailPane } from "./resizable-detail-pane";

const STORAGE_KEY = "test.detail-pane-width";

beforeAll(() => {
  // jsdom has no pointer capture; the drag logic only needs it not to throw.
  Element.prototype.setPointerCapture = vi.fn();
  Element.prototype.releasePointerCapture = vi.fn();
});

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
});

function renderPane() {
  return render(
    <ResizableDetailPane label="Details" storageKey={STORAGE_KEY}>
      <p>panel content</p>
    </ResizableDetailPane>,
  );
}

function dragHandleBy(deltaX: number) {
  const handle = screen.getByTestId("detail-pane-resize-handle");
  fireEvent.pointerDown(handle, { button: 0, pointerId: 1, clientX: 500 });
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: 500 + deltaX });
}

function releaseHandle() {
  fireEvent.pointerUp(screen.getByTestId("detail-pane-resize-handle"), { pointerId: 1 });
}

describe("ResizableDetailPane", () => {
  it("renders with the default width of 440px", () => {
    const { container } = renderPane();
    expect(container.firstElementChild).toHaveStyle({ width: "440px" });
  });

  it("widens when dragged to the left and persists the width on release", () => {
    const { container } = renderPane();
    dragHandleBy(-80);
    expect(container.firstElementChild).toHaveStyle({ width: "520px" });
    releaseHandle();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("520");
  });

  it("narrows when dragged to the right", () => {
    const { container } = renderPane();
    dragHandleBy(60);
    expect(container.firstElementChild).toHaveStyle({ width: "380px" });
  });

  it("clamps the width to the allowed range while dragging", () => {
    const { container } = renderPane();
    dragHandleBy(10_000);
    expect(container.firstElementChild).toHaveStyle({ width: "280px" });
    releaseHandle();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("280");
  });

  it("restores the persisted width after a remount", () => {
    const first = renderPane();
    dragHandleBy(-100);
    releaseHandle();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("540");
    first.unmount();

    const second = renderPane();
    expect(second.container.firstElementChild).toHaveStyle({ width: "540px" });
  });

  it("resizes with the arrow keys and persists immediately", () => {
    const { container } = renderPane();
    const handle = screen.getByTestId("detail-pane-resize-handle");
    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    expect(container.firstElementChild).toHaveStyle({ width: "464px" });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("464");
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(container.firstElementChild).toHaveStyle({ width: "440px" });
  });

  it("ignores drags that do not start with the primary button", () => {
    const { container } = renderPane();
    const handle = screen.getByTestId("detail-pane-resize-handle");
    fireEvent.pointerDown(handle, { button: 2, pointerId: 1, clientX: 500 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 400 });
    expect(container.firstElementChild).toHaveStyle({ width: "440px" });
  });
});
