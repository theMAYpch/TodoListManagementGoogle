import { Calendar, Clock, AlertCircle } from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";
import { cn } from "../utils/cn";
import { format, isToday, isTomorrow, isPast, parseISO, differenceInDays } from "date-fns";

const CATEGORY_COLORS: Record<string, string> = {
    Feature: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    Bug: "bg-red-500/10 text-red-600 border-red-500/20",
    Doc: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    Meeting: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    Other: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

export const UpcomingEventsWidget = ({ onTaskClick }: { onTaskClick?: (taskId: string) => void }) => {
    const { tasks } = useTaskStore();

    // Get the single most upcoming task (excluding completed tasks)
    const upcomingTasks = tasks
        .filter(task => task.dueDate && task.dueDate.trim() !== "")
        .filter(task => task.status !== 'done') // Exclude completed tasks
        .map(task => ({
            ...task,
            dueDateObj: parseISO(task.dueDate)
        }))
        .sort((a, b) => a.dueDateObj.getTime() - b.dueDateObj.getTime())
        .filter(task => {
            const daysUntilDue = differenceInDays(task.dueDateObj, new Date());
            return daysUntilDue <= 7; // Include overdue and next 7 days
        })
        .slice(0, 1); // Show only the most upcoming task

    const getUrgencyInfo = (date: Date) => {
        if (isPast(date) && !isToday(date)) {
            return {
                label: "Overdue",
                color: "text-red-600 bg-red-500/10 border-red-500/20",
                icon: <AlertCircle className="w-3 h-3" />
            };
        }
        if (isToday(date)) {
            return {
                label: "Today",
                color: "text-orange-600 bg-orange-500/10 border-orange-500/20",
                icon: <Clock className="w-3 h-3" />
            };
        }
        if (isTomorrow(date)) {
            return {
                label: "Tomorrow",
                color: "text-yellow-600 bg-yellow-500/10 border-yellow-500/20",
                icon: <Calendar className="w-3 h-3" />
            };
        }
        return {
            label: format(date, "MMM d"),
            color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
            icon: <Calendar className="w-3 h-3" />
        };
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Upcoming Events</h3>
            </div>

            {upcomingTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm italic">
                    No upcoming tasks in the next 7 days
                </div>
            ) : (
                <div className="space-y-2">
                    {upcomingTasks.map(task => {
                        const urgency = getUrgencyInfo(task.dueDateObj);
                        return (
                            <button
                                key={task.id}
                                onClick={() => onTaskClick?.(task.id)}
                                className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-xs font-medium border",
                                                CATEGORY_COLORS[task.category]
                                            )}>
                                                {task.category}
                                            </span>
                                            {task.sprint && (
                                                <span className="text-xs text-muted-foreground font-mono">
                                                    {task.sprint}
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                            {task.title}
                                        </h4>
                                        {task.assignees.length > 0 && (
                                            <div className="flex items-center gap-1 mt-1">
                                                {task.assignees.slice(0, 3).map((assignee, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[9px] font-medium text-primary uppercase"
                                                        title={assignee}
                                                    >
                                                        {assignee.slice(0, 2)}
                                                    </div>
                                                ))}
                                                {task.assignees.length > 3 && (
                                                    <span className="text-xs text-muted-foreground">
                                                        +{task.assignees.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium whitespace-nowrap",
                                        urgency.color
                                    )}>
                                        {urgency.icon}
                                        {urgency.label}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
