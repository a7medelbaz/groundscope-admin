"use client";

import React from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlightTurnaroundRow } from "@/lib/queries/analytics";
import { format } from "date-fns";

interface TurnaroundSummaryTableProps {
  data: FlightTurnaroundRow[];
}

export function TurnaroundSummaryTable({ data }: TurnaroundSummaryTableProps) {
  const getTurnaroundColor = (minutes?: number): string => {
    if (!minutes) return "bg-surface-variant";
    if (minutes < 60) return "bg-success/15 border-success/30";
    if (minutes < 120) return "bg-warning/15 border-warning/30";
    return "bg-error/15 border-error/30";
  };

  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="font-semibold text-text-primary">Flight Turnaround Summary</h2>
        <div className="overflow-x-auto border border-border rounded-control">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider">
                <th className="px-4 py-2 text-start font-semibold text-text-secondary">Flight</th>
                <th className="px-4 py-2 text-start font-semibold text-text-secondary">Arrival</th>
                <th className="px-4 py-2 text-start font-semibold text-text-secondary">Departure</th>
                <th className="px-4 py-2 text-start font-semibold text-text-secondary">Turnaround</th>
                <th className="px-4 py-2 text-center font-semibold text-text-secondary">Tasks</th>
                <th className="px-4 py-2 text-center font-semibold text-text-secondary">Issues</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 20).map((row) => (
                <tr key={row.id} className="border-b border-divider hover:bg-surface-variant">
                  <td className="px-4 py-3 font-medium text-text-primary">{row.flight_number}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {row.actual_arrival
                      ? format(new Date(row.actual_arrival), "HH:mm")
                      : format(new Date(row.scheduled_arrival || ""), "HH:mm")}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {row.actual_departure
                      ? format(new Date(row.actual_departure), "HH:mm")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className={`px-2 py-1 rounded-chip border text-xs font-semibold inline-block ${getTurnaroundColor(
                        row.turnaround_minutes
                      )}`}
                    >
                      {row.turnaround_minutes ? `${row.turnaround_minutes}m` : "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-text-secondary">
                    {row.completed_tasks}/{row.total_tasks}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.had_delays || row.had_reports ? (
                      <div className="flex gap-1 justify-center">
                        {row.had_delays && (
                          <Badge tone="text-warning" toneBg="bg-warning/15">
                            Delay
                          </Badge>
                        )}
                        {row.had_reports && (
                          <Badge tone="text-error" toneBg="bg-error/15">
                            Report
                          </Badge>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
