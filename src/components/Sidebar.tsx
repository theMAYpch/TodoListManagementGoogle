import React from "react";
import { LayoutDashboard, KanbanSquare, Upload } from "lucide-react";
import { cn } from "../utils/cn";

type SidebarProps = {
  activeTab: "board" | "dashboard";
  setActiveTab: (tab: "board" | "dashboard") => void;
  onImportClick: () => void;
};

const Sidebar = ({ activeTab, setActiveTab, onImportClick }: SidebarProps) => {
  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col p-4 fixed left-0 top-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
             <KanbanSquare className="text-primary-foreground w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Kanban v1</h1>
      </div>

      <nav className="flex-1 space-y-2">
        <button
          onClick={() => setActiveTab("board")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
            activeTab === "board"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <KanbanSquare className="w-5 h-5" />
          Board
        </button>
        <button
          onClick={() => setActiveTab("dashboard")}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
            activeTab === "dashboard"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <LayoutDashboard className="w-5 h-5" />
          Dashboard
        </button>
      </nav>

      <div className="pt-4 border-t border-border space-y-2">
        <button
            onClick={onImportClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
            <Upload className="w-5 h-5" />
            Import Tasks
        </button>
      </div>
    </div>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
    // In a real app, this state might live in a context or router
    // accessing props just for demonstration of layout structure if needed,
    // but here we just render children which will contain the Sidebar logic if composed there.
    // However, to keep it simple, I'll export Sidebar separately and let App.tsx compose them.
    return (
        <div className="min-h-screen bg-background text-foreground pl-64">
            {children}
        </div>
    )
}

export default Sidebar;
