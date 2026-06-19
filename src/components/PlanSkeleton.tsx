import React from 'react';

const SkeletonCard: React.FC = () => (
    <div className="bg-[var(--color-surface-primary)]/50 rounded-lg p-4 border border-[var(--color-border)]">
        <div className="h-6 w-3/4 bg-[var(--color-surface-secondary)] rounded animate-pulse mb-4"></div>
        <div className="space-y-3">
            {[1, 2].map(day => (
                <div key={day}>
                    <div className="h-5 w-1/4 bg-[var(--color-surface-secondary)] rounded animate-pulse mb-2"></div>
                    <div className="space-y-2 ml-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0 w-4 h-4 rounded bg-[var(--color-surface-secondary)] animate-pulse"></div>
                            <div className="h-4 w-full bg-[var(--color-surface-secondary)] rounded animate-pulse"></div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0 w-4 h-4 rounded bg-[var(--color-surface-secondary)] animate-pulse"></div>
                            <div className="h-4 w-5/6 bg-[var(--color-surface-secondary)] rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const PlanSkeleton: React.FC = () => {
    return (
        <div className="space-y-4 mt-6">
            <div className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-4">
                <div className="h-7 w-1/2 bg-[var(--color-surface-secondary)] rounded animate-pulse mx-auto md:mx-0"></div>
                <div className="h-4 w-2/3 bg-[var(--color-surface-secondary)] rounded animate-pulse mt-2 mx-auto md:mx-0"></div>
            </div>
            <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
};

export default PlanSkeleton;