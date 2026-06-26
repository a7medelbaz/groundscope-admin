import React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Status / severity chip — mirrors the mobile `ReportCard._Chip` spec:
 * radius rr(8), filled bg color@0.15 (status), outlined + border color@0.30
 * (severity), text 12 SemiBold.
 *
 * Tone classes are passed as complete literal Tailwind strings (e.g. from
 * `lib/utils/status-colors.ts`) so the JIT compiler always sees them — never
 * construct color classes at runtime.
 */
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** Literal tone text class, e.g. "text-success". */
  tone?: string;
  /** Literal tone background class incl. opacity, e.g. "bg-success/15". */
  toneBg?: string;
  /** Literal tone border class incl. opacity, e.g. "border-success/30". */
  toneBorder?: string;
  /** Show a leading status dot in the tone color. */
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, tone = "text-text-primary", toneBg, toneBorder, dot = false, children, ...props },
    ref
  ) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        tone,
        toneBg,
        toneBorder && `border ${toneBorder}`,
        className
      )}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />
      )}
      {children}
    </span>
  )
);

Badge.displayName = "Badge";

export { Badge };
