import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "./button";

afterEach(cleanup);

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("never passes a ref to a Fragment", () => {
    // popLayout mode attaches a measuring ref to each child; a Fragment child
    // would make React log "Invalid prop `ref` supplied to `React.Fragment`".
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <Button>
        <span>icon</span>
        Add project
      </Button>,
    );

    expect(errorSpy).not.toHaveBeenCalledWith(expect.stringContaining("Invalid prop"));
    errorSpy.mockRestore();
  });
});
