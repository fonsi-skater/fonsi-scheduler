import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { taskRepository } from "@/api/taskRepository";
import type { Task, TaskFilters, TaskInput } from "@/api/types";

export const taskKeys = {
  all: ["tasks"] as const,
  list: (filters: TaskFilters = {}) => ["tasks", filters] as const
};

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => taskRepository.list(filters),
    staleTime: 30_000
  });
}

type CacheSnapshot = [readonly unknown[], Task[] | undefined][];

function snapshotTasks(queryClient: ReturnType<typeof useQueryClient>): CacheSnapshot {
  return queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all });
}

function restoreTasks(queryClient: ReturnType<typeof useQueryClient>, snapshot: CacheSnapshot) {
  snapshot.forEach(([key, tasks]) => queryClient.setQueryData(key, tasks));
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TaskInput) => taskRepository.create(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const snapshot = snapshotTasks(queryClient);
      snapshot.forEach(([key, tasks]) => {
        if (tasks) {
          queryClient.setQueryData<Task[]>(key, [
            ...tasks,
            {
              ...input,
              id: `optimistic-${Date.now()}`,
              status: "upcoming",
              createdAt: new Date().toISOString()
            }
          ]);
        }
      });
      return { snapshot };
    },
    onError: (_error, _input, context) => {
      if (context) restoreTasks(queryClient, context.snapshot);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all })
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TaskInput }) => taskRepository.update(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const snapshot = snapshotTasks(queryClient);
      snapshot.forEach(([key, tasks]) => {
        if (tasks)
          queryClient.setQueryData<Task[]>(
            key,
            tasks.map((task) => (task.id === id ? { ...task, ...input } : task))
          );
      });
      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      if (context) restoreTasks(queryClient, context.snapshot);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all })
  });
}

export function useSetTaskCompleted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      taskRepository.setCompleted(id, completed),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const snapshot = snapshotTasks(queryClient);
      snapshot.forEach(([key, tasks]) => {
        if (tasks) {
          queryClient.setQueryData<Task[]>(
            key,
            tasks.map((task) =>
              task.id === id ? { ...task, status: completed ? "completed" : "upcoming" } : task
            )
          );
        }
      });
      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      if (context) restoreTasks(queryClient, context.snapshot);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all })
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskRepository.remove(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const snapshot = snapshotTasks(queryClient);
      snapshot.forEach(([key, tasks]) => {
        if (tasks)
          queryClient.setQueryData<Task[]>(
            key,
            tasks.filter((task) => task.id !== id)
          );
      });
      return { snapshot };
    },
    onError: (_error, _id, context) => {
      if (context) restoreTasks(queryClient, context.snapshot);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.all })
  });
}
