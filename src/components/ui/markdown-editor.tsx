import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Code,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ComponentProps } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

type MarkdownStorage = { getMarkdown: () => string };

function getMarkdown(editor: Editor): string {
  const storage = (editor.storage as unknown as Record<string, unknown>).markdown as MarkdownStorage | undefined;
  return storage?.getMarkdown() ?? "";
}

type MarkdownEditorContextValue = {
  editor: Editor | null;
  focused: boolean;
};

const MarkdownEditorContext = createContext<MarkdownEditorContextValue | null>(null);

function useMarkdownEditor<T>(selector: (context: MarkdownEditorContextValue) => T): T {
  return useContextSelector(MarkdownEditorContext, (context) => (context ? selector(context) : (undefined as T)));
}

export type MarkdownEditorRootProps = Omit<ComponentProps<"div">, "onChange" | "defaultValue"> & {
  /** Markdown value when controlled. Omit it and the root keeps its own state. */
  value?: string;
  /** Initial markdown when uncontrolled. */
  defaultValue?: string;
  /** Called with the markdown serialization of the document after every edit. */
  onValueChange?: (markdown: string) => void;
  /** When false the content cannot be edited. The menu bar stays usable to read state but commands are disabled. */
  editable?: boolean;
};

/**
 * A rich text editor that reads and writes markdown, built on TipTap.
 *
 * The root owns the TipTap instance and the markdown value — controlled through
 * `value`, uncontrolled through `defaultValue`. Compose `MenuBar`, toolbar
 * pieces, and `Content` inside it; every piece reads the editor from context.
 */
