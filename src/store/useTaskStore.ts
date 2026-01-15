import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { TaskStore, Column } from "../types";
import { api } from "../services/api";

const INITIAL_COLUMNS: Column[] = [
  { id: "todo", title: "To Do" },
  { id: "doing", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  epics: [],
  savedFilters: [],
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
  
  saveFilter: (name, criteria) => {
    const filter = { id: uuidv4(), name, criteria };
    set((state) => ({ savedFilters: [...state.savedFilters, filter] }));
    api.createFilter(filter).catch(console.error);
  },
  
  deleteSavedFilter: (id) => {
    set((state) => ({ savedFilters: state.savedFilters.filter(f => f.id !== id) }));
    api.deleteFilter(id).catch(console.error);
  },

  // Dashboard
  widgets: [],
  addWidget: (widget) => set((state) => ({
    widgets: [...state.widgets, widget]
  })),
  removeWidget: (id) => set((state) => ({
    widgets: state.widgets.filter(w => w.id !== id)
  })),

  // Tasks
  addTask: (task) => {
    set((state) => ({ tasks: [...state.tasks, task] }));
    api.createTask(task).catch(console.error);
  },
  
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
    api.updateTask(id, updates).catch(console.error);
  },
    
  updateTasks: (ids, updates) => {
    set((state) => ({
        tasks: state.tasks.map((t) =>
            ids.includes(t.id) ? { ...t, ...updates } : t
        ),
        selectedTaskIds: [] 
    }));
    // Batch update via API (looping for now as API handles singular updates)
    ids.forEach(id => api.updateTask(id, updates).catch(console.error));
  },
    
  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTaskIds: state.selectedTaskIds.filter(tid => tid !== id)
    }));
    api.deleteTask(id).catch(console.error);
  },
    
  deleteTasks: (ids) => {
      set((state) => ({
        tasks: state.tasks.filter(t => !ids.includes(t.id)),
        selectedTaskIds: []
      }));
      ids.forEach(id => api.deleteTask(id).catch(console.error));
  },
  
  moveTask: (id, status) => {
    set((state) => {
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        // Find existing to check if we need to update due date
        const task = state.tasks.find(t => t.id === id);
        const updates: any = { status };
        
        if (task && status === 'done' && !task.dueDate) {
            updates.dueDate = todayStr;
        }

        api.updateTask(id, updates).catch(console.error);

        return {
            tasks: state.tasks.map((t) =>
                t.id === id ? { ...t, ...updates } : t
            ),
        };
    });
  },
    
  reorderTasks: (newTasks) => set({ tasks: newTasks }),
  
  importTasks: (newTasks, newEpics = []) => {
    set((state) => ({ 
        tasks: [...state.tasks, ...newTasks],
        epics: [...state.epics, ...newEpics]
    }));
    newEpics.forEach(e => api.createEpic(e).catch(console.error));
    newTasks.forEach(t => api.createTask(t).catch(console.error));
  },

  // Epics
  addEpic: (epic) => {
      set((state) => ({ epics: [...state.epics, epic] }));
      api.createEpic(epic).catch(console.error);
  },
  
  updateEpic: (id, updates) => {
    set((state) => ({
      epics: state.epics.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
    api.updateEpic(id, updates).catch(console.error);
  },
  
  deleteEpic: (id) => {
    set((state) => ({
      epics: state.epics.filter((e) => e.id !== id),
      tasks: state.tasks.map(t => t.epicId === id ? { ...t, epicId: undefined } : t)
    }));
    api.deleteEpic(id).catch(console.error);
    // Note: We might want to remove epicId from tasks in DB too, 
    // but the foreign key (if strict) might handle it, or we need to update tasks.
    // Our schema doesn't force cascade yet, so we should probably update tasks manually or rely on lazy cleanup.
  },

  // Initialization
  fetchData: async () => {
      const [tasks, epics, filters] = await Promise.all([
          api.getTasks(),
          api.getEpics(),
          api.getFilters()
      ]);
      set({ tasks, epics, savedFilters: filters });
  }
}));
