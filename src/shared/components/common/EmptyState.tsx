"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "../ui/Button";
import {
  FileText,
  Search,
  Home,
  Briefcase,
  Users,
  CreditCard,
  Bell,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";

type EmptyStateType =
  | "no-data"
  | "no-results"
  | "no-appraisals"
  | "no-orders"
  | "no-jobs"
  | "no-team"
  | "no-invoices"
  | "no-notifications"
  | "error";

interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultIcons: Record<EmptyStateType, LucideIcon> = {
  "no-data": FolderOpen,
  "no-results": Search,
  "no-appraisals": Home,
  "no-orders": FileText,
  "no-jobs": Briefcase,
  "no-team": Users,
  "no-invoices": CreditCard,
  "no-notifications": Bell,
  error: FolderOpen,
};

export function EmptyState({
  type = "no-data",
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const Icon = icon || defaultIcons[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[var(--muted-foreground)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] max-w-sm mb-6">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button onClick={action.onClick} variant="primary">
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states
export function NoAppraisalsEmptyState({
  onCreateNew,
}: {
  onCreateNew: () => void;
}) {
  return (
    <EmptyState
      type="no-appraisals"
      title="No appraisals yet"
      description="Get started by creating your first AI-powered property appraisal."
      action={{
        label: "New Appraisal",
        onClick: onCreateNew,
      }}
    />
  );
}

export function NoOrdersEmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <EmptyState
      type="no-orders"
      title="No orders yet"
      description="Order an on-site inspection for more detailed property valuations."
      action={{
        label: "Create Order",
        onClick: onCreateNew,
      }}
    />
  );
}

export function NoJobsEmptyState() {
  return (
    <EmptyState
      type="no-jobs"
      title="No available jobs"
      description="Check back later for new inspection jobs in your area."
    />
  );
}

export function NoSearchResultsEmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <EmptyState
      type="no-results"
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try adjusting your search.`}
      action={{
        label: "Clear Search",
        onClick: onClear,
      }}
    />
  );
}

export function ErrorEmptyState({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      type="error"
      title="Error"
      description={message}
      action={
        onRetry
          ? {
              label: "Try Again",
              onClick: onRetry,
            }
          : undefined
      }
    />
  );
}
