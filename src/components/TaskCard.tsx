import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";
import { Calendar, Link2, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../utils/cn";

type TaskCardProps = {
  task: Task;
  onClick: (task: Task) => void;
  selected: boolean;
  onSelect: (id: string) => void;
  selectionMode: boolean;
};

const CATEGORY_COLORS: Record<string, string> = {
  Feature: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Bug: "bg-red-500/10 text-red-600 dark:text-red-400",
  Doc: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  Meeting: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  Other: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

export const TaskCard = ({ task, onClick, selected, onSelect, selectionMode }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks === 0 ? 0 : (completedSubtasks / totalSubtasks) * 100;

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-card opacity-50 border border-primary/50 h-[200px] rounded-xl shadow-lg cursor-grabbing"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
          if (selectionMode) {
              e.preventDefault();
              onSelect(task.id);
          } else {
              onClick(task);
          }
      }}
      className={cn(
        "bg-card group hover:border-primary/50 transition-all duration-200 border p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing flex flex-col gap-3 relative",
        selected ? "border-primary ring-1 ring-primary" : "border-border"
      )}
    >
        {/* Selection Checkbox */}
        <div 
            role="button"
            onClick={(e) => {
                e.stopPropagation();
                onSelect(task.id);
            }}
            className={cn(
                "absolute top-4 right-4 z-10 w-5 h-5 rounded border flex items-center justify-center transition-all",
                selected ? "bg-primary border-primary opacity-100" : "bg-card border-muted opacity-0 group-hover:opacity-100",
                selectionMode && "opacity-100"
            )}
        >
            {selected && <CheckSquare className="w-3 h-3 text-primary-foreground" />}
        </div>

      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-medium",
            CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Other
          )}
        >
          {task.category}
        </span>
        {task.sprint && (
            <span className="text-[10px] text-muted-foreground font-mono px-1.5 py-0.5 bg-muted rounded">
                {task.sprint}
            </span>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">
          {task.title}
        </h3>
      </div>

      {totalSubtasks > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
             <div className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                <span>{completedSubtasks}/{totalSubtasks}</span>
             </div>
             <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
        <div className="flex items-center gap-3">
            {task.dueDate && (
                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(task.dueDate), "MMM d")}</span>
                 </div>
            )}
             {task.url && (
                <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                    <Link2 className="w-3.5 h-3.5" />
                </a>
            )}
        </div>
        
        {task.assignees.length > 0 && (
            <div className="flex -space-x-2">
                {task.assignees.map((assignee, i) => (
                    <div
                        key={i}
                        className="w-6 h-6 rounded-full bg-primary/10 border border-card flex items-center justify-center text-[10px] font-medium text-primary uppercase"
                        title={assignee}
                    >
                        {assignee.slice(0, 2)}
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
