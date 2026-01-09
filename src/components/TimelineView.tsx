import { useState, useMemo } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { format, parseISO, subDays, differenceInCalendarDays, startOfDay } from "date-fns";
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

    const handleMonthChange = (month: number) => {
        const newDate = new Date(viewStartDate);
        newDate.setMonth(month);
        setViewStartDate(newDate);
    };

    const handleYearChange = (year: number) => {
        const newDate = new Date(viewStartDate);
        newDate.setFullYear(year);
        setViewStartDate(newDate);
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

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
                        
                        <div className="flex items-center gap-1">
                            <select
                                value={viewStartDate.getMonth()}
                                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                                className="bg-transparent font-semibold cursor-pointer hover:text-primary outline-none text-sm"
                            >
                                {months.map((month, i) => (
                                    <option key={month} value={i} className="bg-background">{month}</option>
                                ))}
                            </select>
                            <select
                                value={viewStartDate.getFullYear()}
                                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                                className="bg-transparent font-semibold cursor-pointer hover:text-primary outline-none text-sm"
                            >
                                {years.map(year => (
                                    <option key={year} value={year} className="bg-background">{year}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        
                        <button
                            onClick={handleToday}
                            className="px-3 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors ml-2"
                        >
                            Today
                        </button>
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
                <div className="flex-1 bg-card rounded-xl border border-border overflow-auto relative">
                    <div className="min-w-max">
                        {/* Timeline Header */}
                        <div className="flex sticky top-0 z-30 bg-muted/90 backdrop-blur-sm border-b border-border">
                            <div className="w-64 flex-shrink-0 p-4 sticky left-0 z-40 bg-card border-r border-border font-bold text-sm shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                Task
                            </div>
                            <div className="flex">
                                {dayColumns.map((day, i) => (
                                    <div
                                        key={i}
                                        className="w-20 flex-shrink-0 p-2 text-center border-r border-border last:border-r-0"
                                    >
                                        <div className="text-[10px] font-bold uppercase tracking-tighter">{format(day, 'EEE')}</div>
                                        <div className="text-xs font-semibold text-muted-foreground">{format(day, 'd')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timeline Rows */}
                        <div className="divide-y divide-border">
                            {tasksWithDates.map(task => {
                                const taskStart = startOfDay(task.startDateObj);
                                const taskEnd = startOfDay(task.dueDateObj);
                                const rangeStart = startOfDay(viewStartDate);
                                
                                // Calculate which columns the bar spans
                                const daysFromStart = differenceInCalendarDays(taskStart, rangeStart);
                                const duration = differenceInCalendarDays(taskEnd, taskStart) + 1;
                                
                                // Skip if completely outside range
                                if (daysFromStart + duration <= 0 || daysFromStart >= 30) return null;
                                
                                // Clamp to visible range for the bar display
                                const startCol = Math.max(0, daysFromStart);
                                const endCol = Math.min(30, daysFromStart + duration);
                                
                                return (
                                    <div key={task.id} className="flex hover:bg-muted/30 transition-colors group">
                                        {/* Sticky Task Info */}
                                        <div className="w-64 flex-shrink-0 p-4 sticky left-0 z-20 bg-card border-r border-border shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <button
                                                onClick={() => onTaskClick?.(task)}
                                                className="text-left w-full"
                                            >
                                                <div className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                                                    {task.title}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span
                                                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                                                        style={{
                                                            backgroundColor: `${CATEGORY_COLORS[task.category]}15`,
                                                            color: CATEGORY_COLORS[task.category]
                                                        }}
                                                    >
                                                        {task.category}
                                                    </span>
                                                    {task.sprint && (
                                                        <span className="text-[10px] text-muted-foreground font-medium">
                                                            {task.sprint}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        </div>

                                        {/* Timeline Grid & Bar */}
                                        <div className="flex relative h-16">
                                            {/* Grid Lines */}
                                            <div className="absolute inset-0 flex pointer-events-none">
                                                {dayColumns.map((_, i) => (
                                                    <div key={i} className="w-20 flex-shrink-0 border-r border-border/20 last:border-r-0" />
                                                ))}
                                            </div>
                                            
                                            {/* Task Bar */}
                                            <div
                                                className="absolute top-1/2 -translate-y-1/2 h-8 rounded-lg border-2 shadow-sm cursor-pointer hover:scale-[1.02] hover:brightness-110 transition-all duration-200"
                                                style={{
                                                    left: `${startCol * 80}px`,
                                                    width: `${(endCol - startCol) * 80}px`,
                                                    backgroundColor: STATUS_COLORS[task.status],
                                                    borderColor: CATEGORY_COLORS[task.category],
                                                    zIndex: 10
                                                }}
                                                onClick={() => onTaskClick?.(task)}
                                                title={`${task.title}\n${format(task.startDateObj, 'MMM d')} - ${format(task.dueDateObj, 'MMM d')}`}
                                            >
                                                <div className="h-full w-full flex items-center px-3 overflow-hidden">
                                                    <span className="text-[10px] font-bold text-white whitespace-nowrap drop-shadow-sm">
                                                        {format(task.startDateObj, 'M/d')} - {format(task.dueDateObj, 'M/d')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
