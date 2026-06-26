import { FlightStatus, ReportSeverity, ReportStatus, TaskPriority, TaskStatus, UnitStatus } from "../types/database";

/**
 * Get background and text color classes for a task status
 */
export function getTaskStatusColor(status: TaskStatus) {
  const colors: Record<TaskStatus, { bg: string; text: string; border: string }> = {
    [TaskStatus.IN_PROGRESS]: {
      bg: "bg-primary-200/15",
      text: "text-primary-200",
      border: "border-primary-200",
    },
    [TaskStatus.COMPLETED]: {
      bg: "bg-success/15",
      text: "text-success",
      border: "border-success",
    },
    [TaskStatus.PENDING]: {
      bg: "bg-warning/15",
      text: "text-warning",
      border: "border-warning",
    },
    [TaskStatus.PAUSED]: {
      bg: "bg-secondary-200/15",
      text: "text-secondary-200",
      border: "border-secondary-200",
    },
    [TaskStatus.CANCELLED]: {
      bg: "bg-text-disabled/15",
      text: "text-text-disabled",
      border: "border-text-disabled",
    },
  };
  return colors[status];
}

/**
 * Get background and text color classes for a task priority
 */
export function getTaskPriorityColor(priority: TaskPriority) {
  const colors: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    [TaskPriority.CRITICAL]: {
      bg: "bg-error/15",
      text: "text-error",
      border: "border-error",
    },
    [TaskPriority.HIGH]: {
      bg: "bg-secondary-200/15",
      text: "text-secondary-200",
      border: "border-secondary-200",
    },
    [TaskPriority.MEDIUM]: {
      bg: "bg-warning/15",
      text: "text-warning",
      border: "border-warning",
    },
    [TaskPriority.LOW]: {
      bg: "bg-success/15",
      text: "text-success",
      border: "border-success",
    },
  };
  return colors[priority];
}

/**
 * Get background and text color classes for a report status
 */
export function getReportStatusColor(status: ReportStatus) {
  const colors: Record<ReportStatus, { bg: string; text: string; border: string }> = {
    [ReportStatus.OPEN]: {
      bg: "bg-warning/15",
      text: "text-warning",
      border: "border-warning",
    },
    [ReportStatus.ACKNOWLEDGED]: {
      bg: "bg-info/15",
      text: "text-info",
      border: "border-info",
    },
    [ReportStatus.RESOLVED]: {
      bg: "bg-success/15",
      text: "text-success",
      border: "border-success",
    },
  };
  return colors[status];
}

/**
 * Get background and text color classes for a report severity
 */
export function getReportSeverityColor(severity: ReportSeverity) {
  const colors: Record<ReportSeverity, { bg: string; text: string; border: string }> = {
    [ReportSeverity.LOW]: {
      bg: "bg-success/15",
      text: "text-success",
      border: "border-success",
    },
    [ReportSeverity.MEDIUM]: {
      bg: "bg-warning/15",
      text: "text-warning",
      border: "border-warning",
    },
    [ReportSeverity.HIGH]: {
      bg: "bg-secondary-200/15",
      text: "text-secondary-200",
      border: "border-secondary-200",
    },
    [ReportSeverity.CRITICAL]: {
      bg: "bg-error/15",
      text: "text-error",
      border: "border-error",
    },
  };
  return colors[severity];
}

/**
 * Get background and text color classes for a unit status
 */
export function getUnitStatusColor(status: UnitStatus) {
  const colors: Record<UnitStatus, { bg: string; text: string; border: string }> = {
    [UnitStatus.AVAILABLE]: {
      bg: "bg-success/15",
      text: "text-success",
      border: "border-success",
    },
    [UnitStatus.BUSY]: {
      bg: "bg-warning/15",
      text: "text-warning",
      border: "border-warning",
    },
    [UnitStatus.OFFLINE]: {
      bg: "bg-text-disabled/15",
      text: "text-text-disabled",
      border: "border-text-disabled",
    },
  };
  return colors[status];
}

/**
 * Get background and text color classes for a flight status
 */
export function getFlightStatusColor(status: FlightStatus) {
  const colors: Record<FlightStatus, { bg: string; text: string; border: string }> = {
    [FlightStatus.SCHEDULED]: {
      bg: "bg-info/15",
      text: "text-info",
      border: "border-info",
    },
    [FlightStatus.ARRIVED]: {
      bg: "bg-primary-200/15",
      text: "text-primary-200",
      border: "border-primary-200",
    },
    [FlightStatus.DEPARTED]: {
      bg: "bg-success/15",
      text: "text-success",
      border: "border-success",
    },
    [FlightStatus.CANCELLED]: {
      bg: "bg-text-disabled/15",
      text: "text-text-disabled",
      border: "border-text-disabled",
    },
  };
  return colors[status];
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
