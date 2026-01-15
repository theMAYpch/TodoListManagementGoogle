import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useTaskStore } from './useTaskStore';
import { api } from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  api: {
    getTasks: vi.fn(() => Promise.resolve([])),
    getEpics: vi.fn(() => Promise.resolve([])),
    getFilters: vi.fn(() => Promise.resolve([])),
    createTask: vi.fn(() => Promise.resolve()),
    updateTask: vi.fn(() => Promise.resolve()),
    deleteTask: vi.fn(() => Promise.resolve()),
    createEpic: vi.fn(() => Promise.resolve()),
    updateEpic: vi.fn(() => Promise.resolve()),
    deleteEpic: vi.fn(() => Promise.resolve()),
    createFilter: vi.fn(() => Promise.resolve()),
    deleteFilter: vi.fn(() => Promise.resolve()),
  }
}));

describe('useTaskStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    useTaskStore.setState({
      tasks: [],
      selectedTaskIds: [],
      searchQuery: "",
      activeFilter: {},
      widgets: [],
      savedFilters: [],
      epics: [],
    });
    vi.clearAllMocks();
  });

  it('should have initial columns', () => {
    const { columns } = useTaskStore.getState();
    expect(columns).toHaveLength(4);
    expect(columns[0].title).toBe('To Do');
  });

  it('should add a task and call API', () => {
    const task = { 
      id: '1', 
      title: 'Task 1', 
      status: 'todo',
      category: 'Feature',
      sprint: 'Backlog',
      startDate: '',
      dueDate: '',
      assignees: [],
      subtasks: [],
      createdAt: Date.now(),
    } as any;
    
    useTaskStore.getState().addTask(task);
    const { tasks } = useTaskStore.getState();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Task 1');
    expect(api.createTask).toHaveBeenCalledWith(task);
  });

  it('should update a task and call API', () => {
    const task = { id: '1', title: 'Task 1', status: 'todo' } as any;
    useTaskStore.getState().addTask(task); // Setup
    vi.clearAllMocks(); // Clear creation call
    
    useTaskStore.getState().updateTask('1', { title: 'Updated Task' });
    const { tasks } = useTaskStore.getState();
    expect(tasks[0].title).toBe('Updated Task');
    expect(api.updateTask).toHaveBeenCalledWith('1', { title: 'Updated Task' });
  });

  it('should delete a task and call API', () => {
    const task = { id: '1', title: 'Task 1', status: 'todo' } as any;
    useTaskStore.getState().addTask(task);
    useTaskStore.getState().toggleTaskSelection('1');
    vi.clearAllMocks();
    
    expect(useTaskStore.getState().selectedTaskIds).toContain('1');
    
    useTaskStore.getState().deleteTask('1');
    const { tasks, selectedTaskIds } = useTaskStore.getState();
    expect(tasks).toHaveLength(0);
    expect(selectedTaskIds).not.toContain('1');
    expect(api.deleteTask).toHaveBeenCalledWith('1');
  });

  it('should handle batch selection', () => {
    useTaskStore.getState().selectAll(['1', '2', '3']);
    expect(useTaskStore.getState().selectedTaskIds).toHaveLength(3);
    
    useTaskStore.getState().clearSelection();
    expect(useTaskStore.getState().selectedTaskIds).toHaveLength(0);
  });

  it('should update multiple tasks and clear selection (API called for each)', () => {
    const tasks = [
      { id: '1', title: 'Task 1', status: 'todo' },
      { id: '2', title: 'Task 2', status: 'todo' },
    ] as any[];
    useTaskStore.getState().importTasks(tasks);
    useTaskStore.getState().toggleTaskSelection('1');
    vi.clearAllMocks();
    
    useTaskStore.getState().updateTasks(['1', '2'], { status: 'done' });
    
    const state = useTaskStore.getState();
    expect(state.tasks[0].status).toBe('done');
    expect(state.tasks[1].status).toBe('done');
    expect(state.selectedTaskIds).toHaveLength(0);
    expect(api.updateTask).toHaveBeenCalledTimes(2);
  });

  it('should move a task and call API', () => {
    const task = { id: '1', title: 'Task 1', status: 'todo' } as any;
    useTaskStore.getState().addTask(task);
    vi.clearAllMocks();
    
    useTaskStore.getState().moveTask('1', 'review');
    expect(useTaskStore.getState().tasks[0].status).toBe('review');
    expect(api.updateTask).toHaveBeenCalledWith('1', expect.objectContaining({ status: 'review' }));
  });

  it('should manage epics and call API', () => {
    const epic = { id: 'epic-1', title: 'New Epic', color: '#000000', status: 'active' } as any;
    
    // Add Epic
    useTaskStore.getState().addEpic(epic);
    expect(useTaskStore.getState().epics).toHaveLength(1);
    expect(useTaskStore.getState().epics[0].title).toBe('New Epic');
    expect(api.createEpic).toHaveBeenCalledWith(epic);
    
    vi.clearAllMocks();

    // Update Epic
    useTaskStore.getState().updateEpic('epic-1', { title: 'Updated Epic' });
    expect(useTaskStore.getState().epics[0].title).toBe('Updated Epic');
    expect(api.updateEpic).toHaveBeenCalledWith('epic-1', { title: 'Updated Epic' });
    
    // Delete Epic and verify task unlink
    const task = { id: 't1', title: 'Task', epicId: 'epic-1' } as any;
    useTaskStore.getState().addTask(task);
    expect(useTaskStore.getState().tasks[0].epicId).toBe('epic-1');
    
    vi.clearAllMocks();

    useTaskStore.getState().deleteEpic('epic-1');
    expect(useTaskStore.getState().epics).toHaveLength(0);
    expect(useTaskStore.getState().tasks[0].epicId).toBeUndefined();
    expect(api.deleteEpic).toHaveBeenCalledWith('epic-1');
  });

  it('should fetch data on initialization', async () => {
    const mockTasks = [{ id: '1', title: 'Fetched Task' }] as any;
    const mockEpics = [{ id: 'e1', title: 'Fetched Epic' }] as any;
    const mockFilters = [{ id: 'f1', name: 'Fetched Filter' }] as any;

    vi.mocked(api.getTasks).mockResolvedValue(mockTasks);
    vi.mocked(api.getEpics).mockResolvedValue(mockEpics);
    vi.mocked(api.getFilters).mockResolvedValue(mockFilters);

    await useTaskStore.getState().fetchData();

    const state = useTaskStore.getState();
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].title).toBe('Fetched Task');
    expect(state.epics).toHaveLength(1);
    expect(state.savedFilters).toHaveLength(1);
  });
});
