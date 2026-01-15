import { useState } from "react";
import { Plus, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { useTaskStore } from "../store/useTaskStore";
import { WidgetCard } from "./WidgetCard";
import { calculateWidgetStats } from "../utils/widgetUtils";
import { v4 as uuidv4 } from "uuid";
import type { WidgetType } from "../types";
import { cn } from "../utils/cn";
import { Segmented } from "antd";

type WidgetTypeOption = {
    type: WidgetType;
    label: string;
    description: string;
    icon: React.ReactNode;
};

const WIDGET_TYPES: WidgetTypeOption[] = [
    {
        type: "stats",
        label: "Stats Card",
        description: "Overview with completion stats and category breakdown",
        icon: <PieChart className="w-5 h-5" />
    },
    {
        type: "line",
        label: "Trend Chart",
        description: "Completion trend over time",
        icon: <TrendingUp className="w-5 h-5" />
    },
    {
        type: "gauge",
        label: "Completion Gauge",
        description: "Project completion percentage",
        icon: <TrendingUp className="w-5 h-5" />
    },
    {
        type: "overdue",
        label: "Overdue Tasks",
        description: "List of tasks past due date",
        icon: <TrendingUp className="w-5 h-5" />
    }
];

export const DashboardWidgets = () => {
    const { tasks, widgets, savedFilters, epics, addWidget, removeWidget } = useTaskStore();
    const [isAddingWidget, setIsAddingWidget] = useState(false);
    const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | null>(null);
    const [sourceTab, setSourceTab] = useState<'filter' | 'epic'>('filter');

    const handleSelectType = (type: WidgetType) => {
        setSelectedWidgetType(type);
    };

    const handleAddWidget = (sourceId: string, type: 'filter' | 'epic') => {
        if (!selectedWidgetType) return;
        
        let title = "";
        let filterId: string | undefined;
        let epicId: string | undefined;

        if (type === 'filter') {
            const filter = savedFilters.find(f => f.id === sourceId);
            if (!filter) return;
            title = filter.name;
            filterId = filter.id;
        } else {
            const epic = epics.find(e => e.id === sourceId);
            if (!epic) return;
            title = epic.title;
            epicId = epic.id;
        }

        addWidget({
            id: uuidv4(),
            type: selectedWidgetType,
            title,
            filterId,
            epicId
        });
        setIsAddingWidget(false);
        setSelectedWidgetType(null);
    };

    const handleCancel = () => {
        setIsAddingWidget(false);
        setSelectedWidgetType(null);
    };

    return (
        <div className="space-y-6">
            {/* Add Widget Button */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Widgets</h2>
                <button
                    onClick={() => setIsAddingWidget(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Widget
                </button>
            </div>

            {/* Widget Creation Modal */}
            {isAddingWidget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-2xl rounded-xl shadow-2xl border border-border flex flex-col max-h-[80vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-bold">
                                {selectedWidgetType ? "Select Data Source" : "Select Widget Type"}
                            </h2>
                            <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground">
                                <Plus className="w-5 h-5 rotate-45" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {!selectedWidgetType ? (
                                /* Step 1: Select Widget Type */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {WIDGET_TYPES.map(widgetType => (
                                        <button
                                            key={widgetType.type}
                                            onClick={() => handleSelectType(widgetType.type)}
                                            className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-primary/10 text-primary rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                    {widgetType.icon}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg mb-1">{widgetType.label}</h3>
                                                    <p className="text-sm text-muted-foreground">{widgetType.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                /* Step 2: Select Data Source (Saved Filter) */
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                            {WIDGET_TYPES.find(w => w.type === selectedWidgetType)?.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Selected Type:</p>
                                            <p className="font-semibold">
                                                {WIDGET_TYPES.find(w => w.type === selectedWidgetType)?.label}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedWidgetType(null)}
                                            className="ml-auto text-xs text-primary hover:underline"
                                        >
                                            Change
                                        </button>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold">Choose data source:</h3>
                                            <div className="w-48">
                                                <Segmented 
                                                    block
                                                    value={sourceTab}
                                                    onChange={(v) => setSourceTab(v as 'filter' | 'epic')}
                                                    options={[
                                                        { label: 'Filters', value: 'filter' },
                                                        { label: 'Epics', value: 'epic' }
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                        
                                        {sourceTab === 'filter' ? (
                                            savedFilters.length === 0 ? (
                                                <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
                                                    <p className="text-muted-foreground mb-2">No saved filters</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Create a filter from the Board view first
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                                                    {savedFilters.map(filter => {
                                                        const alreadyAdded = widgets.some(
                                                            w => w.filterId === filter.id && w.type === selectedWidgetType
                                                        );
                                                        return (
                                                            <button
                                                                key={filter.id}
                                                                onClick={() => !alreadyAdded && handleAddWidget(filter.id, 'filter')}
                                                                disabled={alreadyAdded}
                                                                className={cn(
                                                                    "p-4 border rounded-lg text-left transition-colors",
                                                                    alreadyAdded
                                                                        ? "border-border bg-muted/50 cursor-not-allowed opacity-50"
                                                                        : "border-border hover:border-primary hover:bg-primary/5"
                                                                )}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-medium">{filter.name}</span>
                                                                    {alreadyAdded && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Already added
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )
                                        ) : (
                                            epics.length === 0 ? (
                                                <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
                                                    <p className="text-muted-foreground mb-2">No epics found</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Create epics to track larger projects
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                                                    {epics.map(epic => {
                                                        const alreadyAdded = widgets.some(
                                                            w => w.epicId === epic.id && w.type === selectedWidgetType
                                                        );
                                                        return (
                                                            <button
                                                                key={epic.id}
                                                                onClick={() => !alreadyAdded && handleAddWidget(epic.id, 'epic')}
                                                                disabled={alreadyAdded}
                                                                className={cn(
                                                                    "p-4 border rounded-lg text-left transition-colors",
                                                                    alreadyAdded
                                                                        ? "border-border bg-muted/50 cursor-not-allowed opacity-50"
                                                                        : "border-border hover:border-primary hover:bg-primary/5"
                                                                )}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: epic.color }} />
                                                                        <span className="font-medium">{epic.title}</span>
                                                                    </div>
                                                                    {alreadyAdded && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            Already added
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Widgets Grid */}
            {widgets.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                    <p className="text-muted-foreground mb-2">No widgets yet</p>
                    <p className="text-sm text-muted-foreground">
                        Add widgets based on your saved filters to track progress
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {widgets.map(widget => {
                        let criteria;
                        
                        if (widget.filterId) {
                            const filter = savedFilters.find(f => f.id === widget.filterId);
                            if (filter) criteria = filter.criteria;
                        } else if (widget.epicId) {
                            const epic = epics.find(e => e.id === widget.epicId);
                            if (epic) criteria = { epics: [epic.id] };
                        }

                        if (!criteria) return null;

                        const stats = calculateWidgetStats(tasks, criteria);

                        return (
                            <WidgetCard
                                key={widget.id}
                                widget={widget}
                                stats={stats}
                                onRemove={removeWidget}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};
