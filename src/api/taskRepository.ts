import { httpTaskApi } from "./client";
import { mockTaskApi } from "./mockAdapter";
import type { Task, TaskInput, TaskFilters } from "./types";

const useMock = process.env.EXPO_PUBLIC_USE_MOCK === "true";

export const taskRepository = {
  async list(filters: TaskFilters = {}): Promise<Task[]> {
    const tasks = await (useMock ? mockTaskApi.list() : httpTaskApi.list());
    const query = filters.query?.trim().toLocaleLowerCase();
    return tasks.filter((task) => {
      const matchesQuery =
        !query ||
        task.title.toLocaleLowerCase().includes(query) ||
        task.notes.toLocaleLowerCase().includes(query);
      const matchesStatus = !filters.status || filters.status === "all" || task.status === filters.status;
      const matchesPriority =
        !filters.priority || filters.priority === "all" || task.priority === filters.priority;
      const matchesCategory =
        !filters.category || filters.category === "all" || task.category === filters.category;
      const matchesDate =
        (!filters.from || task.date >= filters.from) && (!filters.to || task.date <= filters.to);
      return matchesQuery && matchesStatus && matchesPriority && matchesCategory && matchesDate;
    });
  },
  create(input: TaskInput): Promise<Task> {
    return useMock ? mockTaskApi.create(input) : httpTaskApi.create(input);
  },
  update(id: string, input: TaskInput): Promise<Task> {
    return useMock ? mockTaskApi.update(id, input) : httpTaskApi.update(id, input);
  },
  async setCompleted(id: string, completed: boolean): Promise<Task> {
    if (useMock) return mockTaskApi.setCompleted(id, completed);
    return httpTaskApi.setStatus(id, { status: completed ? "completed" : "upcoming" });
  },
  remove(id: string): Promise<void> {
    return useMock ? mockTaskApi.remove(id) : httpTaskApi.remove(id);
  }
};
