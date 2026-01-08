import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { TaskStore, Column, Task } from "../types";

const INITIAL_COLUMNS: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "doing", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      columns: INITIAL_COLUMNS,
      
      // Selection
      selectedTaskIds: [],
      toggleTaskSelection: (id) => set((state) => ({
        selectedTaskIds: state.selectedTaskIds.includes(id) 
            ? state.selectedTaskIds.filter(tid => tid !== id)
            : [...state.selectedTaskIds, id]
      })),
      clearSelection: () => set({ selectedTaskIds: [] }),
      selectAll: (ids) => set({ selectedTaskIds: ids }),

      // Filtering
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      activeFilter: {},
      setActiveFilter: (filter) => set({ activeFilter: filter }),
      savedFilters: [],
      saveFilter: (name, criteria) => set((state) => ({
        savedFilters: [...state.savedFilters, { id: uuidv4(), name, criteria }]
      })),
      deleteSavedFilter: (id) => set((state) => ({
        savedFilters: state.savedFilters.filter(f => f.id !== id)
      })),

      // Dashboard
      widgets: [],
      addWidget: (widget) => set((state) => ({
        widgets: [...state.widgets, widget]
      })),
      removeWidget: (id) => set((state) => ({
        widgets: state.widgets.filter(w => w.id !== id)
      })),

      // Tasks
      addTask: (task) =>
        set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      updateTasks: (ids: string[], updates: Partial<Task>) =>
        set((state) => ({
            tasks: state.tasks.map((t) =>
                ids.includes(t.id) ? { ...t, ...updates } : t
            ),
            selectedTaskIds: [] // Clear selection after batch update
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
          selectedTaskIds: state.selectedTaskIds.filter(tid => tid !== id)
        })),
      deleteTasks: (ids) => set((state) => ({
        tasks: state.tasks.filter(t => !ids.includes(t.id)),
        selectedTaskIds: []
      })),
      moveTask: (id, status) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, status } : t
          ),
        })),
      reorderTasks: (newTasks) => set({ tasks: newTasks }),
      importTasks: (newTasks) =>
        set((state) => ({ tasks: [...state.tasks, ...newTasks] })),
    }),
    {
      name: "kanban-storage",
    }
  )
);
