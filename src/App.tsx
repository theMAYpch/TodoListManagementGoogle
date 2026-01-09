import { useState, useEffect } from "react";
import { KanbanBoard } from "./components/KanbanBoard";
import { ImportDialog } from "./components/ImportDialog";
import { TaskModal } from "./components/TaskModal";
import { DashboardWidgets } from "./components/DashboardWidgets";
import { FilterSidebar } from "./components/FilterSidebar";
import { UpcomingEventsWidget } from "./components/UpcomingEventsWidget";
import { TimelineView } from "./components/TimelineView";
import { useTaskStore } from "./store/useTaskStore";
import { generatePrompt } from "./utils/export";
import { Copy, Check, Layout, ListTodo, Calendar, Sun, Moon } from "lucide-react";
import type { Task, TaskStatus } from "./types";
import { cn } from "./utils/cn";

// Placeholder Dashboard Component
const Dashboard = ({ handleEditTask }: { handleEditTask: (task: Task) => void }) => {
    const { tasks } = useTaskStore();
    const [copied, setCopied] = useState(false);
    
    const handleExport = () => {
        const text = generatePrompt(tasks);
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const tasksBySprint: Record<string, number> = {};
    const tasksByCategory: Record<string, number> = {};
    
    tasks.forEach(t => {
        if (t.sprint) {
            tasksBySprint[t.sprint] = (tasksBySprint[t.sprint] || 0) + 1;
        }
        tasksByCategory[t.category] = (tasksByCategory[t.category] || 0) + 1;
    });

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 h-full overflow-y-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors font-medium text-sm"
                >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied Prompt" : "Export to AI"}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                     <h3 className="text-sm font-medium text-muted-foreground">Total Tasks</h3>
                     <p className="text-3xl font-bold mt-2">{totalTasks}</p>
                 </div>
                 <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                     <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
                     <p className="text-3xl font-bold mt-2 text-green-600">{completedTasks}</p>
                 </div>
                 <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                     <h3 className="text-sm font-medium text-muted-foreground">Active Sprints</h3>
                     <p className="text-3xl font-bold mt-2">{Object.keys(tasksBySprint).length}</p>
                 </div>
                 <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                     <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
                     <p className="text-3xl font-bold mt-2">{Object.keys(tasksByCategory).length}</p>
                 </div>
            </div>

            {/* Upcoming Events */}
            <div>
                <UpcomingEventsWidget onTaskClick={(taskId) => {
                    const task = tasks.find(t => t.id === taskId);
                    if (task) handleEditTask(task);
                }} />
            </div>

            <div className="pt-4 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">Analytics</h3>
                <DashboardWidgets />
            </div>
        </div>
    );
}

function App() {
  const [activeTab, setActiveTab] = useState<"board" | "dashboard" | "timeline">("board");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleEditTask = (task: Task) => {
      setEditingTask(task);
      setIsTaskModalOpen(true);
  };

  const handleAddTask = (status: string) => {
      setEditingTask(null);
      setInitialStatus(status as TaskStatus);
      setIsTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Navbar */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
                K
            </div>
            <h1 className="font-bold text-xl tracking-tight">Kanban<span className="text-primary">Pro</span></h1>
        </div>

        <nav className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab("board")}
                className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    activeTab === "board" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
            >
               <ListTodo className="w-4 h-4" /> Board
            </button>
            <button 
                onClick={() => setActiveTab("dashboard")}
                className={cn(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    activeTab === "dashboard" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Layout className="w-4 h-4" /> Dashboard
            </button>
            <button 
                onClick={() => setActiveTab("timeline")}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium",
                    activeTab === "timeline" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
            >
                <Calendar className="w-4 h-4" /> Timeline
            </button>
        </nav>

        <div className="flex items-center gap-3">
             {/* Theme Toggle */}
             <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             
             <button 
                onClick={() => setIsImportOpen(true)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                Import
            </button>
            <button 
                onClick={() => { setEditingTask(null); setInitialStatus(undefined); setIsTaskModalOpen(true); }}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
                + New Task
            </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <FilterSidebar />
          
          <main className="flex-1 overflow-hidden relative bg-muted/10">
            {activeTab === "board" ? (
                <KanbanBoard onEditTask={handleEditTask} onAddTask={handleAddTask} />
            ) : activeTab === "dashboard" ? (
                <Dashboard handleEditTask={handleEditTask} />
            ) : (
                <TimelineView onTaskClick={handleEditTask} />
            )}
          </main>
      </div>

      <ImportDialog isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
      
      {isTaskModalOpen && (
          <TaskModal 
            isOpen={isTaskModalOpen} 
            onClose={() => setIsTaskModalOpen(false)} 
            taskToEdit={editingTask}
            initialStatus={initialStatus}
          />
      )}
    </div>
  );
}

export default App;
