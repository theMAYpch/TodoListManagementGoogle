import type { Task, FilterCriteria, TaskCategory } from "../types";

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

    return {
        totalTasks,
        completedTasks: completedCount,
        completionPercentage,
        categoryBreakdown
    };
};
