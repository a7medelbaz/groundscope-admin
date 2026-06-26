import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error" | "info";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variantClasses = {
      default: "bg-grey-100 text-text-primary",
      primary: "bg-primary-200/15 text-primary-200",
      success: "bg-success/15 text-success",
      warning: "bg-warning/15 text-warning",
      error: "bg-error/15 text-error",
      info: "bg-info/15 text-info",
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
