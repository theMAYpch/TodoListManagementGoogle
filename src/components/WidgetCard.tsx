import { Trash2 } from "lucide-react";
import ReactECharts from "echarts-for-react";
import type { DashboardWidget } from "../types";
import type { WidgetStats } from "../utils/widgetUtils";
import { cn } from "../utils/cn";

type WidgetCardProps = {
    widget: DashboardWidget;
    stats: WidgetStats;
    onRemove: (id: string) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
    Feature: "#3b82f6",
    Bug: "#ef4444",
    Doc: "#eab308",
    Meeting: "#a855f7",
    Other: "#6b7280",
};

export const WidgetCard = ({ widget, stats, onRemove }: WidgetCardProps) => {
    
    // Pie Chart (Category Breakdown)
    const pieChartOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: { color: '#888' }
        },
        series: [
            {
                name: 'Tasks by Category',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: { show: false, position: 'center' },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: 'bold'
                    }
                },
                labelLine: { show: false },
                data: stats.categoryBreakdown.map(cat => ({
                    value: cat.total,
                    name: cat.category,
                    itemStyle: {
                        color: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other
                    }
                }))
            }
        ]
    };

    // Bar Chart (Category Distribution)
    const barChartOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: stats.categoryBreakdown.map(c => c.category),
            axisLabel: { color: '#888' }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#888' }
        },
        series: [
            {
                name: 'Total',
                type: 'bar',
                data: stats.categoryBreakdown.map(c => ({
                    value: c.total,
                    itemStyle: {
                        color: CATEGORY_COLORS[c.category] || CATEGORY_COLORS.Other
                    }
                })),
                barWidth: '60%'
            },
            {
                name: 'Completed',
                type: 'bar',
                data: stats.categoryBreakdown.map(c => ({
                    value: c.completed,
                    itemStyle: {
                        color: CATEGORY_COLORS[c.category] || CATEGORY_COLORS.Other,
                        opacity: 0.6
                    }
                })),
                barWidth: '60%'
            }
        ]
    };

    // Line Chart (Trend - simplified, showing completion percentage)
    const lineChartOption = {
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: stats.categoryBreakdown.map(c => c.category),
            axisLabel: { color: '#888' }
        },
        yAxis: {
            type: 'value',
            max: 100,
            axisLabel: {
                formatter: '{value}%',
                color: '#888'
            }
        },
        series: [
            {
                name: 'Completion %',
                type: 'line',
                data: stats.categoryBreakdown.map(c => c.percentage),
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: '#3b82f6'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
                        ]
                    }
                }
            }
        ]
    };

    const renderChart = () => {
        switch (widget.type) {
            case 'bar':
                return <ReactECharts option={barChartOption} style={{ height: '250px' }} />;
            case 'line':
                return <ReactECharts option={lineChartOption} style={{ height: '250px' }} />;
            case 'pie':
                return <ReactECharts option={pieChartOption} style={{ height: '250px' }} />;
            case 'stats':
            default:
                return (
                    <>
                        <ReactECharts option={pieChartOption} style={{ height: '200px' }} />
                        {/* Category Stats Table */}
                        <div className="mt-4 space-y-2">
                            {stats.categoryBreakdown.map(cat => (
                                <div key={cat.category} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full" 
                                            style={{ backgroundColor: CATEGORY_COLORS[cat.category] }}
                                        />
                                        <span className="font-medium">{cat.category}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <span>{cat.completed}/{cat.total}</span>
                                        <span className={cn(
                                            "font-semibold",
                                            cat.percentage === 100 ? "text-green-600" : "text-foreground"
                                        )}>
                                            {cat.percentage}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-lg">{widget.title}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                        {widget.type === 'stats' && 'Stats Overview'}
                        {widget.type === 'bar' && 'Bar Chart'}
                        {widget.type === 'line' && 'Trend Analysis'}
                        {widget.type === 'pie' && 'Pie Chart'}
                    </p>
                </div>
                <button
                    onClick={() => onRemove(widget.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{stats.totalTasks}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Done</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{stats.completionPercentage}%</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Progress</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500"
                        style={{ width: `${stats.completionPercentage}%` }}
                    />
                </div>
            </div>

            {/* Chart/Visualization */}
            {stats.categoryBreakdown.length > 0 ? (
                <div>
                    {widget.type === 'stats' && (
                        <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                            Category Breakdown
                        </h4>
                    )}
                    {renderChart()}
                </div>
            ) : (
                <div className="text-center py-8 text-muted-foreground text-sm italic">
                    No tasks match this filter
                </div>
            )}
        </div>
    );
};
