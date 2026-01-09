import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Link as LinkIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useTaskStore } from "../store/useTaskStore";
import type { Task, TaskCategory, TaskStatus, SubTask } from "../types";
import { cn } from "../utils/cn";

type TaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null; // If null, we are creating a new task
  initialStatus?: TaskStatus; // If creating, which column?
};

const CATEGORIES: TaskCategory[] = ["Feature", "Bug", "Doc", "Meeting", "Other"];

export const TaskModal = ({ isOpen, onClose, taskToEdit, initialStatus }: TaskModalProps) => {
  const { addTask, updateTask, deleteTask } = useTaskStore();
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [category, setCategory] = useState<TaskCategory>("Feature");
  const [sprint, setSprint] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignees, setAssignees] = useState(""); // Comma separated string
  const [url, setUrl] = useState("");
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);

  // Initialize form when opening
  useEffect(() => {
    if (isOpen) {
      if (taskToEdit) {
        setTitle(taskToEdit.title);
        setDescription(taskToEdit.description);
        setStatus(taskToEdit.status);
        setCategory(taskToEdit.category);
        setSprint(taskToEdit.sprint);
        setStartDate(taskToEdit.startDate ? taskToEdit.startDate.split('T')[0] : "");
        setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : "");
        setAssignees(taskToEdit.assignees.join(", "));
        setUrl(taskToEdit.url || "");
        setSubtasks(taskToEdit.subtasks);
      } else {
        // Reset for new task
        setTitle("");
        setDescription("");
        setStatus(initialStatus || "todo");
        setCategory("Feature");
        // Default sprint to current year/month based to suggest usage
        const now = new Date();
        setSprint(`Sprint ${now.getFullYear()}-${now.getMonth() + 1}`); 
        setStartDate("");
        setDueDate("");
        setAssignees("");
        setUrl("");
        setSubtasks([]);
      }
    }
  }, [isOpen, taskToEdit, initialStatus]);

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    const taskData = {
      title,
      description,
      status,
      category,
      sprint,
      startDate,
      dueDate,
      assignees: assignees.split(",").map((s: string) => s.trim()).filter(Boolean),
      url,
      subtasks,
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask({
        id: uuidv4(),
        createdAt: Date.now(),
        ...taskData,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (taskToEdit && confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskToEdit.id);
      onClose();
    }
  };

  const addSubtask = () => {
    setSubtasks([...subtasks, { id: uuidv4(), title: "", completed: false }]);
  };

  const updateSubtask = (id: string, updates: Partial<SubTask>) => {
    setSubtasks(subtasks.map((t: SubTask) => t.id === id ? { ...t, ...updates } : t));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((t: SubTask) => t.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl border border-border flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">
            {taskToEdit ? "Edit Task" : "New Task"}
          </h2>
          <div className="flex items-center gap-2">
            {taskToEdit && (
              <button 
                onClick={handleDelete}
                className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Category</label>
                    <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TaskCategory)}
                        className="w-full bg-secondary/20 border border-input rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Status</label>
                    <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TaskStatus)}
                        className="w-full bg-secondary/20 border border-input rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                        <option value="todo">To Do</option>
                        <option value="doing">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                    </select>
                 </div>
            </div>

            <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Task Title"
                    className="w-full bg-secondary/20 border border-input rounded-lg p-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
            </div>

             <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details..."
                    className="w-full h-24 bg-secondary/20 border border-input rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Sprint</label>
                    <input
                        type="text"
                        value={sprint}
                        onChange={(e) => setSprint(e.target.value)}
                        placeholder="e.g. Sprint 2026-01"
                        className="w-full bg-secondary/20 border border-input rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Assignees</label>
                    <input
                        type="text"
                        value={assignees}
                        onChange={(e) => setAssignees(e.target.value)}
                        placeholder="John, Jane, Bob"
                        className="w-full bg-secondary/20 border border-input rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                 </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-secondary/20 border border-input rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Due Date</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-secondary/20 border border-input rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                 </div>
            </div>



             <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">External Link</label>
                <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-secondary/20 border border-input rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                </div>
            </div>

            {/* Subtasks Section */}
            <div>
                 <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subtasks ({subtasks.filter((s: SubTask)=>s.completed).length}/{subtasks.length})</label>
                    <button onClick={addSubtask} className="text-primary text-xs font-medium hover:underline flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Item
                    </button>
                 </div>
                 <div className="space-y-2">
                    {subtasks.map((sub: SubTask) => (
                        <div key={sub.id} className="flex items-center gap-2 group">
                             <button 
                                onClick={() => updateSubtask(sub.id, { completed: !sub.completed })}
                                className={cn(
                                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                    sub.completed ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 hover:border-primary"
                                )}
                             >
                                {sub.completed && <Check className="w-3 h-3" />}
                             </button>
                             <input 
                                type="text"
                                value={sub.title}
                                onChange={(e) => updateSubtask(sub.id, { title: e.target.value })}
                                placeholder="Subtask..."
                                className={cn(
                                    "flex-1 bg-transparent border-b border-transparent focus:border-primary outline-none text-sm p-1",
                                    sub.completed && "text-muted-foreground line-through"
                                )}
                             />
                             <button onClick={() => removeSubtask(sub.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                                <X className="w-4 h-4" />
                             </button>
                        </div>
                    ))}
                 </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end gap-3 bg-muted/20 rounded-b-xl">
            <button 
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
                {taskToEdit ? "Save Changes" : "Create Task"}
            </button>
        </div>

      </div>
    </div>
  );
};
