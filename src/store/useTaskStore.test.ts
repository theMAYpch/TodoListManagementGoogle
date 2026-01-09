import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from './useTaskStore';

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
    });
  });

  it('should have initial columns', () => {
    const { columns } = useTaskStore.getState();
    expect(columns).toHaveLength(4);
    expect(columns[0].title).toBe('To Do');
  });

  it('should add a task', () => {
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
  });

  it('should update a task', () => {
    const task = { id: '1', title: 'Task 1', status: 'todo' } as any;
    useTaskStore.getState().addTask(task);
    
    useTaskStore.getState().updateTask('1', { title: 'Updated Task' });
    const { tasks } = useTaskStore.getState();
    expect(tasks[0].title).toBe('Updated Task');
  });

  it('should delete a task and update selection', () => {
    const task = { id: '1', title: 'Task 1', status: 'todo' } as any;
    useTaskStore.getState().addTask(task);
    useTaskStore.getState().toggleTaskSelection('1');
    
    expect(useTaskStore.getState().selectedTaskIds).toContain('1');
    
    useTaskStore.getState().deleteTask('1');
    const { tasks, selectedTaskIds } = useTaskStore.getState();
    expect(tasks).toHaveLength(0);
    expect(selectedTaskIds).not.toContain('1');
  });

  it('should handle batch selection', () => {
    useTaskStore.getState().selectAll(['1', '2', '3']);
    expect(useTaskStore.getState().selectedTaskIds).toHaveLength(3);
    
    useTaskStore.getState().clearSelection();
    expect(useTaskStore.getState().selectedTaskIds).toHaveLength(0);
  });

  it('should update multiple tasks and clear selection', () => {
    const tasks = [
      { id: '1', title: 'Task 1', status: 'todo' },
      { id: '2', title: 'Task 2', status: 'todo' },
    ] as any[];
    useTaskStore.getState().importTasks(tasks);
    useTaskStore.getState().toggleTaskSelection('1');
    
    useTaskStore.getState().updateTasks(['1', '2'], { status: 'done' });
    
    const state = useTaskStore.getState();
    expect(state.tasks[0].status).toBe('done');
    expect(state.tasks[1].status).toBe('done');
    expect(state.selectedTaskIds).toHaveLength(0);
  });

  it('should move a task', () => {
    const task = { id: '1', title: 'Task 1', status: 'todo' } as any;
    useTaskStore.getState().addTask(task);
    
    useTaskStore.getState().moveTask('1', 'review');
    expect(useTaskStore.getState().tasks[0].status).toBe('review');
  });
});
