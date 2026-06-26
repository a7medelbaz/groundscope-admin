import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`bg-surface border border-border rounded-lg shadow-sm ${className}`}
      {...props}
    />
  )
);

Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 border-b border-divider ${className}`}
      {...props}
    />
  )
);

CardHeader.displayName = "CardHeader";

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 ${className}`}
      {...props}
    />
  )
);

CardBody.displayName = "CardBody";

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`px-6 py-4 border-t border-divider flex justify-end gap-2 ${className}`}
      {...props}
    />
  )
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardBody, CardFooter };
