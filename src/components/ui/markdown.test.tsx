import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Markdown } from "./markdown";

afterEach(cleanup);

describe("Markdown", () => {
  it("renders common block and inline markdown", () => {
    render(<Markdown text={"# Title\n\nA **bold** and `code` bit.\n\n> quoted"} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Title");
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    expect(screen.getByText("code").tagName).toBe("CODE");
    expect(screen.getByText("quoted").closest("blockquote")).toBeInTheDocument();
  });

  it("opens links in a new tab", () => {
    render(<Markdown text="[docs](https://example.com)" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("never renders raw HTML from the untrusted source", () => {
    render(<Markdown text={'<img src=x onerror="alert(1)">plain text'} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByTestId("markdown")).toHaveTextContent("plain text");
  });
});
