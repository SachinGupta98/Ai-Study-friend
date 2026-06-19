import React, { useMemo } from 'react';

interface ActivityHeatmapProps {
    completionDates: string[]; // YYYY-MM-DD
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ completionDates }) => {
    const heatmapData = useMemo(() => {
        const today = new Date();
        // 52 weeks * 7 days = 364 days + today = 365
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 364);
        startDate.setHours(0, 0, 0, 0);

        const dateSet = new Set(completionDates);
        const grid: { date: Date; intensity: number }[] = [];

        for (let i = 0; i <= 364; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];

            grid.push({
                date: d,
                intensity: dateSet.has(dateStr) ? 1 : 0 // Future extension: count tasks per day to make it 2, 3, 4 etc.
            });
        }

        return grid;
    }, [completionDates]);

    // Group by weeks for CSS grid column rendering
    type HeatmapDay = { date: Date; intensity: number } | null;
    const weeks: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    // Pad the first week so Sunday aligns properly if needed (standard github style starts on Sunday)
    const firstDayOfWeek = heatmapData[0].date.getDay(); // 0 is Sunday
    for (let i = 0; i < firstDayOfWeek; i++) {
        currentWeek.push(null);
    }

    heatmapData.forEach(day => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
    }

    const getIntensityColor = (intensity: number) => {
        if (intensity === 0) return 'bg-[var(--color-surface-secondary)] opacity-50';
        if (intensity === 1) return 'bg-[var(--color-accent-bg)] shadow-[0_0_8px_var(--color-accent-shadow)]';
        return 'bg-[var(--color-accent-bg)]';
    };

    // Calculate month labels dynamically based on the weeks generated
    const monthLabels: { month: string; colIndex: number }[] = [];
    weeks.forEach((week, i) => {
        const firstValidDay = week.find(d => d !== null);
        if (firstValidDay && firstValidDay.date.getDate() <= 7) {
            // If it's the first week of a month, add a label
            const monthStr = firstValidDay.date.toLocaleString('default', { month: 'short' });
            if (!monthLabels.find(m => m.month === monthStr)) {
                monthLabels.push({ month: monthStr, colIndex: i });
            }
        }
    });

    return (
        <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Activity Heatmap</h3>
                <span className="text-sm font-medium text-[var(--color-text-secondary)]">{completionDates.length} Study Days</span>
            </div>

            <div className="overflow-x-auto custom-scrollbar pb-2">
                <div className="min-w-max relative">
                    {/* Month Labels - Positioned absolutely based on column index */}
                    <div className="flex text-xs text-[var(--color-text-secondary)] mb-2 ml-6 relative h-4">
                        {monthLabels.map((m, i) => (
                            <span
                                key={i}
                                className="absolute"
                                style={{ left: `${m.colIndex * (14 + 6)}px` }} // 14px width + 6px gap = 20px per week column
                            >
                                {m.month}
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-1.5">
                        {/* Day Labels */}
                        <div className="flex flex-col gap-1.5 text-[0.6rem] text-[var(--color-text-secondary)] font-medium pr-1 pt-1 justify-between h-[106px]">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                        </div>

                        {/* The 52-week grid */}
                        <div className="flex gap-1.5">
                            {weeks.map((week, wIndex) => (
                                <div key={wIndex} className="flex flex-col gap-1.5">
                                    {week.map((day, dIndex) => {
                                        if (!day) return <div key={`empty-${dIndex}`} className="w-3.5 h-3.5 rounded-sm"></div>;

                                        return (
                                            <div
                                                key={dIndex}
                                                title={`${day.intensity > 0 ? 'Studied on' : 'No activity on'} ${day.date.toLocaleDateString()}`}
                                                className={`w-3.5 h-3.5 rounded-sm transition-all hover:ring-2 hover:ring-[var(--color-text-primary)] cursor-pointer ${getIntensityColor(day.intensity)}`}
                                            ></div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
