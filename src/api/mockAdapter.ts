import { addDays, format, startOfDay } from "date-fns";

import type { Task, TaskInput } from "./types";

const today = startOfDay(new Date());
const sampleTasks: Task[] = [
  {
    id: "sample-1",
    title: "Morning pages & coffee",
    notes: "A little space before the busy day.",
    date: format(today, "yyyy-MM-dd"),
    startTime: "08:30",
    endTime: "09:00",
    category: "personal",
    priority: "low",
    status: "completed",
    reminderMinutes: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-2",
    title: "Product design sync",
    notes: "Share the latest flow with the team.",
    date: format(today, "yyyy-MM-dd"),
    startTime: "10:00",
    endTime: "10:45",
    category: "work",
    priority: "high",
    status: "upcoming",
    reminderMinutes: 10,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-3",
    title: "Lunch walk",
    notes: "",
    date: format(today, "yyyy-MM-dd"),
    startTime: "12:30",
    endTime: "13:00",
    category: "health",
    priority: "medium",
    status: "upcoming",
    reminderMinutes: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-4",
    title: "Finish project proposal",
    notes: "Polish the final two slides.",
    date: format(today, "yyyy-MM-dd"),
    startTime: "14:00",
    endTime: "15:30",
    category: "work",
    priority: "high",
    status: "upcoming",
    reminderMinutes: 15,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-5",
    title: "Pick up groceries",
    notes: "Oat milk, tomatoes, lemons",
    date: format(addDays(today, 1), "yyyy-MM-dd"),
    startTime: "17:00",
    endTime: "17:30",
    category: "personal",
    priority: "low",
    status: "upcoming",
    reminderMinutes: null,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-6",
    title: "Pilates class",
    notes: "",
    date: format(addDays(today, 2), "yyyy-MM-dd"),
    startTime: "18:00",
    endTime: "19:00",
    category: "health",
    priority: "medium",
    status: "upcoming",
    reminderMinutes: 30,
    createdAt: new Date().toISOString()
  }
];

let tasks = [...sampleTasks];
let nextId = 1;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 240));
}

export const mockTaskApi = {
  async list(): Promise<Task[]> {
    await delay();
    return [...tasks].sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
  },
  async create(input: TaskInput): Promise<Task> {
    await delay();
    const task: Task = {
      ...input,
      id: `task-${Date.now()}-${nextId++}`,
      status: "upcoming",
      createdAt: new Date().toISOString()
    };
    tasks = [...tasks, task];
    return task;
  },
  async update(id: string, input: TaskInput): Promise<Task> {
    await delay();
    const existing = tasks.find((task) => task.id === id);
    if (!existing) throw new Error("Task not found");
    const updated = { ...existing, ...input };
    tasks = tasks.map((task) => (task.id === id ? updated : task));
    return updated;
  },
  async setCompleted(id: string, completed: boolean): Promise<Task> {
    await delay();
    const existing = tasks.find((task) => task.id === id);
    if (!existing) throw new Error("Task not found");
    const updated: Task = { ...existing, status: completed ? "completed" : "upcoming" };
    tasks = tasks.map((task) => (task.id === id ? updated : task));
    return updated;
  },
  async remove(id: string): Promise<void> {
    await delay();
    tasks = tasks.filter((task) => task.id !== id);
  }
};
