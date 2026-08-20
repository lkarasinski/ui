import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContextSelector } from "use-context-selector";
import { cn } from "@/lib/utils";

type TableDensity = "comfortable" | "compact";

const tableCellVariants = cva("px-3 text-left align-middle", {
  variants: {
    density: {
      comfortable: "py-2.5",
      compact: "py-1.5",
    },
    align: {
      left: "text-left",
      right: "text-right",
      center: "text-center",
    },
    numeric: {
      true: "font-mono tabular-nums",
      false: "",
    },
  },
  defaultVariants: { density: "comfortable", align: "left", numeric: false },
});

type TableContextValue = {
  density: TableDensity;
  stickyHeader: boolean;
};

const TableContext = createContext<TableContextValue | null>(null);

function useTable<T>(selector: (context: TableContextValue) => T) {
  return useContextSelector(TableContext, (context) => (context ? selector(context) : (undefined as T)));
}

export type TableRootProps = ComponentProps<"table"> & {
  /** `compact` halves the row padding for log-like tables. */
  density?: TableDensity;
  /** Pins the header while the scroll container moves. Needs a scrolling ancestor with a height. */
  stickyHeader?: boolean;
};

/**
 * A data table.
 *
 * It stays a real `table`, so column alignment, row semantics, and screen-reader
 * navigation come from the platform. Density and the sticky header are shared
 * through context, which is what keeps a cell from taking a `density` prop.
 *
 * Sorting, selection, and pagination are the consumer's: the table renders what
 * it is given. `Table.SortButton` and the `selected` prop on a row only cover the
 * presentation of that state.
 */
export function TableRoot({ density = "comfortable", stickyHeader = false, className, children, ...props }: TableRootProps) {
  return (
    <TableContext.Provider value={{ density, stickyHeader }}>
      <table data-density={density} className={cn("w-full border-collapse text-sm", className)} {...props}>
        {children}
      </table>
    </TableContext.Provider>
  );
}

/**
 * A horizontal scroll container for the table.
 *
 * A table cannot shrink below its content, so on a narrow viewport something has
 * to scroll. Doing it here keeps the page itself from scrolling sideways.
 */
export function TableScroll({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("w-full min-w-0 overflow-x-auto", className)} {...props} />;
}

/** The header group. It carries the seam that separates the labels from the data. */
export function TableHead({ className, ...props }: ComponentProps<"thead">) {
  const stickyHeader = useTable((context) => context.stickyHeader);
  return (
    <thead
      className={cn(
        "[&_th]:border-b [&_th]:border-border [&_th]:bg-gradient-to-b [&_th]:from-white [&_th]:to-card",
        stickyHeader && "[&_th]:sticky [&_th]:top-0 [&_th]:z-1",
        className,
      )}
      {...props}
    />
  );
}

/** The row group holding the data. Rows are separated by a hairline, not by a fill. */
export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:not(:last-child)]:border-b [&_tr:not(:last-child)]:border-border", className)} {...props} />;
}

/** A summary row group, separated from the body by its own rule. */
export function TableFoot({ className, ...props }: ComponentProps<"tfoot">) {
  return <tfoot className={cn("[&_td]:border-t [&_td]:border-border [&_td]:font-medium", className)} {...props} />;
}

export type TableRowProps = ComponentProps<"tr"> & {
  selected?: boolean;
  /** Adds a hover fill. Use it only when the whole row really is a click target. */
  interactive?: boolean;
};

/** One row. `selected` and `interactive` are presentation only — the consumer owns the state. */
export function TableRow({ selected = false, interactive = false, className, ...props }: TableRowProps) {
  return (
    <tr
      data-selected={selected || undefined}
      aria-selected={selected || undefined}
      className={cn(
        "transition-colors duration-150",
        interactive && "cursor-pointer hover:bg-secondary-hover",
        selected && "bg-primary/6 hover:bg-primary/8",
        className,
      )}
      {...props}
    />
  );
}

export type TableHeaderCellProps = ComponentProps<"th"> & Pick<VariantProps<typeof tableCellVariants>, "align" | "numeric">;

/** A column label. Keep it short — the caption is the place for an explanation. */
export function TableHeaderCell({ align, numeric, className, ...props }: TableHeaderCellProps) {
  const density = useTable((context) => context.density);
  return (
    <th
      scope="col"
      className={cn(tableCellVariants({ density, align, numeric }), "text-xs font-medium tracking-[0.02em] text-muted-foreground whitespace-nowrap", className)}
      {...props}
    />
  );
}

export type TableCellProps = ComponentProps<"td"> & Pick<VariantProps<typeof tableCellVariants>, "align" | "numeric">;

/** A data cell. `numeric` switches to the mono font with tabular figures so columns line up. */
export function TableCell({ align, numeric, className, ...props }: TableCellProps) {
  const density = useTable((context) => context.density);
  return <td className={cn(tableCellVariants({ density, align, numeric }), className)} {...props} />;
}

/** A row header, for tables whose first column identifies the row. */
export function TableRowHeaderCell({ align, numeric, className, ...props }: TableHeaderCellProps) {
  const density = useTable((context) => context.density);
  return <th scope="row" className={cn(tableCellVariants({ density, align, numeric }), "font-medium", className)} {...props} />;
}

export type TableSortButtonProps = Omit<ComponentProps<"button">, "children"> & {
  direction: "asc" | "desc" | null;
  children: ReactNode;
};

/**
 * The sortable-column control.
 *
 * It renders inside a header cell and only reports intent — the caller sorts the
 * data. Set `aria-sort` on the surrounding `Table.HeaderCell` so the state is
 * announced, not just drawn.
 */
export function TableSortButton({ direction, className, children, ...props }: TableSortButtonProps) {
  const Icon = direction === "asc" ? ChevronUp : direction === "desc" ? ChevronDown : ChevronsUpDown;

  return (
    <button
      type="button"
      className={cn(
        "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-primary/25 [&_svg]:size-3",
        direction && "text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <Icon aria-hidden="true" className={cn(!direction && "opacity-60")} />
    </button>
  );
}

/** A description of the table. Visible by default; add `sr-only` when the heading above already says it. */
export function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return <caption className={cn("px-3 pb-2.5 text-left text-sm text-muted-foreground", className)} {...props} />;
}

/** The empty state, as a row that spans every column. */
export function TableEmpty({ colSpan, className, children, ...props }: ComponentProps<"td"> & { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn("px-3 py-10 text-center text-sm text-muted-foreground", className)} {...props}>
        {children}
      </td>
    </tr>
  );
}

TableRoot.Scroll = TableScroll;
TableRoot.Head = TableHead;
TableRoot.Body = TableBody;
TableRoot.Foot = TableFoot;
TableRoot.Row = TableRow;
TableRoot.HeaderCell = TableHeaderCell;
TableRoot.RowHeaderCell = TableRowHeaderCell;
TableRoot.Cell = TableCell;
TableRoot.SortButton = TableSortButton;
TableRoot.Caption = TableCaption;
TableRoot.Empty = TableEmpty;

export const Table = TableRoot;
