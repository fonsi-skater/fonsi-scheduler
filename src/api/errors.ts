export type AppErrorKind = "network" | "notFound" | "validation" | "server" | "unknown";

export class AppError extends Error {
  readonly kind: AppErrorKind;

  constructor(kind: AppErrorKind, message: string) {
    super(message);
    this.name = "AppError";
    this.kind = kind;
  }
}

export function friendlyError(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof TypeError) return "We couldn't connect. Check your connection and try again.";
  return "Something went wrong. Please try again.";
}
