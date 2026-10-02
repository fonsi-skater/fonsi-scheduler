// ASSUMPTION: The service uses these literal status, priority, and category values.
export type TaskStatus = "upcoming" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskCategory = "work" | "personal" | "health" | "other";

// ASSUMPTION: A task uses an ISO date string and 24-hour local time strings; the API returns these fields.
export interface Task {
  id: string;
  title: string;
  notes: string;
  date: string;
  startTime: string;
  endTime: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  reminderMinutes: number | null;
  createdAt: string;
}

// ASSUMPTION: Create and update requests share the same editable fields; update is a full replacement.
export type TaskInput = Pick<
  Task,
  "title" | "notes" | "date" | "startTime" | "endTime" | "category" | "priority" | "reminderMinutes"
>;

export interface TaskStatusRequest {
  status: TaskStatus;
}

export interface TaskFilters {
  query?: string;
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  category?: TaskCategory | "all";
  from?: string;
  to?: string;
}
