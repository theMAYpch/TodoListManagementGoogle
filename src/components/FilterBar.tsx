import { useState, useMemo } from "react";
import { Search, Save, X, Filter, Check as CheckIcon, ChevronDown, ChevronUp } from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";
import type { TaskCategory, TaskStatus, SavedFilter } from "../types";
import { cn } from "../utils/cn";

const CATEGORIES: TaskCategory[] = ["Feature", "Bug", "Doc", "Meeting", "Other"];
const STATUSES: { id: TaskStatus; label: string }[] = [
    { id: "todo", label: "To Do" },
    { id: "doing", label: "In Progress" },
    { id: "review", label: "Review" },
    { id: "done", label: "Done" }
];

export const FilterBar = () => {
    const { 
        searchQuery, 
        setSearchQuery, 
        activeFilter, 
        setActiveFilter, 
        savedFilters, 
        saveFilter, 
        deleteSavedFilter,
        tasks
    } = useTaskStore();

    const [isSaveOpen, setIsSaveOpen] = useState(false);
    const [filterName, setFilterName] = useState("");
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showSavedDropdown, setShowSavedDropdown] = useState(false);

    // Derive unique sprints and assignees from tasks
    const availableSprints = useMemo(() => 
        Array.from(new Set(tasks.map(t => t.sprint).filter(Boolean))).sort(),
        [tasks]
    );

    const availableAssignees = useMemo(() => 
        Array.from(new Set(tasks.flatMap(t => t.assignees))).sort(),
        [tasks]
    );

    const handleSaveFilter = () => {
        if (!filterName.trim()) return;
        const criteriaToSave = {
            ...activeFilter,
            search: searchQuery || undefined
        };
        saveFilter(filterName, criteriaToSave);
        setFilterName("");
        setIsSaveOpen(false);
    };

    const loadFilter = (filter: SavedFilter) => {
        setActiveFilter(filter.criteria);
        setSearchQuery(filter.criteria.search || "");
        setShowSavedDropdown(false);
    };

    const toggleCategory = (cat: TaskCategory) => {
        const current = activeFilter.categories || [];
        const newCats = current.includes(cat) 
            ? current.filter(c => c !== cat) 
            : [...current, cat];
        setActiveFilter({ ...activeFilter, categories: newCats.length ? newCats : undefined });
    };

    const toggleStatus = (status: TaskStatus) => {
        const current = activeFilter.statuses || [];
        const newStatuses = current.includes(status)
            ? current.filter(s => s !== status)
            : [...current, status];
        setActiveFilter({ ...activeFilter, statuses: newStatuses.length ? newStatuses : undefined });
    };

    const toggleSprint = (sprint: string) => {
        const current = activeFilter.sprints || [];
        const newSprints = current.includes(sprint)
            ? current.filter(s => s !== sprint)
            : [...current, sprint];
        setActiveFilter({ ...activeFilter, sprints: newSprints.length ? newSprints : undefined });
    };

    const toggleAssignee = (assignee: string) => {
        const current = activeFilter.assignees || [];
        const newAssignees = current.includes(assignee)
            ? current.filter(a => a !== assignee)
            : [...current, assignee];
        setActiveFilter({ ...activeFilter, assignees: newAssignees.length ? newAssignees : undefined });
    };

    const clearFilters = () => {
        setActiveFilter({});
        setSearchQuery("");
    };

    const hasActiveFilters = searchQuery || Object.keys(activeFilter).length > 0;
    const activeFilterCount = (activeFilter.categories?.length || 0) + 
                              (activeFilter.statuses?.length || 0) + 
                              (activeFilter.sprints?.length || 0) + 
                              (activeFilter.assignees?.length || 0);

    return (
        <div className="bg-card border-b border-border p-4 flex flex-col gap-3 sticky top-0 z-30 shadow-sm">
            
            {/* Top Row: Search and Actions */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        className="w-full bg-secondary/30 border border-input rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                </div>

                {/* Filter Toggle Button */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors",
                        activeFilterCount > 0
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-secondary/30 border-input hover:bg-secondary/50"
                    )}
                >
                    <Filter className="w-4 h-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs font-bold">
                            {activeFilterCount}
                        </span>
                    )}
                    {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                
                {hasActiveFilters && (
                    <button 
                        onClick={clearFilters}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        title="Clear All Filters"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {/* Save/Load Filters */}
                <div className="relative ml-auto">
                   <button 
                        onClick={() => setShowSavedDropdown(!showSavedDropdown)}
                        className="flex items-center gap-2 px-3 py-2 bg-secondary/30 border border-input rounded-lg text-sm font-medium hover:bg-secondary/50 transition-colors"
                   >
                        <Save className="w-4 h-4" />
                        Saved
                   </button>
                   {showSavedDropdown && (
                       <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg p-1 z-10 animate-in fade-in zoom-in-50 duration-200">
                            {savedFilters.length === 0 ? (
                                <p className="p-3 text-xs text-muted-foreground text-center">No saved filters</p>
                            ) : (
                                savedFilters.map(f => (
                                    <div key={f.id} className="flex items-center justify-between p-2 hover:bg-muted rounded-lg group/item">
                                        <button 
                                            onClick={() => loadFilter(f)} 
                                            className="text-sm font-medium text-start flex-1"
                                        >
                                            {f.name}
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteSavedFilter(f.id); }}
                                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover/item:opacity-100 p-1"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))
                            )}
                            <div className="border-t border-border mt-1 pt-1 p-1">
                                 {!isSaveOpen ? (
                                    <button 
                                        onClick={() => setIsSaveOpen(true)}
                                        className="w-full flex items-center justify-center gap-2 p-2 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg"
                                    >
                                        <Save className="w-3 h-3" /> Save Current
                                    </button>
                                 ) : (
                                    <div className="flex items-center gap-1">
                                        <input 
                                            type="text" 
                                            className="flex-1 bg-secondary border border-input rounded p-1 text-xs" 
                                            placeholder="Name"
                                            value={filterName}
                                            onChange={(e) => setFilterName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveFilter()}
                                            autoFocus
                                        />
                                        <button onClick={handleSaveFilter} className="p-1 bg-primary text-primary-foreground rounded">
                                            <CheckIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                 )}
                            </div>
                       </div>
                   )}
                </div>
            </div>

            {/* Advanced Filters (Collapsible) */}
            {showAdvanced && (
                <div className="space-y-3 pt-2 border-t border-border animate-in slide-in-from-top-2 duration-200">
                    
                    {/* Category */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-muted-foreground uppercase min-w-[70px]">Category:</span>
                        <div className="flex items-center gap-1 flex-wrap">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => toggleCategory(cat)}
                                    className={cn(
                                        "px-2 py-1 rounded text-xs font-medium transition-colors border",
                                        activeFilter.categories?.includes(cat)
                                            ? "bg-primary/10 border-primary text-primary"
                                            : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-muted-foreground uppercase min-w-[70px]">Status:</span>
                        <div className="flex items-center gap-1 flex-wrap">
                            {STATUSES.map(st => (
                                <button
                                    key={st.id}
                                    onClick={() => toggleStatus(st.id)}
                                    className={cn(
                                        "px-2 py-1 rounded text-xs font-medium transition-colors border",
                                        activeFilter.statuses?.includes(st.id)
                                            ? "bg-primary/10 border-primary text-primary"
                                            : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                                    )}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sprint */}
                    {availableSprints.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-muted-foreground uppercase min-w-[70px]">Sprint:</span>
                            <div className="flex items-center gap-1 flex-wrap">
                                {availableSprints.map(sprint => (
                                    <button
                                        key={sprint}
                                        onClick={() => toggleSprint(sprint)}
                                        className={cn(
                                            "px-2 py-1 rounded text-xs font-medium transition-colors border",
                                            activeFilter.sprints?.includes(sprint)
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        {sprint}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assignee */}
                    {availableAssignees.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-muted-foreground uppercase min-w-[70px]">Assignee:</span>
                            <div className="flex items-center gap-1 flex-wrap">
                                {availableAssignees.map(assignee => (
                                    <button
                                        key={assignee}
                                        onClick={() => toggleAssignee(assignee)}
                                        className={cn(
                                            "px-2 py-1 rounded text-xs font-medium transition-colors border",
                                            activeFilter.assignees?.includes(assignee)
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-transparent border-border text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        {assignee}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}

        </div>
    );
}
