import React from "react";
import { cn } from "@/lib/utils/cn";

type CardAccent =
  | "none"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

const accentClasses: Record<Exclude<CardAccent, "none">, string> = {
  primary: "before:bg-primary-200",
  secondary: "before:bg-secondary-200",
  success: "before:bg-success",
  warning: "before:bg-warning",
  error: "before:bg-error",
  info: "before:bg-info",
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Colored inline-start accent bar (mirrors automatically in RTL). */
  accent?: CardAccent;
  /** Lift to a raised shadow on hover. */
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, accent = "none", interactive = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden bg-surface border border-border rounded-card shadow-card transition-all duration-200",
        accent !== "none" &&
          "before:absolute before:inset-y-0 before:start-0 before:w-1 before:content-['']",
        accent !== "none" && accentClasses[accent],
        interactive && "hover:shadow-raised hover:border-primary-200/40",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-6 py-4 border-b border-divider flex items-center justify-between gap-3",
        className
      )}
      {...props}
    />
  )
);

CardHeader.displayName = "CardHeader";

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 py-4", className)} {...props} />
  )
);

CardBody.displayName = "CardBody";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-6 py-4 border-t border-divider flex justify-end gap-2",
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardBody, CardFooter };
