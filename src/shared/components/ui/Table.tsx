"use client";

import { cn } from "@/shared/lib/utils";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

function TableHeader({ className, children, ...props }: TableHeaderProps) {
  return (
    <thead className={cn("bg-[var(--secondary)] border-b border-[var(--border)]", className)} {...props}>
      {children}
    </thead>
  );
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody className={cn("divide-y divide-[var(--border)]", className)} {...props}>
      {children}
    </tbody>
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
}

function TableRow({ className, hoverable = true, children, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(hoverable && "hover:bg-[var(--secondary)] transition-colors", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td className={cn("px-6 py-4 whitespace-nowrap", className)} {...props}>
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

function TableEmpty({ icon, title, description, action, colSpan }: TableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        {icon && <div className="mx-auto mb-4 text-[var(--muted)]">{icon}</div>}
        <p className="font-medium text-[var(--foreground)]">{title}</p>
        {description && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </td>
    </tr>
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty };
