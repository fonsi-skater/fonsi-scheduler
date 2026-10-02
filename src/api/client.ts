import { AppError } from "./errors";
import type { Task, TaskInput, TaskStatusRequest } from "./types";

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!apiUrl) throw new AppError("network", "Add EXPO_PUBLIC_API_URL to connect to your service.");

  let response: Response;
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers }
    });
  } catch {
    throw new AppError("network", "We couldn't connect. Check your connection and try again.");
  }

  if (!response.ok) {
    if (response.status === 404) throw new AppError("notFound", "That task could not be found.");
    if (response.status === 400 || response.status === 422) {
      throw new AppError("validation", "Please check your task details and try again.");
    }
    throw new AppError("server", "The service is unavailable right now. Please try again.");
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const httpTaskApi = {
  // ASSUMPTION: The real service exposes REST task endpoints at /api/v1/tasks.
  list: () => request<Task[]>("/api/v1/tasks"),
  create: (input: TaskInput) =>
    request<Task>("/api/v1/tasks", { method: "POST", body: JSON.stringify(input) }),
  update: (id: string, input: TaskInput) =>
    request<Task>(`/api/v1/tasks/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(input)
    }),
  // ASSUMPTION: Completion is changed through a status-specific PATCH endpoint.
  setStatus: (id: string, input: TaskStatusRequest) =>
    request<Task>(`/api/v1/tasks/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify(input)
    }),
  remove: (id: string) => request<void>(`/api/v1/tasks/${encodeURIComponent(id)}`, { method: "DELETE" })
};
