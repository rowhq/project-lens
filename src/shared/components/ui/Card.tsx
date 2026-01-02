"use client";

import { cn } from "@/shared/lib/utils";
import { LedgerCorners } from "./Decorations";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  withBrackets?: boolean;
  bracketColor?: "lime" | "white" | "gray";
}

function Card({
  className,
  variant = "bordered",
  padding = "md",
  withBrackets = false,
  bracketColor = "gray",
  children,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-gray-900",
    bordered:
      "bg-gray-900 border border-gray-800 hover:border-gray-700 transition-colors",
    elevated: "bg-gray-900 border border-gray-800 shadow-lg",
    glass: "glass",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "relative",
        // Variant and padding
        variants[variant],
        paddings[padding],
        // Ledger easing
        "duration-300",
        className,
      )}
      style={{
        transitionTimingFunction: "cubic-bezier(0.85, 0, 0.15, 1)",
      }}
      {...props}
    >
      {/* L-bracket corners */}
      {withBrackets && <LedgerCorners color={bracketColor} size="sm" />}
      {children}
    </div>
  );
}

type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between pb-4",
        "border-b border-gray-800",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
}

function CardTitle({
  className,
  as: Component = "h3",
  children,
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn(
        "text-heading-md font-semibold text-white tracking-tight",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

type CardDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

function CardDescription({
  className,
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <p className={cn("text-body-sm text-gray-400 mt-1", className)} {...props}>
      {children}
    </p>
  );
}

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn("pt-4", className)} {...props}>
      {children}
    </div>
  );
}

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 pt-4 mt-4",
        "border-t border-gray-800",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Stat Card variant for dashboards
interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  change?: {
    value: string | number;
    trend: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
}

function StatCard({
  label,
  value,
  change,
  icon,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card
      variant="bordered"
      padding="md"
      className={cn("group", className)}
      {...props}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-mono text-gray-500 mb-2">{label}</p>
          <p className="text-display-sm text-white font-bold tracking-tight">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "text-caption mt-2 font-mono",
                change.trend === "up" && "text-lime-400",
                change.trend === "down" && "text-red-500",
                change.trend === "neutral" && "text-gray-500",
              )}
            >
              {change.trend === "up" && "+"}
              {change.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-gray-600 group-hover:text-lime-400 transition-colors">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
};
