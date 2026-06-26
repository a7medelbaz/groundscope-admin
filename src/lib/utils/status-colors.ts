import { FlightStatus, ReportSeverity, ReportStatus, TaskPriority, TaskStatus, UnitStatus } from "../types/database";

/**
 * Get background and text color classes for a task status
 */
export function getTaskStatusColor(status: TaskStatus) {
  const colors: Record<TaskStatus, { bg: string; text: string; border: string }> = {
    [TaskStatus.IN_PROGRESS]: {
      bg: "bg-primary-200/15",
      text: "text-primary-200",
      border: "border-primary-200/30",
    },
    [TaskStatus.COMPLETED]: {
      bg: "bg-success/15",
      text: "text-success",
      border: "border-success/30",
    },
    [TaskStatus.PENDING]: {
      bg: "bg-warning/15",
      text: "text-warning",
      border: "border-warning/30",
    },
    [TaskStatus.PAUSED]: {
      bg: "bg-secondary-200/15",
      text: "text-secondary-200",
      border: "border-secondary-200/30",
    },
    [TaskStatus.CANCELLED]: {
      bg: "bg-text-disabled/15",
      text: "text-text-disabled",
      border: "border-text-disabled/30",
    },
  };
  return colors[status] ?? fallbackColor;
}

/**
 * Get background and text color classes for a task priority
 */
export function getTaskPriorityColor(priority: TaskPriority) {
  const colors: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    [TaskPriority.CRITICAL]: {
      bg: "bg-error/15",
      text: "text-error",
      border: "border-error/30",
    },
    [TaskPriority.HIGH]: {
      bg: "bg-secondary-200/15",
      text: "text-secondary-200",
      border: "border-secondary-200/30",
    },
    [TaskPriority.MEDIUM]: {
      bg: "bg-warning/15",
      text: "text-warning",
      border: "border-warning/30",
    },
    [TaskPriority.LOW]: {
      bg: "bg-success/15",
      text: "text-success",
      border: "border-success/30",
    },
  };
  return colors[priority] ?? fallbackColor;
}

/**
 * Get background and text color classes for a report status
 */
export function getReportStatusColor(status: ReportStatus) {
  const colors: Record<ReportStatus, { bg: string; text: string; border: string }> = {
    [ReportStatus.OPEN]: {
      bg: "bg-warning/15",
      text: "text-warning",
      border: "border-warning/30",
    },
    [ReportStatus.ACKNOWLEDGED]: {
      bg: "bg-info/15",
      text: "text-info",
      border: "border-info/30",
    },
    [ReportStatus.RESOLVED]: {
      bg: "bg-success/15",
      text: "text-success",
      border: "border-success/30",
    },
  };
  return colors[status] ?? fallbackColor;
}

/**
 * Get background and text color classes for a report severity
 */
export function getReportSeverityColor(severity: ReportSeverity) {
  const colors: Record<ReportSeverity, { bg: string; text: string; border: string }> = {
    [ReportSeverity.LOW]: {
      bg: "bg-success/15",
      text: "text-success",
      border: "border-success/30",
    },
    [ReportSeverity.MEDIUM]: {
      bg: "bg-warning/15",
      text: "text-warning",
      border: "border-warning/30",
    },
    [ReportSeverity.HIGH]: {
      bg: "bg-secondary-200/15",
      text: "text-secondary-200",
      border: "border-secondary-200/30",
    },
    [ReportSeverity.CRITICAL]: {
      bg: "bg-error/15",
      text: "text-error",
      border: "border-error/30",
    },
  };
  return colors[severity] ?? fallbackColor;
}

/**
 * Get background and text color classes for a unit status
 */
export function getUnitStatusColor(status: UnitStatus) {
  const colors: Record<UnitStatus, { bg: string; text: string; border: string }> = {
    [UnitStatus.AVAILABLE]: {
      bg: "bg-success/15",
      text: "text-success",
      border: "border-success/30",
    },
    [UnitStatus.BUSY]: {
      bg: "bg-warning/15",
      text: "text-warning",
      border: "border-warning/30",
    },
    [UnitStatus.OFFLINE]: {
      bg: "bg-text-disabled/15",
      text: "text-text-disabled",
      border: "border-text-disabled/30",
    },
  };
  return colors[status] ?? fallbackColor;
}

/**
 * Get background and text color classes for a flight status
 */
const fallbackColor = { bg: "bg-text-disabled/15", text: "text-text-disabled", border: "border-text-disabled/30" };

export function getFlightStatusColor(status: FlightStatus) {
  const colors: Record<FlightStatus, { bg: string; text: string; border: string }> = {
    [FlightStatus.SCHEDULED]: {
      bg: "bg-info/15",
      text: "text-info",
      border: "border-info/30",
    },
    [FlightStatus.ACTIVE]: {
      bg: "bg-primary-200/15",
      text: "text-primary-200",
      border: "border-primary-200/30",
    },
    [FlightStatus.ARRIVED]: {
      bg: "bg-success/15",
      text: "text-success",
      border: "border-success/30",
    },
    [FlightStatus.DEPARTED]: {
      bg: "bg-text-disabled/15",
      text: "text-text-disabled",
      border: "border-text-disabled/30",
    },
    [FlightStatus.CANCELLED]: {
      bg: "bg-error/15",
      text: "text-error",
      border: "border-error/30",
    },
  };
  return colors[status] ?? fallbackColor;
}

/**
 * Get label for task status (localized in components)
 */
export function getTaskStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    [TaskStatus.IN_PROGRESS]: "task.status.inProgress",
    [TaskStatus.COMPLETED]: "task.status.completed",
    [TaskStatus.PENDING]: "task.status.pending",
    [TaskStatus.PAUSED]: "task.status.paused",
    [TaskStatus.CANCELLED]: "task.status.cancelled",
  };
  return labels[status];
}

/**
 * Get label for task priority (localized in components)
 */
export function getTaskPriorityLabel(priority: TaskPriority): string {
  const labels: Record<TaskPriority, string> = {
    [TaskPriority.CRITICAL]: "task.priority.critical",
    [TaskPriority.HIGH]: "task.priority.high",
    [TaskPriority.MEDIUM]: "task.priority.medium",
    [TaskPriority.LOW]: "task.priority.low",
  };
  return labels[priority];
}
