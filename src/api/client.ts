import { AppError } from "./errors";
import type { Task, TaskInput, TaskStatusRequest } from "./types";
import { clearAuthSession, getAuthSession, setAuthSession } from "@/store/authSession";
import type { AuthSession } from "@/store/authSession";
import { z } from "zod";

const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
const tokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1)
});
let refreshPromise: Promise<AuthSession> | null = null;

async function sendRequest(path: string, init?: RequestInit, accessToken?: string): Promise<Response> {
  if (!apiUrl) throw new AppError("network", "Add EXPO_PUBLIC_API_URL to connect to your service.");
  try {
    return await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init?.headers
      }
    });
  } catch {
    throw new AppError("network", "We couldn't connect. Check your connection and try again.");
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const session = await getAuthSession();
  let response = await sendRequest(path, init, session?.accessToken);
  if (response.status === 401 && session && !path.includes("/auth/")) {
    let refreshed: AuthSession;
    try {
      const latestSession = await getAuthSession();
      refreshed =
        latestSession && latestSession.refreshToken !== session.refreshToken
          ? latestSession
          : await refreshSessionOnce(session);
    } catch (error) {
      if (error instanceof AppError && error.kind !== "unauthorized") throw error;
      await clearAuthSession();
      throw new AppError("unauthorized", "Your session expired. Please sign in again.");
    }
    response = await sendRequest(path, init, refreshed.accessToken);
  }

  if (!response.ok) {
    if (response.status === 404) throw new AppError("notFound", "That task could not be found.");
    if (response.status === 400 || response.status === 422) {
      throw new AppError("validation", "Please check your task details and try again.");
    }
    throw new AppError("server", "The service is unavailable right now. Please try again.");
  }

  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json();
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function refreshSessionOnce(session: AuthSession): Promise<AuthSession> {
  if (!refreshPromise) {
    refreshPromise = refreshAuthSession(session.refreshToken, session.email).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function refreshAuthSession(refreshToken: string, email: string) {
  const response = await sendRequest("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken })
  });
  if (response.status === 401 || response.status === 403) {
    throw new AppError("unauthorized", "Your session expired.");
  }
  if (!response.ok) throw new AppError("server", "The service could not refresh your session.");
  const payload: unknown = await response.json();
  const result = tokenResponseSchema.safeParse(
    typeof payload === "object" && payload !== null && "data" in payload
      ? (payload as { data: unknown }).data
      : payload
  );
  if (!result.success) throw new AppError("server", "The service returned an invalid session.");
  const nextSession = { ...result.data, email };
  await setAuthSession(nextSession);
  return nextSession;
}

async function authenticate(
  path: "/api/v1/auth/login" | "/api/v1/auth/register",
  email: string,
  password: string
) {
  const response = await sendRequest(path, {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const errorMessage =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "object" &&
      payload.error !== null &&
      "message" in payload.error &&
      typeof payload.error.message === "string"
        ? payload.error.message
        : "We couldn't sign you in. Check your details and try again.";
    throw new AppError(
      response.status === 422 || response.status === 400 ? "validation" : "server",
      errorMessage
    );
  }
  const tokens = tokenResponseSchema.safeParse(
    typeof payload === "object" && payload !== null && "data" in payload
      ? (payload as { data: unknown }).data
      : payload
  );
  if (!tokens.success) throw new AppError("server", "The service returned an invalid sign-in response.");
  await setAuthSession({ ...tokens.data, email });
}

export const authApi = {
  login: (email: string, password: string) => authenticate("/api/v1/auth/login", email, password),
  register: (email: string, password: string) => authenticate("/api/v1/auth/register", email, password),
  async logout() {
    const session = await getAuthSession();
    if (session) {
      let response: Response;
      try {
        response = await sendRequest(
          "/api/v1/auth/logout",
          { method: "POST", body: JSON.stringify({ refreshToken: session.refreshToken }) },
          session.accessToken
        );
      } catch (error) {
        await clearAuthSession();
        throw error;
      }
      await clearAuthSession();
      if (!response.ok) {
        throw new AppError("server", "You signed out here, but the service could not revoke the session.");
      }
    }
  }
};

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
