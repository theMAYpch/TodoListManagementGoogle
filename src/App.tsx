import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { ConfigProvider, Layout, Button, theme, Drawer } from "antd";
import { KanbanBoard } from "./components/KanbanBoard";
import { ImportDialog } from "./components/ImportDialog";
import { TaskModal } from "./components/TaskModal";
import { EpicModal } from "./components/EpicModal";
import { DashboardWidgets } from "./components/DashboardWidgets";
import { FilterSidebar } from "./components/FilterSidebar";
import { UpcomingEventsWidget } from "./components/UpcomingEventsWidget";
import { TimelineView } from "./components/TimelineView";
import { AIAssistant } from "./components/AIAssistant";
import { useTaskStore } from "./store/useTaskStore";
import { generatePrompt } from "./utils/export";
import { Copy, Check, Layout as LayoutIcon, ListTodo, Calendar, Sun, Moon, Plus, Menu as MenuIcon } from "lucide-react";
import type { Task, TaskStatus, Epic } from "./types";

const { Header, Content, Sider } = Layout;

// Placeholder Dashboard Component (kept for now, but usually should be separate)
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

    const { token } = theme.useToken();

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 h-full overflow-y-auto" style={{ color: token.colorText }}>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button 
                    onClick={handleExport}
                    icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                    {copied ? "Copied Prompt" : "Export to AI"}
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: token.colorBgContainer, borderColor: token.colorBorder }}>
                     <h3 className="text-sm font-medium text-muted-foreground">Total Tasks</h3>
                     <p className="text-3xl font-bold mt-2">{totalTasks}</p>
                 </div>
                 <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: token.colorBgContainer, borderColor: token.colorBorder }}>
                     <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
                     <p className="text-3xl font-bold mt-2 text-green-600">{completedTasks}</p>
                 </div>
                 <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: token.colorBgContainer, borderColor: token.colorBorder }}>
                     <h3 className="text-sm font-medium text-muted-foreground">Active Sprints</h3>
                     <p className="text-3xl font-bold mt-2">{Object.keys(tasksBySprint).length}</p>
                 </div>
                 <div className="p-6 rounded-xl border shadow-sm" style={{ backgroundColor: token.colorBgContainer, borderColor: token.colorBorder }}>
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [initialStatus, setInitialStatus] = useState<TaskStatus | undefined>(undefined);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Epic Creation State
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);

  const { addEpic, epics, fetchData } = useTaskStore(); // updateEpic removed

  useEffect(() => {
    fetchData();
  }, []); // Run once on mount

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

  // Only creation logic remains
  const handleCreateEpic = () => {
      setIsEpicModalOpen(true);
  };

  const handleSaveEpic = (epic: Epic) => {
       const exists = epics.some(e => e.id === epic.id);
       if (exists) {
           toast.error("Epic ID collision (should not happen for new epics)");
           // Optionally handle "Update" if we ever wanted to re-enable, but for now we only create
       } else {
           addEpic(epic);
           toast.success("Epic created");
       }
  };

  return (
    <ConfigProvider
        theme={{
            algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
            token: {
                colorPrimary: '#3b82f6',
            }
        }}
    >
        <Layout className="min-h-screen">
          <Toaster position="bottom-right" />
          
          <Header 
            className="flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 border-b"
            style={{ 
                backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff', 
                borderColor: isDarkMode ? '#303030' : '#e5e7eb',
                height: '64px',
                paddingInline: '16px'
            }}
          >
            <div className="flex items-center gap-2">
                <Button 
                    className="lg:hidden" 
                    type="text" 
                    icon={<MenuIcon className="w-5 h-5" />} 
                    onClick={() => setIsMobileSidebarOpen(true)}
                />
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
                    K
                </div>
                <h1 className="font-bold text-xl tracking-tight text-foreground hidden sm:block">Kanban<span className="text-primary">Pro</span></h1>
            </div>

            <nav className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg hidden md:flex">
                <Button 
                    type={activeTab === "board" ? "primary" : "text"}
                    onClick={() => setActiveTab("board")}
                    icon={<ListTodo className="w-4 h-4" />}
                >
                   Board
                </Button>
                <Button 
                    type={activeTab === "dashboard" ? "primary" : "text"}
                    onClick={() => setActiveTab("dashboard")}
                    icon={<LayoutIcon className="w-4 h-4" />}
                >
                    Dashboard
                </Button>
                <Button 
                    type={activeTab === "timeline" ? "primary" : "text"}
                    onClick={() => setActiveTab("timeline")}
                    icon={<Calendar className="w-4 h-4" />}
                >
                    Timeline
                </Button>
            </nav>

            <div className="flex items-center gap-2 md:gap-3">
                 <Button
                    type="text"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    icon={isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                 />
                 
                 <Button onClick={() => setIsImportOpen(true)} className="hidden sm:inline-flex">
                     Import
                 </Button>

                 <div className="flex items-center gap-2">
                    <Button onClick={handleCreateEpic} className="hidden sm:inline-flex">
                        Create Epic
                    </Button>
                    <Button 
                        type="primary" 
                        icon={<Plus className="w-4 h-4" />}
                        onClick={() => { setEditingTask(null); setInitialStatus(undefined); setIsTaskModalOpen(true); }}
                    >
                        <span className="hidden sm:inline">New Task</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                 </div>
            </div>
          </Header>
          
          <Layout>
              <Sider 
                width={250} 
                theme={isDarkMode ? 'dark' : 'light'}
                breakpoint="lg"
                collapsedWidth="0"
                trigger={null}
                style={{
                    background: isDarkMode ? '#141414' : '#ffffff',
                    borderRight: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
                    height: 'calc(100vh - 64px)',
                    position: 'sticky',
                    top: 64,
                    left: 0,
                    overflow: 'auto'
                }}
              >
                  <FilterSidebar />
              </Sider>

              {/* Mobile Drawer */}
              <Drawer
                title="Filters & Menu"
                placement="left"
                onClose={() => setIsMobileSidebarOpen(false)}
                open={isMobileSidebarOpen}
                width={280}
                styles={{ body: { padding: 0 } }}
              >
                  <div className="h-full pt-4">
                     <FilterSidebar />
                  </div>
              </Drawer>
              
              <Content className="bg-muted/10 relative overflow-hidden flex flex-col h-[calc(100vh-64px)] overflow-y-auto">
                <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 md:p-6 overflow-hidden">
                    {activeTab === "board" ? (
                        <KanbanBoard onEditTask={handleEditTask} onAddTask={handleAddTask} />
                    ) : activeTab === "dashboard" ? (
                        <Dashboard handleEditTask={handleEditTask} />
                    ) : (
                        <TimelineView onTaskClick={handleEditTask} />
                    )}
                </main>
              </Content>
          </Layout>
    
          <ImportDialog isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
          
          {isTaskModalOpen && (
              <TaskModal 
                isOpen={isTaskModalOpen} 
                onClose={() => setIsTaskModalOpen(false)} 
                taskToEdit={editingTask}
                initialStatus={initialStatus}
              />
          )}

          {isEpicModalOpen && (
              <EpicModal
                  isOpen={isEpicModalOpen}
                  onClose={() => setIsEpicModalOpen(false)}
                  onSave={handleSaveEpic}
              />
          )}

          {/* Mobile Bottom Nav */}
          <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-black/80 backdrop-blur-md border border-border rounded-full p-2 shadow-xl flex gap-1 z-50">
                <Button 
                    type={activeTab === "board" ? "primary" : "text"}
                    shape="circle"
                    icon={<ListTodo className="w-5 h-5" />}
                    onClick={() => setActiveTab("board")}
                />
                <Button 
                    type={activeTab === "dashboard" ? "primary" : "text"}
                    shape="circle"
                    icon={<LayoutIcon className="w-5 h-5" />}
                    onClick={() => setActiveTab("dashboard")}
                />
                <Button 
                    type={activeTab === "timeline" ? "primary" : "text"}
                    shape="circle"
                    icon={<Calendar className="w-5 h-5" />}
                    onClick={() => setActiveTab("timeline")}
                />

          </div>
          <AIAssistant />
        </Layout>
    </ConfigProvider>
  );
}

export default App;
