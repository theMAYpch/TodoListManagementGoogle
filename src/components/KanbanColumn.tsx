import { useMemo } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import type { Column, Task } from "../types";
import { TaskCard } from "./TaskCard";
import { cn } from "../utils/cn";

type KanbanColumnProps = {
  column: Column;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAdd: (status: string) => void;
  selectedTaskIds: string[];
  onSelectTask: (id: string) => void;
  hasSelection: boolean;
};

export const KanbanColumn = ({ 
    column, 
    tasks, 
    onTaskClick, 
    onAdd,
    selectedTaskIds,
    onSelectTask,
    hasSelection
}: KanbanColumnProps) => {
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const { isOver, setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-4 w-[350px] min-w-[350px] bg-secondary/30 p-4 rounded-xl h-full max-h-full",
        isOver && "ring-2 ring-primary/20 bg-secondary/50"
      )}
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="font-semibold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
            {column.title}
             <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground">
                {tasks.length}
             </span>
        </h2>
        <button 
            onClick={() => onAdd(column.id)}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-3 pr-1 custom-scrollbar">
        <SortableContext items={taskIds}>
          {tasks.map((task) => (
            <TaskCard 
                key={task.id} 
                task={task} 
                onClick={onTaskClick}
                selected={selectedTaskIds.includes(task.id)}
                onSelect={onSelectTask}
                selectionMode={hasSelection} 
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground/40 text-sm italic border-2 border-dashed border-border/50 rounded-lg">
                Drop tasks here
            </div>
        )}
      </div>
    </div>
  );
};
