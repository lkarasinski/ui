import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export type MarkdownProps = {
  /** Markdown source; untrusted, so raw HTML never renders. */
  text: string;
  className?: string;
};

/**
 * Read-only markdown for descriptions, notes, and other text that arrives from
 * somewhere you do not control. react-markdown escapes raw HTML by default,
 * which is what untrusted input needs; links open in a new tab.
 */
export function Markdown({ text, className }: MarkdownProps) {
  return (
    <div
      data-testid="markdown"
      className={cn(
        "flex flex-col gap-2 text-[13px] leading-5 text-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
        "[&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_code]:py-px [&_code]:font-mono [&_code]:text-[12px]",
        "[&_h1]:mt-1 [&_h1]:text-sm [&_h1]:font-semibold [&_h2]:mt-1 [&_h2]:text-[13px] [&_h2]:font-semibold [&_h3]:mt-1 [&_h3]:text-[13px] [&_h3]:font-semibold",
        "[&_hr]:border-border",
        "[&_img]:max-w-full [&_img]:rounded",
        "[&_li]:ml-4 [&_ol>li]:list-decimal [&_ul>li]:list-disc",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-secondary [&_pre]:p-2.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        className,
      )}
    >
      <ReactMarkdown
        components={{
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
