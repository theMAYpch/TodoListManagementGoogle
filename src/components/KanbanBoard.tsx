import { useState } from "react";
import { 
    DndContext, 
    closestCorners, 
    useSensor, 
    useSensors, 
    PointerSensor, 
    DragOverlay,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import { Modal, theme } from "antd";
import { useTaskStore } from "../store/useTaskStore";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { FilterBar } from "./FilterBar";
import { Trash2, X } from "lucide-react";
import type { Task, Column } from "../types";

type KanbanBoardProps = {
    onEditTask: (task: Task) => void;
    onAddTask: (status: string) => void;
};

export const KanbanBoard = ({ onEditTask, onAddTask }: KanbanBoardProps) => {
    const { 
        tasks, 
        columns, 
        moveTask, 
        reorderTasks, 
        selectedTaskIds, 
        toggleTaskSelection, 
        clearSelection,
        selectAll,
        deleteTasks,
        updateTasks,
        searchQuery,
        activeFilter
    } = useTaskStore();
    
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const { token } = theme.useToken();

    // Filter tasks based on search and active filters
    const filteredTasks = tasks.filter(task => {
        // 1. Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!task.title.toLowerCase().includes(query) && !task.description.toLowerCase().includes(query)) {
                return false;
            }
        }
        
        // 2. Categories
        if (activeFilter.categories && activeFilter.categories.length > 0) {
            if (!activeFilter.categories.includes(task.category)) return false;
        }

        // 3. Statuses
        if (activeFilter.statuses && activeFilter.statuses.length > 0) {
            if (!activeFilter.statuses.includes(task.status)) return false;
        }

        // 4. Sprints
        if (activeFilter.sprints && activeFilter.sprints.length > 0) {
            if (!task.sprint || !activeFilter.sprints.includes(task.sprint)) return false;
        }

        // 5. Assignees
        if (activeFilter.assignees && activeFilter.assignees.length > 0) {
            const hasMatchingAssignee = task.assignees.some(assignee => 
                activeFilter.assignees?.includes(assignee)
            );
            if (!hasMatchingAssignee) return false;
        }
        
        // 6. Epics
         if (activeFilter.epics && activeFilter.epics.length > 0) {
            if (!task.epicId || !activeFilter.epics.includes(task.epicId)) return false;
        }

        return true;
    });

    const hasSelection = selectedTaskIds.length > 0;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, 
            },
        })
    );

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;

        if (isActiveTask && isOverTask) {
             const activeTask = tasks.find(t => t.id === activeId);
             const overTask = tasks.find(t => t.id === overId);
             
             if (activeTask && overTask && activeTask.status !== overTask.status) {
                moveTask(activeTask.id, overTask.status);
             }
        }
        
        const isOverColumn = over.data.current?.type === "Column";
        if (isActiveTask && isOverColumn) {
             const activeTask = tasks.find(t => t.id === activeId);
             const overColumn = over.data.current?.column as Column;
             if (activeTask && activeTask.status !== overColumn.id) {
                 moveTask(activeTask.id, overColumn.id);
             }
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
        
        const { active, over } = event;
        if (!over) return;
        
        const activeId = active.id;
        const overId = over.id;
        
        if (activeId === overId) return;
        
         const isActiveTask = active.data.current?.type === "Task";
         const isOverTask = over.data.current?.type === "Task";
         
         if (isActiveTask && isOverTask) {
             const activeIndex = tasks.findIndex(t => t.id === activeId);
             const overIndex = tasks.findIndex(t => t.id === overId);
             
             if (tasks[activeIndex].status === tasks[overIndex].status) {
                 reorderTasks(arrayMove(tasks, activeIndex, overIndex));
             }
         }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden relative">
             <FilterBar />

             <div className="flex-1 overflow-x-auto p-6">
                <div className="flex gap-6 h-full min-w-max">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={onDragStart}
                        onDragOver={onDragOver}
                        onDragEnd={onDragEnd}
                    >
                        {columns.map((col) => (
                            <KanbanColumn
                                key={col.id}
                                column={col}
                                tasks={filteredTasks.filter(t => t.status === col.id)}
                                onTaskClick={onEditTask}
                                onAdd={onAddTask}
                                selectedTaskIds={selectedTaskIds}
                                onSelectTask={toggleTaskSelection}
                                hasSelection={hasSelection}
                            />
                        ))}
                        
                        {createPortal(
                            <DragOverlay>
                                {activeTask && (
                                    <TaskCard 
                                        task={activeTask} 
                                        onClick={() => {}} 
                                        selected={false} 
                                        onSelect={() => {}}
                                        selectionMode={false}
                                    />
                                )}
                            </DragOverlay>,
                            document.body
                        )}
                    </DndContext>
                </div>
            </div>

            {/* Floating Selection Bar */}
            {hasSelection && (
                <div 
                    className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-xl flex items-center gap-6 animate-in slide-in-from-bottom-5 duration-300 z-[100]"
                    style={{ backgroundColor: token.colorText, color: token.colorBgContainer }}
                >
                    <span className="font-semibold whitespace-nowrap">{selectedTaskIds.length} Selected</span>
                    <div className="h-4 w-[1px] bg-current opacity-20" />
                    
                    {/* Select All */}
                    <button 
                        onClick={() => {
                            const allVisibleIds = filteredTasks.map(t => t.id);
                            if (selectedTaskIds.length === allVisibleIds.length) {
                                clearSelection();
                            } else {
                                selectAll(allVisibleIds);
                            }
                        }}
                        className="text-xs font-medium hover:opacity-70 transition-opacity whitespace-nowrap"
                    >
                        {selectedTaskIds.length === filteredTasks.length ? "Deselect All" : "Select All"}
                    </button>

                    <div className="h-4 w-[1px] bg-current opacity-20" />
                    
                    {/* Batch Move */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs opacity-60 font-medium uppercase tracking-wide">Move to:</span>
                        <div className="flex gap-1">
                            {columns.map(col => (
                                <button
                                    key={col.id}
                                    onClick={() => updateTasks(selectedTaskIds, { status: col.id })}
                                    className="px-2 py-1 text-xs font-medium rounded hover:bg-white/20 transition-colors border border-white/10"
                                >
                                    {col.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-4 w-[1px] bg-current opacity-20" />
                    
                    <button 
                        onClick={() => {
                            Modal.confirm({
                                title: `Delete ${selectedTaskIds.length} tasks?`,
                                content: 'This action cannot be undone.',
                                okType: 'danger',
                                onOk: () => deleteTasks(selectedTaskIds)
                            });
                        }}
                        className="flex items-center gap-2 hover:text-red-400 transition-colors whitespace-nowrap"
                    >
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button onClick={clearSelection} className="ml-2 hover:opacity-70 transition-opacity">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};