export function MarkdownEditorRoot({ value, defaultValue = "", onValueChange, editable = true, className, children, ...props }: MarkdownEditorRootProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);
  const currentValue = value ?? uncontrolledValue;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Markdown.configure({ html: false, linkify: false, breaks: false }),
    ],
    content: currentValue,
    editable,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onUpdate: ({ editor }) => {
      const markdown = getMarkdown(editor);
      if (value === undefined) setUncontrolledValue(markdown);
      onValueChange?.(markdown);
    },
  });

  // Sync an externally provided value into the document. Skipped when
  // uncontrolled, and skipped while the external value matches what the editor
  // already serializes to, so typing does not fight the caret.
  useEffect(() => {
    if (!editor || value === undefined || value === getMarkdown(editor)) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (editor && editor.isEditable !== editable) editor.setEditable(editable);
  }, [editor, editable]);

  return (
    <MarkdownEditorContext.Provider value={{ editor, focused }}>
      <div
        className={cn(
          "flex w-full min-w-0 flex-col overflow-hidden rounded-md border bg-card text-card-foreground transition-colors duration-150",
          focused ? "border-ring" : "border-input",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </MarkdownEditorContext.Provider>
  );
}

const contentClassName =
  "flex min-h-40 w-full flex-1 flex-col px-3 py-2.5 text-sm outline-none [&_.ProseMirror]:flex-1 [&_.ProseMirror]:outline-none [&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-ring [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:rounded-sm [&_code]:bg-muted [&_code]:font-mono [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_h1]:mt-4 [&_h1]:mb-1 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:mb-1 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-0.5 [&_h3]:text-sm [&_h3]:font-semibold [&_hr]:my-3 [&_hr]:border-border [&_li]:marker:text-muted-foreground [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p:first-child]:mt-0 [&_p]:my-1.5 [&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-2.5 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_strong]:font-semibold [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5";

/** The editing surface. Renders the TipTap document bound to the root's editor. */
export function MarkdownEditorContent({ className, ...props }: Omit<ComponentProps<typeof EditorContent>, "editor">) {
  const editor = useMarkdownEditor((context) => context.editor);
  if (!editor) return null;
  return <EditorContent editor={editor} className={cn(contentClassName, className)} {...props} />;
}

/** A row of formatting controls. Purely a layout piece — compose toggles inside it. */
export function MarkdownEditorMenuBar({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className={cn("flex flex-wrap items-center gap-0.5 border-b border-input bg-secondary p-1", className)}
      {...props}
    />
  );
}

/** A vertical divider between groups of toolbar toggles. */
export function MarkdownEditorMenuSeparator({ className, ...props }: ComponentProps<"div">) {
  return <div role="separator" aria-orientation="vertical" className={cn("mx-1 h-5 w-px shrink-0 bg-border", className)} {...props} />;
}

type MenuToggleConfig = {
  label: string;
  /** Keyboard shortcut hint announced through `aria-keyshortcuts`. */
  shortcut?: string;
  icon: LucideIcon;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
  canRun: (editor: Editor) => boolean;
};

function MenuToggle({ config }: { config: MenuToggleConfig }) {
  const editor = useMarkdownEditor((context) => context.editor);
  const state = useEditorState({
    editor,
    selector: () => ({
      active: editor ? config.isActive(editor) : false,
      enabled: Boolean(editor?.isEditable && config.canRun(editor)),
    }),
  });
  if (!editor || !state) return null;

  const Icon = config.icon;

  return (
    <button
      type="button"
      title={config.label}
      aria-label={config.label}
      aria-keyshortcuts={config.shortcut}
      aria-pressed={state.active}
      disabled={!state.enabled}
      onClick={() => config.run(editor)}
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors duration-150 select-none",
        "hover:not-disabled:bg-secondary-hover hover:not-disabled:text-card-foreground",
        "focus-visible:ring-3 focus-visible:ring-primary/25 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        state.active && "bg-primary/10 text-primary",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

/** Toggles bold on the selection. */
export function MarkdownEditorBold() {
  return (
    <MenuToggle
      config={{
        label: "Bold",
        shortcut: "Meta+B",
        icon: Bold,
        isActive: (editor) => editor.isActive("bold"),
        run: (editor) => editor.chain().focus().toggleBold().run(),
        canRun: (editor) => editor.can().chain().focus().toggleBold().run(),
      }}
    />
  );
}

/** Toggles italic on the selection. */
export function MarkdownEditorItalic() {
  return (
    <MenuToggle
      config={{
        label: "Italic",
        shortcut: "Meta+I",
        icon: Italic,
        isActive: (editor) => editor.isActive("italic"),
        run: (editor) => editor.chain().focus().toggleItalic().run(),
        canRun: (editor) => editor.can().chain().focus().toggleItalic().run(),
      }}
    />
  );
}

/** Toggles strikethrough on the selection. */
export function MarkdownEditorStrike() {
  return (
    <MenuToggle
      config={{
        label: "Strikethrough",
        icon: Strikethrough,
        isActive: (editor) => editor.isActive("strike"),
        run: (editor) => editor.chain().focus().toggleStrike().run(),
        canRun: (editor) => editor.can().chain().focus().toggleStrike().run(),
      }}
    />
  );
}

/** Toggles inline code on the selection. */
export function MarkdownEditorCode() {
  return (
    <MenuToggle
      config={{
        label: "Code",
        shortcut: "Meta+E",
        icon: Code,
        isActive: (editor) => editor.isActive("code"),
        run: (editor) => editor.chain().focus().toggleCode().run(),
        canRun: (editor) => editor.can().chain().focus().toggleCode().run(),
      }}
    />
  );
}

export type MarkdownEditorHeadingProps = {
  level?: 1 | 2 | 3;
};

/** Toggles a heading of the given level on the current block. */
export function MarkdownEditorHeading({ level = 2 }: MarkdownEditorHeadingProps) {
  return (
    <MenuToggle
      config={{
        label: `Heading ${level}`,
        icon: Heading2,
        isActive: (editor) => editor.isActive("heading", { level }),
        run: (editor) => editor.chain().focus().toggleHeading({ level }).run(),
        canRun: (editor) => editor.can().chain().focus().toggleHeading({ level }).run(),
      }}
    />
  );
}

/** Toggles a bulleted list on the current block. */
export function MarkdownEditorBulletList() {
  return (
    <MenuToggle
      config={{
        label: "Bullet list",
        icon: List,
        isActive: (editor) => editor.isActive("bulletList"),
        run: (editor) => editor.chain().focus().toggleBulletList().run(),
        canRun: (editor) => editor.can().chain().focus().toggleBulletList().run(),
      }}
    />
  );
}

/** Toggles a numbered list on the current block. */
export function MarkdownEditorOrderedList() {
  return (
    <MenuToggle
      config={{
        label: "Numbered list",
        icon: ListOrdered,
        isActive: (editor) => editor.isActive("orderedList"),
        run: (editor) => editor.chain().focus().toggleOrderedList().run(),
        canRun: (editor) => editor.can().chain().focus().toggleOrderedList().run(),
      }}
    />
  );
}

/** Toggles a block quote on the current block. */
export function MarkdownEditorBlockquote() {
  return (
    <MenuToggle
      config={{
        label: "Quote",
        icon: Quote,
        isActive: (editor) => editor.isActive("blockquote"),
        run: (editor) => editor.chain().focus().toggleBlockquote().run(),
        canRun: (editor) => editor.can().chain().focus().toggleBlockquote().run(),
      }}
    />
  );
}

/** Undoes the last change. */
export function MarkdownEditorUndo() {
  return (
    <MenuToggle
      config={{
        label: "Undo",
        shortcut: "Meta+Z",
        icon: Undo2,
        isActive: () => false,
        run: (editor) => editor.chain().focus().undo().run(),
        canRun: (editor) => editor.can().undo(),
      }}
    />
  );
}

/** Redoes the last undone change. */
export function MarkdownEditorRedo() {
  return (
    <MenuToggle
      config={{
        label: "Redo",
        shortcut: "Meta+Shift+Z",
        icon: Redo2,
        isActive: () => false,
        run: (editor) => editor.chain().focus().redo().run(),
        canRun: (editor) => editor.can().redo(),
      }}
    />
  );
}

/** A ready-made default menu bar with the common formatting toggles. */
export function MarkdownEditorDefaultMenuBar() {
  return (
    <MarkdownEditorMenuBar>
      <MarkdownEditorUndo />
      <MarkdownEditorRedo />
      <MarkdownEditorMenuSeparator />
      <MarkdownEditorHeading level={1} />
      <MarkdownEditorHeading level={2} />
      <MarkdownEditorHeading level={3} />
      <MarkdownEditorMenuSeparator />
      <MarkdownEditorBold />
      <MarkdownEditorItalic />
      <MarkdownEditorStrike />
      <MarkdownEditorCode />
      <MarkdownEditorMenuSeparator />
      <MarkdownEditorBulletList />
      <MarkdownEditorOrderedList />
      <MarkdownEditorBlockquote />
    </MarkdownEditorMenuBar>
  );
}

MarkdownEditorRoot.Content = MarkdownEditorContent;

export const MarkdownEditor = MarkdownEditorRoot;
