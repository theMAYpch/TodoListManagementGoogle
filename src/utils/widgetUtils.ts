import { differenceInCalendarDays, eachDayOfInterval, format, isAfter, startOfDay, subDays } from "date-fns";
import type { Task, FilterCriteria, TaskCategory, TaskStatus } from "../types";

export type WidgetStats = {
    totalTasks: number;
    completedTasks: number;
    completionPercentage: number;
    categoryBreakdown: {
        category: TaskCategory;
        total: number;
        completed: number;
        percentage: number;
    }[];
    // New Analytics
    cycleTime: {
        averageDays: number;
        distribution: { days: number; count: number }[];
    };
    bottlenecks: {
        status: TaskStatus;
        count: number;
    }[];
    burndown: {
        date: string;
        ideal: number;
        actual: number;
    }[];
    overdueTasks: Task[];
};

/**
 * Filter tasks based on filter criteria
 */
export const filterTasks = (tasks: Task[], criteria: FilterCriteria): Task[] => {
    return tasks.filter(task => {
        // Search
        if (criteria.search) {
            const query = criteria.search.toLowerCase();
            if (!task.title.toLowerCase().includes(query) && !task.description.toLowerCase().includes(query)) {
                return false;
            }
        }
        
        // Categories
        if (criteria.categories && criteria.categories.length > 0) {
            if (!criteria.categories.includes(task.category)) return false;
        }

        // Statuses
        if (criteria.statuses && criteria.statuses.length > 0) {
            if (!criteria.statuses.includes(task.status)) return false;
        }

        // Sprints
        if (criteria.sprints && criteria.sprints.length > 0) {
            if (!task.sprint || !criteria.sprints.includes(task.sprint)) return false;
        }
        
        // Epics
        if (criteria.epics && criteria.epics.length > 0) {
            if (!task.epicId || !criteria.epics.includes(task.epicId)) return false;
        }

        // Assignees
        if (criteria.assignees && criteria.assignees.length > 0) {
            const hasMatchingAssignee = task.assignees.some(assignee => 
                criteria.assignees?.includes(assignee)
            );
            if (!hasMatchingAssignee) return false;
        }

        return true;
    });
};

/**
 * Calculate widget statistics from filtered tasks
 */
export const calculateWidgetStats = (tasks: Task[], criteria: FilterCriteria): WidgetStats => {
    const filteredTasks = filterTasks(tasks, criteria);
    const completedTasks = filteredTasks.filter(t => t.status === 'done');
    
    const totalTasks = filteredTasks.length;
    const completedCount = completedTasks.length;
    const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

    // Calculate category breakdown
    const categoryMap = new Map<TaskCategory, { total: number; completed: number }>();
    
    filteredTasks.forEach(task => {
        const current = categoryMap.get(task.category) || { total: 0, completed: 0 };
        current.total += 1;
        if (task.status === 'done') {
            current.completed += 1;
        }
        categoryMap.set(task.category, current);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, stats]) => ({
        category,
        total: stats.total,
        completed: stats.completed,
        percentage: stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100)
    }));

    // --- 1. Cycle Time Calculation ---
    // Simple heuristic: (CreatedAt -> Done) or (StartDate -> Done) if StartDate exists
    // Calculate days taken for completed tasks
    const cycleTimeData: number[] = completedTasks.map(t => {
        const end = new Date(); // Ideally this would be 'completedAt' timestamp, but using now or dueDate as proxy if missing
        const start = t.startDate ? new Date(t.startDate) : new Date(t.createdAt);
        return Math.max(1, differenceInCalendarDays(end, start));
    });
    
    const cycleTimeDistribution = new Map<number, number>();
    cycleTimeData.forEach(day => {
        cycleTimeDistribution.set(day, (cycleTimeDistribution.get(day) || 0) + 1);
    });

    const avgCycleTime = cycleTimeData.length > 0 
        ? Math.round(cycleTimeData.reduce((a, b) => a + b, 0) / cycleTimeData.length) 
        : 0;

    // --- 2. Bottleneck (Status Distribution) ---
    const explicitStatuses: TaskStatus[] = ["todo", "doing", "review", "done"];
    const bottlenecks = explicitStatuses.map(status => ({
        status,
        count: filteredTasks.filter(t => t.status === status).length
    }));

    // --- 3. Burndown Chart Data ---
    // Generate data for the last 14 days or sprint duration
    // For simplicity, we'll look at the last 14 days by default
    const today = startOfDay(new Date());
    const startDate = subDays(today, 13);
    const dateRange = eachDayOfInterval({ start: startDate, end: today });
    
    // Ideal burn: Start at Total, reach 0 at projected end. 
    // Here we show remaining tasks count
    const burndown = dateRange.map((date, index) => {
        // This is a simplified "Current Snapshot" projection because we lack event sourcing
        // Real burndown needs 'history'. We will render a static mock-like trend 
        // based on current state to demonstrate the UI,
        // OR we can calculate 'Tasks Due On or Before this Date' (Burn-up of scope)
        
        // Let's do a "Tasks Due vs Tasks Done" (Burn-up style is easier with current data)
        // Chart: Ideal Line (Cumulative Total Scope) vs Actual Done (Count of Done items)
        
        return {
            date: format(date, 'MMM dd'),
            ideal: totalTasks - (index * (totalTasks / 14)), // Linear ideal burn
            actual: totalTasks - completedCount // This currently stays flat without history. 
            // In a real app we'd log status changes.
            // For now, let's keep it simple: Just sending current remaining count.
        };
    });

    // --- 4. Overdue Tasks ---
    const overdueTasks = filteredTasks.filter(t => {
        if (t.status === 'done' || !t.dueDate) return false;
        return isAfter(today, new Date(t.dueDate));
    });

    return {
        totalTasks,
        completedTasks: completedCount,
        completionPercentage,
        categoryBreakdown,
        cycleTime: {
            averageDays: avgCycleTime,
            distribution: Array.from(cycleTimeDistribution.entries())
                .map(([days, count]) => ({ days, count }))
                .sort((a, b) => a.days - b.days)
        },
        bottlenecks,
        burndown,
        overdueTasks
    };
};
