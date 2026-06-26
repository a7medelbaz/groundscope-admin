import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", ...props }, ref) => (
    <label
      ref={ref}
      className={`text-sm font-semibold text-text-primary cursor-pointer ${className}`}
      {...props}
    />
  )
);

Label.displayName = "Label";

export { Label };
