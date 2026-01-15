import { useState, useMemo } from "react";
import { Search, Save, X, Filter as FilterIcon, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Input, Button, Tag, Dropdown, Space, Badge, theme, Popover, Empty } from "antd";
import { useTaskStore } from "../store/useTaskStore";
import type { TaskCategory, TaskStatus, SavedFilter } from "../types";
import type { MenuProps } from 'antd';

const { CheckableTag } = Tag;

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
    const { token } = theme.useToken();

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
    };

    const toggleCategory = (cat: TaskCategory, checked: boolean) => {
        const current = activeFilter.categories || [];
        const newCats = checked
            ? [...current, cat]
            : current.filter(c => c !== cat);
        setActiveFilter({ ...activeFilter, categories: newCats.length ? newCats : undefined });
    };

    const toggleStatus = (status: TaskStatus, checked: boolean) => {
        const current = activeFilter.statuses || [];
        const newStatuses = checked
            ? [...current, status]
            : current.filter(s => s !== status);
        setActiveFilter({ ...activeFilter, statuses: newStatuses.length ? newStatuses : undefined });
    };

    const toggleSprint = (sprint: string, checked: boolean) => {
        const current = activeFilter.sprints || [];
        const newSprints = checked
            ? [...current, sprint]
            : current.filter(s => s !== sprint);
        setActiveFilter({ ...activeFilter, sprints: newSprints.length ? newSprints : undefined });
    };

    const toggleAssignee = (assignee: string, checked: boolean) => {
        const current = activeFilter.assignees || [];
        const newAssignees = checked
            ? [...current, assignee]
            : current.filter(a => a !== assignee);
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

    const savedFiltersMenu: MenuProps['items'] = savedFilters.length > 0 ? savedFilters.map(f => ({
        key: f.id,
        label: (
            <div className="flex justify-between items-center w-full min-w-[150px] group">
                <span onClick={() => loadFilter(f)} className="flex-1 cursor-pointer">{f.name}</span>
                <Button 
                    type="text" 
                    size="small" 
                    danger 
                    icon={<Trash2 className="w-3 h-3" />} 
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); deleteSavedFilter(f.id); }}
                />
            </div>
        )
    })) : [{ key: 'empty', label: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No saved filters" /> }];

    const saveContent = (
        <Space direction="vertical" className="w-60">
            <Input 
                placeholder="Filter Name" 
                value={filterName} 
                onChange={e => setFilterName(e.target.value)} 
                onPressEnter={handleSaveFilter}
            />
            <Button type="primary" block onClick={handleSaveFilter} disabled={!filterName.trim()}>Save current filter</Button>
            <div className="max-h-48 overflow-y-auto">
                 {/* Reusing saved filters display mainly for the visual list within popover if needed, but Dropdown handles selection better. Keeping save simple. */}
            </div>
        </Space>
    );

    return (
        <div className="bg-card border-b border-border p-4 flex flex-col gap-3 sticky top-0 z-30 shadow-sm" style={{ background: token.colorBgContainer }}>
            
            {/* Top Row: Search and Actions */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                    <Input
                        prefix={<Search className="w-4 h-4 text-muted-foreground mr-1" />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tasks..."
                        allowClear
                    />
                </div>

                <Badge count={activeFilterCount} color={token.colorPrimary}>
                    <Button 
                        icon={<FilterIcon className="w-4 h-4" />} 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        type={showAdvanced ? "primary" : "default"}
                        ghost={showAdvanced}
                    >
                        Filters {showAdvanced ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                    </Button>
                </Badge>
                
                {hasActiveFilters && (
                    <Button 
                        type="text" 
                        icon={<X className="w-4 h-4" />} 
                        onClick={clearFilters}
                        title="Clear All Filters"
                    >
                        Clear
                    </Button>
                )}

                <div className="ml-auto flex gap-2">
                    <Dropdown menu={{ items: savedFiltersMenu }} trigger={['click']} placement="bottomRight">
                        <Button icon={<Save className="w-4 h-4" />}>
                            Saved <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                    </Dropdown>
                    <Popover 
                        content={saveContent} 
                        title="Save Filter" 
                        trigger="click" 
                        open={isSaveOpen} 
                        onOpenChange={setIsSaveOpen}
                    >
                        <Button type="dashed" icon={<Save className="w-4 h-4" />} />
                    </Popover>
                </div>
            </div>

            {/* Advanced Filters (Collapsible) */}
            {showAdvanced && (
                <div className="space-y-3 pt-2 border-t border-border animate-in slide-in-from-top-2 duration-200">
                    
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold uppercase text-muted-foreground w-16">Category:</span>
                        <div className="flex flex-wrap gap-1">
                            {CATEGORIES.map(cat => (
                                <CheckableTag
                                    key={cat}
                                    checked={!!activeFilter.categories?.includes(cat)}
                                    onChange={(checked) => toggleCategory(cat, checked)}
                                    className="border border-transparent data-[checked=false]:border-border"
                                >
                                    {cat}
                                </CheckableTag>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold uppercase text-muted-foreground w-16">Status:</span>
                        <div className="flex flex-wrap gap-1">
                            {STATUSES.map(st => (
                                <CheckableTag
                                    key={st.id}
                                    checked={!!activeFilter.statuses?.includes(st.id)}
                                    onChange={(checked) => toggleStatus(st.id, checked)}
                                    className="border border-transparent data-[checked=false]:border-border"
                                >
                                    {st.label}
                                </CheckableTag>
                            ))}
                        </div>
                    </div>

                    {availableSprints.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold uppercase text-muted-foreground w-16">Sprint:</span>
                            <div className="flex flex-wrap gap-1">
                                {availableSprints.map(sprint => (
                                    <CheckableTag
                                        key={sprint}
                                        checked={!!activeFilter.sprints?.includes(sprint)}
                                        onChange={(checked) => toggleSprint(sprint, checked)}
                                        className="border border-transparent data-[checked=false]:border-border"
                                    >
                                        {sprint}
                                    </CheckableTag>
                                ))}
                            </div>
                        </div>
                    )}

                    {availableAssignees.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold uppercase text-muted-foreground w-16">Assignee:</span>
                            <div className="flex flex-wrap gap-1">
                                {availableAssignees.map(assignee => (
                                    <CheckableTag
                                        key={assignee}
                                        checked={!!activeFilter.assignees?.includes(assignee)}
                                        onChange={(checked) => toggleAssignee(assignee, checked)}
                                        className="border border-transparent data-[checked=false]:border-border"
                                    >
                                        {assignee}
                                    </CheckableTag>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}

        </div>
    );
};
