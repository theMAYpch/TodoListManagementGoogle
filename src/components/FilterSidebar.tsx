import { useState } from "react";
import { Trash2, Filter, LayoutDashboard, ChevronRight, ChevronLeft } from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";
import { cn } from "../utils/cn";
import type { SavedFilter } from "../types";

export const FilterSidebar = () => {
    const { savedFilters, activeFilter, setActiveFilter, deleteSavedFilter, setSearchQuery } = useTaskStore();
    const [isOpen, setIsOpen] = useState(true);

    const handleLoadFilter = (filter: SavedFilter) => {
        setActiveFilter(filter.criteria);
        setSearchQuery(filter.criteria.search || "");
    };

    return (
        <div 
            className={cn(
                "h-full border-r border-border bg-card/50 flex flex-col transition-all duration-300 relative",
                isOpen ? "w-64" : "w-16"
            )}
        >
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -right-3 top-6 bg-card border border-border rounded-full p-1 hover:bg-muted transition-colors shadow-sm z-10"
            >
                {isOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </button>

            <div className="p-4 flex items-center gap-3 border-b border-border/50">
                <LayoutDashboard className="w-5 h-5 text-primary" />
                {isOpen && <h2 className="font-semibold text-sm">Datasets</h2>}
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                 {/* All Tasks (Reset) */}
                 <button
                    onClick={() => setActiveFilter({})}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                         Object.keys(activeFilter).length === 0 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Filter className="w-4 h-4" />
                    {isOpen && <span>All Tasks</span>}
                </button>
                
                {isOpen && <div className="px-3 pt-4 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Saved Filters</div>}

                {savedFilters.map(filter => {
                    // Check if this filter is roughly active (simplified check)
                    const isActive = JSON.stringify(activeFilter) === JSON.stringify(filter.criteria);
                    
                    return (
                        <div key={filter.id} className="group relative">
                            <button
                                onClick={() => handleLoadFilter(filter)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium" 
                                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <div className="w-4 h-4 flex items-center justify-center">
                                    <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                                </div>
                                {isOpen && <span className="truncate">{filter.name}</span>}
                            </button>
                            {isOpen && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("Delete filter?")) deleteSavedFilter(filter.id);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-all"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    );
                })}

                {savedFilters.length === 0 && isOpen && (
                    <div className="p-4 text-xs text-muted-foreground text-center italic border border-dashed border-border rounded-lg mx-2">
                        No saved filters. <br/>Use the top bar to save one.
                    </div>
                )}
            </div>
        </div>
    );
};
