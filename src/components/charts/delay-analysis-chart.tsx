"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardBody } from "@/components/ui/card";
import { DelayAnalysisRow } from "@/lib/queries/analytics";
import { useTheme } from "next-themes";

interface DelayAnalysisChartProps {
  data: DelayAnalysisRow[];
}

export function DelayAnalysisChart({ data }: DelayAnalysisChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartData = useMemo(() => {
    // Group by service type and calculate average delays
    const grouped = new Map<string, { count: number; startDelay: number; endDelay: number }>();

    data.forEach((row) => {
      const serviceName = row.service_types?.name || "Unknown";
      const current = grouped.get(serviceName) || { count: 0, startDelay: 0, endDelay: 0 };

      current.count += 1;
      current.startDelay += row.start_delay_minutes || 0;
      current.endDelay += row.end_delay_minutes || 0;

      grouped.set(serviceName, current);
    });

    // Convert to chart format
    return Array.from(grouped.entries()).map(([name, metrics]) => ({
      name,
      "Avg Start Delay (min)": Math.round(metrics.startDelay / metrics.count),
      "Avg End Delay (min)": Math.round(metrics.endDelay / metrics.count),
    }));
  }, [data]);

  const axisColor = isDark ? "#A4ACB9" : "#36394A";
  const gridColor = isDark ? "#36394A" : "#DFE1E7";

  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="font-semibold text-text-primary">Delay Analysis</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" stroke={axisColor} />
            <YAxis stroke={axisColor} label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
            <Tooltip contentStyle={{ backgroundColor: isDark ? "#262730" : "#FFFFFF" }} />
            <Legend />
            <Bar dataKey="Avg Start Delay (min)" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Avg End Delay (min)" fill="#F59E0B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
