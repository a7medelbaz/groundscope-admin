/* Enums */
export enum UserRole {
  ADMIN = "admin",
  SUPERVISOR = "supervisor",
  UNIT_MANAGER = "unit_manager",
}

export enum UnitStatus {
  AVAILABLE = "available",
  BUSY = "busy",
  OFFLINE = "offline",
}

export enum FlightStatus {
  SCHEDULED = "scheduled",
  ACTIVE = "active",
  ARRIVED = "arrived",
  DEPARTED = "departed",
  CANCELLED = "cancelled",
}

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ReportStatus {
  OPEN = "open",
  ACKNOWLEDGED = "acknowledged",
  RESOLVED = "resolved",
}

export enum ReportSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum NotificationType {
  TASK_ASSIGNED = "task_assigned",
  ALERT = "alert",
  DELAY = "delay",
  REPORT = "report",
  FLIGHT_LANDED = "flight_landed",
}

export enum EventSource {
  CAMERA = "camera",
  MANUAL = "manual",
}

export enum UnitMemberPosition {
  DRIVER = "driver",
  TECHNICIAN = "technician",
  HELPER = "helper",
  SAFETY_OFFICER = "safety_officer",
}

/* Database Tables */
export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  default_duration_minutes: number;
  icon?: string;
  is_active: boolean;
  created_at: string;
}

export interface Unit {
  id: string;
  name: string;
  service_type_id: string;
  status: UnitStatus;
  compatible_aircraft?: string[];
  shift_start_time?: string;
  shift_end_time?: string;
  created_at: string;
}

export interface UnitMember {
  id: string;
  unit_id: string;
  full_name: string;
  phone?: string;
  national_id?: string;
  position: UnitMemberPosition;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Stand {
  id: string;
  code: string;
  terminal: string;
  compatible_aircraft?: string[];
  has_camera: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Camera {
  id: string;
  stand_id: string;
  identifier: string;
  stream_url?: string;
  is_active: boolean;
  last_ping?: string;
  created_at: string;
}

export interface User {
  id: string;
  auth_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  service_type_id?: string;
  unit_id?: string;
  fcm_token?: string;
  is_active: boolean;
  created_at: string;
}

export interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  origin: string;
  destination: string;
  aircraft_type?: string;
  aircraft_registration?: string;
  scheduled_arrival: string;
  estimated_arrival?: string;
  actual_arrival?: string;
  scheduled_departure?: string;
  actual_departure?: string;
  stand_id?: string;
  status: FlightStatus;
  pax_count?: number;
  api_source: string;
  external_id?: string;
  raw_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FlightServiceRequest {
  id: string;
  flight_id: string;
  service_type_id: string;
  requested_by?: string;
  assigned_supervisor_id?: string;
  status: "pending" | "assigned" | "completed";
  notes?: string;
  created_at: string;
}

export interface Task {
  id: string;
  flight_id: string;
  service_type_id: string;
  unit_id?: string;
  assigned_by?: string;
  created_by?: string;
  status: TaskStatus;
  priority: TaskPriority;
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskChecklist {
  id: string;
  task_id: string;
  item: string;
  is_checked: boolean;
  checked_at?: string;
  checked_by?: string;
  order_index: number;
}

export interface TaskPause {
  id: string;
  task_id: string;
  paused_at: string;
  resumed_at?: string;
  reason?: string;
  paused_by?: string;
}

export interface StandEvent {
  id: string;
  stand_id: string;
  flight_id: string;
  camera_id?: string;
  event_type: string;
  unit_id?: string;
  service_type_id?: string;
  task_id?: string;
  event_timestamp: string;
  source: EventSource;
  confidence_score?: number;
  created_at: string;
}

export interface Report {
  id: string;
  task_id: string;
  flight_id: string;
  reported_by: string;
  type: string;
  description: string;
  severity: ReportSeverity;
  status: ReportStatus;
  image_url?: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  reference_id: string;
  reference_type: string;
  is_read: boolean;
  sent_via_fcm: boolean;
  created_at: string;
}

export interface DelayAnalysis {
  id: string;
  flight_id: string;
  task_id: string;
  service_type_id: string;
  unit_id?: string;
  scheduled_start: string;
  actual_start?: string;
  scheduled_end: string;
  actual_end?: string;
  camera_unit_arrival?: string;
  camera_unit_departure?: string;
  start_delay_minutes?: number;
  end_delay_minutes?: number;
  app_vs_camera_discrepancy?: number;
  created_at: string;
}

export interface FlightTurnaroundSummary {
  id: string;
  flight_id: string;
  stand_id?: string;
  flight_arrived_at?: string;
  flight_departed_at?: string;
  total_turnaround_minutes?: number;
  total_tasks: number;
  completed_tasks: number;
  all_tasks_completed: boolean;
  had_delays: boolean;
  had_reports: boolean;
  created_at: string;
  updated_at: string;
}

/* Database Type for Supabase */
export interface Database {
  public: {
    Tables: {
      service_types: { Row: ServiceType; Insert: Omit<ServiceType, "id" | "created_at">; Update: Partial<ServiceType> };
      units: { Row: Unit; Insert: Omit<Unit, "id" | "created_at">; Update: Partial<Unit> };
      unit_members: { Row: UnitMember; Insert: Omit<UnitMember, "id" | "created_at">; Update: Partial<UnitMember> };
      stands: { Row: Stand; Insert: Omit<Stand, "id" | "created_at">; Update: Partial<Stand> };
      cameras: { Row: Camera; Insert: Omit<Camera, "id" | "created_at">; Update: Partial<Camera> };
      users: { Row: User; Insert: Omit<User, "id" | "created_at">; Update: Partial<User> };
      flights: { Row: Flight; Insert: Omit<Flight, "id" | "created_at" | "updated_at">; Update: Partial<Flight> };
      flight_service_requests: { Row: FlightServiceRequest; Insert: Omit<FlightServiceRequest, "id" | "created_at">; Update: Partial<FlightServiceRequest> };
      tasks: { Row: Task; Insert: Omit<Task, "id" | "created_at" | "updated_at">; Update: Partial<Task> };
      task_checklists: { Row: TaskChecklist; Insert: Omit<TaskChecklist, "id">; Update: Partial<TaskChecklist> };
      task_pauses: { Row: TaskPause; Insert: Omit<TaskPause, "id">; Update: Partial<TaskPause> };
      stand_events: { Row: StandEvent; Insert: Omit<StandEvent, "id" | "created_at">; Update: Partial<StandEvent> };
      reports: { Row: Report; Insert: Omit<Report, "id" | "created_at">; Update: Partial<Report> };
      notifications: { Row: Notification; Insert: Omit<Notification, "id" | "created_at">; Update: Partial<Notification> };
      delay_analysis: { Row: DelayAnalysis; Insert: Omit<DelayAnalysis, "id" | "created_at">; Update: Partial<DelayAnalysis> };
      flight_turnaround_summary: { Row: FlightTurnaroundSummary; Insert: Omit<FlightTurnaroundSummary, "id" | "created_at" | "updated_at">; Update: Partial<FlightTurnaroundSummary> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
