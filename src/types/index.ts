export type TaskStatus = "todo" | "doing" | "done" | "review";

export type TaskCategory = "Feature" | "Bug" | "Doc" | "Meeting" | "Other";

export type SubTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type Epic = {
  id: string;
  title: string;
  color: string;
  startDate?: string;
  dueDate?: string;
  status: 'active' | 'completed' | 'on-hold';
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
  epicId?: string; // Link to Epic
  createdAt: number;
};

export type Column = {
  id: TaskStatus;
  title: string;
  description?: string;
};

export type FilterCriteria = {
  search?: string;
  categories?: TaskCategory[];
  statuses?: TaskStatus[];
  sprints?: string[];
  assignees?: string[];
  epics?: string[]; // Filter by Epic
};

export type SavedFilter = {
  id: string;
  name: string;
  criteria: FilterCriteria;
};

export type WidgetType = "stats" | "line" | "gauge" | "overdue";

export type DashboardWidget = {
  id: string;
  type: WidgetType;
  title: string;
  filterId?: string; // References a SavedFilter
  epicId?: string;   // References an Epic
};

export type TaskStore = {
  tasks: Task[];
  epics: Epic[];
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

  // Actions
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTasks: (ids: string[], updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  deleteTasks: (ids: string[]) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  reorderTasks: (tasks: Task[]) => void;
  importTasks: (tasks: Task[], newEpics?: Epic[]) => void;
  
  // Epic Actions
  addEpic: (epic: Epic) => void;
  updateEpic: (id: string, updates: Partial<Epic>) => void;
  deleteEpic: (id: string) => void;
  
  // Initialization
  fetchData: () => Promise<void>;
};
