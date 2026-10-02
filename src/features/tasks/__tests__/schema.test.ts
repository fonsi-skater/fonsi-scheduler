import { taskSchema } from "../schema";

const validTask = {
  title: "Read a chapter",
  notes: "",
  date: "2026-10-02",
  startTime: "09:00",
  endTime: "09:45",
  category: "personal",
  priority: "low",
  reminderMinutes: null
};

describe("taskSchema", () => {
  it("accepts complete task details", () => {
    expect(taskSchema.safeParse(validTask).success).toBe(true);
  });

  it("requires a title and an end time after the start", () => {
    const result = taskSchema.safeParse({ ...validTask, title: " ", endTime: "08:45" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path[0])).toEqual(["title", "endTime"]);
    }
  });

  it("rejects impossible calendar dates", () => {
    const result = taskSchema.safeParse({ ...validTask, date: "2026-02-30" });
    expect(result.success).toBe(false);
  });
});
