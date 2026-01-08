import { useState, useMemo } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { format, parseISO, subDays, differenceInDays, startOfDay } from "date-fns";
import type { Task } from "../types";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
    Feature: "#3b82f6",
    Bug: "#ef4444",
    Doc: "#eab308",
    Meeting: "#a855f7",
    Other: "#6b7280",
};

const STATUS_COLORS = {
    todo: "#6b7280",
    doing: "#3b82f6",
    review: "#f59e0b",
    done: "#10b981"
};

export const TimelineView = ({ onTaskClick }: { onTaskClick?: (task: Task) => void }) => {
    const { tasks } = useTaskStore();
    const [selectedSprint, setSelectedSprint] = useState<string | "all">("all");
    const [viewStartDate, setViewStartDate] = useState<Date>(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1); // Start of current month
    });

    // Get unique sprints
    const sprints = useMemo(() => 
        Array.from(new Set(tasks.map(t => t.sprint).filter(Boolean))).sort(),
        [tasks]
    );

    // Filter tasks with due dates
    const tasksWithDates = useMemo(() => {
        return tasks
            .filter(task => task.dueDate && task.dueDate.trim() !== "")
            .filter(task => selectedSprint === "all" || task.sprint === selectedSprint)
            .map(task => {
                const dueDate = parseISO(task.dueDate);
                const startDate = task.startDate && task.startDate.trim() !== ""
                    ? parseISO(task.startDate) 
                    : subDays(dueDate, 7);
                
                return {
                    ...task,
                    startDateObj: startDate,
                    dueDateObj: dueDate
                };
            })
            .sort((a, b) => a.startDateObj.getTime() - b.startDateObj.getTime());
    }, [tasks, selectedSprint]);

    // Calculate timeline range (30 days from viewStartDate)
    const timelineEndDate = new Date(viewStartDate);
    timelineEndDate.setDate(timelineEndDate.getDate() + 30);

    // Generate day columns for the timeline
    const dayColumns = useMemo(() => {
        const days = [];
        const current = new Date(viewStartDate);
        for (let i = 0; i < 30; i++) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return days;
    }, [viewStartDate]);

    const handlePrevMonth = () => {
        const newDate = new Date(viewStartDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setViewStartDate(newDate);
    };

    const handleNextMonth = () => {
        const newDate = new Date(viewStartDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setViewStartDate(newDate);
    };

    const handleToday = () => {
        const today = new Date();
        setViewStartDate(new Date(today.getFullYear(), today.getMonth(), 1));
    };

    // Calculate bar position and width for a task
    const getBarStyle = (task: typeof tasksWithDates[0]) => {
        const taskStart = startOfDay(task.startDateObj);
        const taskEnd = startOfDay(task.dueDateObj);
        const rangeStart = startOfDay(viewStartDate);
        
        // Calculate position relative to the visible 30-day range
        const daysFromRangeStart = differenceInDays(taskStart, rangeStart);
        const taskDuration = differenceInDays(taskEnd, taskStart) + 1;
        
        // Clamp to visible range
        const visibleStart = Math.max(0, daysFromRangeStart);
        const visibleEnd = Math.min(30, daysFromRangeStart + taskDuration);
        
        // If task is completely outside visible range, don't show it
        if (visibleEnd <= 0 || visibleStart >= 30) {
            return {
                display: 'none'
            };
        }
        
        // Calculate percentage positions
        const leftPercent = (visibleStart / 30) * 100;
        const widthPercent = ((visibleEnd - visibleStart) / 30) * 100;
        
        return {
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
            backgroundColor: STATUS_COLORS[task.status],
            borderColor: CATEGORY_COLORS[task.category]
        };
    };

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden bg-background">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold">Timeline</h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Date Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleToday}
                            className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold ml-2">
                            {format(viewStartDate, 'MMMM yyyy')}
                        </span>
                    </div>

                    {/* Sprint Filter */}
                    <select
                        value={selectedSprint}
                        onChange={(e) => setSelectedSprint(e.target.value)}
                        className="px-3 py-2 bg-card border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        <option value="all">All Sprints</option>
                        {sprints.map(sprint => (
                            <option key={sprint} value={sprint}>{sprint}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mb-4 p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-muted-foreground">Status:</span>
                    {Object.entries(STATUS_COLORS).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                            <span className="text-sm capitalize">{status}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gantt Chart */}
            {tasksWithDates.length === 0 ? (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-xl">
                    <div className="text-center">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-1">No tasks with due dates</p>
                        <p className="text-sm text-muted-foreground">
                            Add due dates to your tasks to see them on the timeline
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 bg-card rounded-xl border border-border overflow-hidden flex flex-col">
                    {/* Timeline Header */}
                    <div className="flex border-b border-border bg-muted/30">
                        <div className="w-64 flex-shrink-0 p-3 border-r border-border font-semibold text-sm">
                            Task
                        </div>
                        <div className="flex-1 flex">
                            {dayColumns.map((day, i) => (
                                <div
                                    key={i}
                                    className="flex-1 p-2 text-center border-r border-border last:border-r-0"
                                >
                                    <div className="text-xs font-semibold">{format(day, 'EEE')}</div>
                                    <div className="text-xs text-muted-foreground">{format(day, 'd')}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Body */}
                    <div className="flex-1 overflow-y-auto">
                        {tasksWithDates.map(task => (
                            <div key={task.id} className="flex border-b border-border hover:bg-muted/30 transition-colors">
                                {/* Task Info */}
                                <div className="w-64 flex-shrink-0 p-3 border-r border-border">
                                    <button
                                        onClick={() => onTaskClick?.(task)}
                                        className="text-left w-full group"
                                    >
                                        <div className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                            {task.title}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className="text-xs px-1.5 py-0.5 rounded"
                                                style={{
                                                    backgroundColor: `${CATEGORY_COLORS[task.category]}20`,
                                                    color: CATEGORY_COLORS[task.category]
                                                }}
                                            >
                                                {task.category}
                                            </span>
                                            {task.sprint && (
                                                <span className="text-xs text-muted-foreground">
                                                    {task.sprint}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                </div>

                                {/* Timeline Bar */}
                                <div className="flex-1 relative p-3">
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 h-6 rounded border-2 cursor-pointer hover:opacity-80 transition-opacity"
                                        style={getBarStyle(task)}
                                        onClick={() => onTaskClick?.(task)}
                                        title={`${task.title}\n${format(task.startDateObj, 'MMM d')} - ${format(task.dueDateObj, 'MMM d')}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
