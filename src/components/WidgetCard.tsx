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
    Planning: "#3b82f6",     // Blue
    Documentation: "#a855f7", // Purple
    Support: "#ef4444",      // Red
    Meetings: "#f59e0b",     // Amber
    Management: "#22c55e",   // Green (swapped for variety)
    Others: "#6b7280",       // Gray
};

export const WidgetCard = ({ widget, stats, onRemove }: WidgetCardProps) => {
    
    // Pie Chart Option (Used for Stats Card internal chart)
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

    // Line Chart (Trend)
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

    // Gauge Chart
    const gaugeChartOption = {
        series: [{
            type: 'gauge',
            progress: { show: true, width: 18 },
            axisLine: { lineStyle: { width: 18 } },
            axisTick: { show: false },
            splitLine: { length: 15, lineStyle: { width: 2, color: '#999' } },
            axisLabel: { distance: 25, color: '#999', fontSize: 14 },
            anchor: { show: true, showAbove: true, size: 25, itemStyle: { borderWidth: 10 } },
            pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 20, offsetCenter: [0, '-60%'], itemStyle: { color: 'auto' } },
            title: { show: false },
            detail: { valueAnimation: true, fontSize: 40, offsetCenter: [0, '70%'], formatter: '{value}%' },
            data: [{ value: stats.completionPercentage }]
        }]
    };

    const renderChart = () => {
        switch (widget.type) {
            case 'line': return <ReactECharts option={lineChartOption} style={{ height: '250px' }} />;
            case 'gauge': return <ReactECharts option={gaugeChartOption} style={{ height: '300px' }} />;
            case 'overdue': return (
                <div className="h-[250px] overflow-y-auto pr-2">
                    {stats.overdueTasks?.length === 0 ? (
                            <div className="text-center text-muted-foreground p-8">No overdue tasks 🎉</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0">
                                <tr><th className="px-3 py-2">Task</th><th className="px-3 py-2">Due Date</th></tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {stats.overdueTasks?.map(task => (
                                    <tr key={task.id} className="hover:bg-muted/30">
                                        <td className="px-3 py-2 font-medium truncate max-w-[150px]">{task.title}</td>
                                        <td className="px-3 py-2 text-destructive font-bold">{task.dueDate.split('T')[0]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            );
            case 'stats':
            default:
                return (
                    <>
                        <ReactECharts option={pieChartOption} style={{ height: '200px' }} />
                        <div className="mt-4 space-y-2">
                            {stats.categoryBreakdown.map(cat => (
                                <div key={cat.category} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.category] }} />
                                        <span className="font-medium">{cat.category}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                        <span>{cat.completed}/{cat.total}</span>
                                        <span className={cn("font-semibold", cat.percentage === 100 ? "text-green-600" : "text-foreground")}>{cat.percentage}%</span>
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
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-lg">{widget.title}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                        {widget.type === 'stats' && 'Stats Overview'}
                        {widget.type === 'line' && 'Trend Analysis'}
                        {widget.type === 'gauge' && 'Completion Gauge'}
                        {widget.type === 'overdue' && 'Overdue Tasks'}
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
