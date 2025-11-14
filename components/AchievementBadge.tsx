
import React from 'react';

interface AchievementBadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  unlocked: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ icon, title, description, unlocked }) => {
  const containerClasses = `
    flex flex-col items-center justify-start text-center p-4 border rounded-lg transition-all duration-300
    ${unlocked ? 'bg-[var(--color-surface-primary)] border-[var(--color-border)] transform hover:scale-105 hover:border-[var(--color-accent-text)]' : 'bg-[var(--color-surface-secondary)] border-transparent opacity-60'}
  `;

  const iconContainerClasses = `
    w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors duration-300
    ${unlocked ? 'bg-[var(--color-accent-bg)]/10 text-[var(--color-accent-text)]' : 'bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]'}
  `;

  return (
    <div className={containerClasses} title={unlocked ? description : `LOCKED: ${description}`}>
      <div className={iconContainerClasses}>
        {icon}
      </div>
      <h4 className={`font-semibold text-sm ${unlocked ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
        {title}
      </h4>
      {unlocked && (
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{description}</p>
      )}
    </div>
  );
};

export default AchievementBadge;