import { describe, it, expect, vi } from 'vitest';
import { parseImportText } from './parser';

// Mock uuid to have consistent IDs in tests
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));

describe('parseImportText', () => {
  it('should parse a simple task list with headers', () => {
    const text = `Sprint 66
09/01/2026
- Implement login feature
- Fix background bug`;
    
    const tasks = parseImportText(text);
    
    expect(tasks).toHaveLength(2);
    
    expect(tasks[0]).toMatchObject({
      title: 'Implement login feature',
      category: 'Feature',
      sprint: 'Sprint 66',
      startDate: '2026-01-09',
      dueDate: '2026-01-09',
      status: 'todo'
    });
    
    expect(tasks[1]).toMatchObject({
      title: 'Fix background bug',
      category: 'Bug',
      sprint: 'Sprint 66',
      startDate: '2026-01-09',
      dueDate: '2026-01-09',
      status: 'todo'
    });
  });

  it('should handle subtasks with indentation', () => {
    const text = `- Main task
  - Subtask 1
  - Subtask 2`;
    
    const tasks = parseImportText(text);
    
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe('Main task');
    expect(tasks[0].subtasks).toHaveLength(2);
    expect(tasks[0].subtasks[0].title).toBe('Subtask 1');
    expect(tasks[0].subtasks[1].title).toBe('Subtask 2');
  });

  it('should handle checkboxes', () => {
    const text = `- [ ] Uncompleted task
- [x] Completed task
  - [x] Completed subtask`;
    
    const tasks = parseImportText(text);
    
    expect(tasks[0].status).toBe('todo');
    expect(tasks[1].status).toBe('done');
    expect(tasks[1].subtasks[0].completed).toBe(true);
  });

  it('should handle different categories based on keywords', () => {
    const text = `- Update documentation
- Weekly sync meeting`;
    
    const tasks = parseImportText(text);
    
    expect(tasks[0].category).toBe('Doc');
    expect(tasks[1].category).toBe('Meeting');
  });

  it('should use default values for missing headers', () => {
    const text = `- Just a task`;
    const tasks = parseImportText(text);
    
    expect(tasks[0].sprint).toBe('Backlog');
    expect(tasks[0].startDate).toBe('');
  });

  it('should normalize sprint names correctly', () => {
    const text = `sprint: 42
- Task in sprint 42`;
    const tasks = parseImportText(text);
    expect(tasks[0].sprint).toBe('sprint 42');
  });

  it('should update dates as it parses through lines', () => {
    const text = `10/01/2026
- Task 1
11/01/2026
- Task 2`;
    const tasks = parseImportText(text);
    expect(tasks[0].startDate).toBe('2026-01-10');
    expect(tasks[1].startDate).toBe('2026-01-11');
  });
});
