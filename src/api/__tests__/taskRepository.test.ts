import { taskRepository } from "../taskRepository";
import type { TaskInput } from "../types";

const sample: TaskInput = {
  title: "Repository test task",
  notes: "Created in memory",
  date: "2026-10-02",
  startTime: "11:00",
  endTime: "11:30",
  category: "work",
  priority: "medium",
  reminderMinutes: 10
};

describe("taskRepository mock adapter", () => {
  it("creates, filters and removes tasks without a server", async () => {
    const created = await taskRepository.create(sample);
    expect(created.title).toBe(sample.title);
    expect(created.status).toBe("upcoming");

    const matching = await taskRepository.list({ query: "repository test task" });
    expect(matching.some((task) => task.id === created.id)).toBe(true);

    await taskRepository.remove(created.id);
    const afterDelete = await taskRepository.list({ query: "repository test task" });
    expect(afterDelete.some((task) => task.id === created.id)).toBe(false);
  });

  it("updates completion and applies status filters", async () => {
    const created = await taskRepository.create(sample);
    await taskRepository.setCompleted(created.id, true);

    const completed = await taskRepository.list({ status: "completed", query: "repository test task" });
    expect(completed.some((task) => task.id === created.id)).toBe(true);

    await taskRepository.remove(created.id);
  });
});
