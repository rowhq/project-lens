"use client";

import { cn } from "@/shared/lib/utils";

type TableProps = React.HTMLAttributes<HTMLTableElement>;

function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

type TableHeaderProps = React.HTMLAttributes<HTMLTableSectionElement>;

function TableHeader({ className, children, ...props }: TableHeaderProps) {
  return (
    <thead
      className={cn(
        "bg-[var(--card)] border-b border-[var(--border)]",
        className,
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

type TableBodyProps = React.HTMLAttributes<HTMLTableSectionElement>;

function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody
      className={cn("divide-y divide-[var(--border)]/50", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
}

function TableRow({
  className,
  hoverable = true,
  children,
  ...props
}: TableRowProps) {
  return (
    <tr
      className={cn(
        hoverable &&
          "hover:bg-[var(--muted)]/50 transition-colors duration-300",
        className,
      )}
      style={{
        transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
      }}
      {...props}
    >
      {children}
    </tr>
  );
}

type TableHeadProps = React.ThHTMLAttributes<HTMLTableCellElement>;

function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        "px-4 lg:px-6 py-2 lg:py-3 text-left",
        "text-label font-mono uppercase tracking-widest",
        "text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

type TableCellProps = React.TdHTMLAttributes<HTMLTableCellElement>;

function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td
      className={cn(
        "px-4 lg:px-6 py-3 lg:py-4 text-body-sm text-[var(--foreground)]",
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

interface TableEmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  colSpan: number;
}

function TableEmpty({
  icon,
  title,
  description,
  action,
  colSpan,
}: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-16 text-center">
        {icon && (
          <div className="mx-auto mb-4 text-[var(--muted-foreground)] w-12 h-12">
            {icon}
          </div>
        )}
        <p className="font-medium text-[var(--foreground)]">{title}</p>
        {description && (
          <p className="mt-2 text-body-sm text-[var(--muted-foreground)]">
            {description}
          </p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </td>
    </tr>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
};
