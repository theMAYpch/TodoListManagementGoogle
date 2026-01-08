export type TaskStatus = "todo" | "doing" | "done" | "review";

export type TaskCategory = "Feature" | "Bug" | "Doc" | "Meeting" | "Other";

export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: TaskCategory;
  sprint: string;
  dueDate: string; // ISO date string
  startDate?: string; // ISO date string for timeline/gantt
  assignees: string[];
  url?: string;
  color?: string; // hex or tailwind class
  subtasks: SubTask[];
  createdAt: number;
};

export type Column = {
  id: TaskStatus;
  title: string;
};

export type FilterCriteria = {
  search?: string;
  categories?: TaskCategory[];
  statuses?: TaskStatus[];
  sprints?: string[];
  assignees?: string[];
};

export type SavedFilter = {
  id: string;
  name: string;
  criteria: FilterCriteria;
};

export type WidgetType = "bar" | "pie" | "line" | "stats";

export type DashboardWidget = {
  id: string;
  type: WidgetType;
  title: string;
  filterId: string; // References a SavedFilter
};

export type TaskStore = {
  tasks: Task[];
  columns: Column[];
  
  // Selection
  selectedTaskIds: string[];
  toggleTaskSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;

  // Filtering
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: FilterCriteria;
  setActiveFilter: (filter: FilterCriteria) => void;
  savedFilters: SavedFilter[];
  saveFilter: (name: string, criteria: FilterCriteria) => void;
  deleteSavedFilter: (id: string) => void;

  // Dashboard
  widgets: DashboardWidget[];
  addWidget: (widget: DashboardWidget) => void;
  removeWidget: (id: string) => void;

  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTasks: (ids: string[], updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  deleteTasks: (ids: string[]) => void; // Batch delete
  moveTask: (id: string, status: TaskStatus) => void;
  reorderTasks: (tasks: Task[]) => void;
  importTasks: (tasks: Task[]) => void;
};
