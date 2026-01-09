import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCard } from './TaskCard';
import { Task } from '../types';

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
}));

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task Card',
  description: 'Description',
  status: 'todo',
  category: 'Feature',
  sprint: 'Sprint 1',
  startDate: '2026-01-01',
  dueDate: '2026-01-05',
  assignees: ['Alice'],
  subtasks: [
    { id: 's1', title: 'Subtask 1', completed: true },
    { id: 's2', title: 'Subtask 2', completed: false }
  ],
  createdAt: Date.now(),
};

describe('TaskCard', () => {
  it('should render task details correctly', () => {
    render(
      <TaskCard 
        task={mockTask} 
        onClick={() => {}} 
        selected={false} 
        onSelect={() => {}} 
        selectionMode={false} 
      />
    );

    expect(screen.getByText('Test Task Card')).toBeInTheDocument();
    expect(screen.getByText('Feature')).toBeInTheDocument();
    expect(screen.getByText('Sprint 1')).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument(); // Subtasks progress
    expect(screen.getByText('50%')).toBeInTheDocument(); // Percentage
    expect(screen.getByTitle('Alice')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <TaskCard 
        task={mockTask} 
        onClick={handleClick} 
        selected={false} 
        onSelect={() => {}} 
        selectionMode={false} 
      />
    );

    fireEvent.click(screen.getByText('Test Task Card'));
    expect(handleClick).toHaveBeenCalledWith(mockTask);
  });

  it('should call onSelect when selection button is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <TaskCard 
        task={mockTask} 
        onClick={() => {}} 
        selected={false} 
        onSelect={handleSelect} 
        selectionMode={false} 
      />
    );

    // The selection checkbox is a role="button"
    const selectionButton = screen.getByRole('button');
    fireEvent.click(selectionButton);
    expect(handleSelect).toHaveBeenCalledWith(mockTask.id);
  });

  it('should show selection border when selected', () => {
    const { container } = render(
      <TaskCard 
        task={mockTask} 
        onClick={() => {}} 
        selected={true} 
        onSelect={() => {}} 
        selectionMode={false} 
      />
    );

    // The root div should have border-primary class
    expect(container.firstChild).toHaveClass('border-primary');
  });
});
