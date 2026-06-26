"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/card";
import { UnitPerformanceRow } from "@/lib/queries/analytics";

interface UnitPerformanceTableProps {
  data: UnitPerformanceRow[];
}

export function UnitPerformanceTable({ data }: UnitPerformanceTableProps) {
  const getCompletionRate = (completed: number, assigned: number): number => {
    if (assigned === 0) return 0;
    return Math.round((completed / assigned) * 100);
  };

  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="font-semibold text-text-primary">Unit Performance</h2>
        <div className="overflow-x-auto border border-border rounded-control">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider">
                <th className="px-4 py-2 text-start font-semibold text-text-secondary">Unit</th>
                <th className="px-4 py-2 text-center font-semibold text-text-secondary">Assigned</th>
                <th className="px-4 py-2 text-center font-semibold text-text-secondary">Completed</th>
                <th className="px-4 py-2 text-center font-semibold text-text-secondary">Cancelled</th>
                <th className="px-4 py-2 text-center font-semibold text-text-secondary">Completion %</th>
                <th className="px-4 py-2 text-center font-semibold text-text-secondary">Avg Delay</th>
                <th className="px-4 py-2 text-center font-semibold text-text-secondary">Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => {
                const completionRate = getCompletionRate(row.tasks_completed, row.tasks_assigned);
                return (
                  <tr key={row.unit_id} className="border-b border-divider hover:bg-surface-variant">
                    <td className="px-4 py-3 font-medium text-text-primary">{row.unit_name}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{row.tasks_assigned}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{row.tasks_completed}</td>
                    <td className="px-4 py-3 text-center text-text-secondary">{row.tasks_cancelled}</td>
                    <td className="px-4 py-3 text-center">
                      <div
                        className={`inline-block px-2 py-1 rounded-chip text-xs font-semibold ${
                          completionRate >= 80
                            ? "bg-success/15 text-success"
                            : completionRate >= 50
                              ? "bg-warning/15 text-warning"
                              : "bg-error/15 text-error"
                        }`}
                      >
                        {completionRate}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary">
                      {row.avg_start_delay_minutes ? `${row.avg_start_delay_minutes}m` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary">
                      {row.avg_duration_minutes ? `${row.avg_duration_minutes}m` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
