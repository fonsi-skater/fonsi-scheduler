import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const taskSchema = z
  .object({
    title: z.string().trim().min(1, "Give your task a name.").max(80, "Keep the title under 80 characters."),
    notes: z.string().max(500, "Notes must be 500 characters or fewer."),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD for the date."),
    startTime: z.string().regex(timePattern, "Use 24-hour time, like 09:30."),
    endTime: z.string().regex(timePattern, "Use 24-hour time, like 10:30."),
    category: z.enum(["work", "personal", "health", "other"]),
    priority: z.enum(["low", "medium", "high"]),
    reminderMinutes: z.number().int().nonnegative().nullable()
  })
  .refine((task) => task.endTime > task.startTime, {
    path: ["endTime"],
    message: "End time must be after start time."
  })
  .refine(
    (task) => {
      const [year, month, day] = task.date.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    },
    { path: ["date"], message: "Enter a real calendar date." }
  );

export type TaskFormValues = z.infer<typeof taskSchema>;
