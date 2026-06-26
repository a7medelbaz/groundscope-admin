import React from "react";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-control bg-primary-200/12 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary-200" strokeWidth={2} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">{title}</h1>
          {description && (
            <p className="text-text-secondary text-sm mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
