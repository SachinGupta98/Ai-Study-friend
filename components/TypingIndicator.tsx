import React from 'react';

const TypingIndicator: React.FC = () => (
    <div className="flex justify-start">
        <div className="bg-[var(--color-surface-secondary)] rounded-lg p-3 max-w-lg flex items-center gap-1.5">
            <div className="w-2 h-2 bg-[var(--color-text-secondary)] rounded-full pulse-1"></div>
            <div className="w-2 h-2 bg-[var(--color-text-secondary)] rounded-full pulse-2"></div>
            <div className="w-2 h-2 bg-[var(--color-text-secondary)] rounded-full pulse-3"></div>
        </div>
    </div>
);

export default TypingIndicator;