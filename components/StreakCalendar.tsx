import React, { useState } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface StreakCalendarProps {
  completionDates: string[]; // Expects YYYY-MM-DD format
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ completionDates }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const completionSet = new Set(completionDates);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon...
  // Adjust so Monday is 0 for grid calculation
  const startDayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today's date for accurate comparison

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div>
      {/* Header with Month/Year and Nav Buttons */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] transition rounded-full hover:bg-[var(--color-surface-secondary)]"
          aria-label="Previous month"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          {currentDate.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-text)] transition rounded-full hover:bg-[var(--color-surface-secondary)]"
          aria-label="Next month"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Grid for days */}
      <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
        {/* Day of week headers */}
        {daysOfWeek.map(day => (
          <div key={day} className="font-semibold text-[var(--color-text-secondary)] text-xs">
            {day}
          </div>
        ))}
        
        {/* Empty cells for month start offset */}
        {Array.from({ length: startDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        
        {/* Actual days of the month */}
        {days.map(day => {
          const date = new Date(year, month, day);
          date.setHours(0, 0, 0, 0); // Normalize for comparison
          
          const dateString = new Date(year, month, day).toISOString().split('T')[0];
          const isCompleted = completionSet.has(dateString);
          const isToday = date.getTime() === today.getTime();
          const isPast = date < today;

          let dayClasses = "w-9 h-9 mx-auto flex items-center justify-center rounded-full transition-colors";

          if (isCompleted) {
            dayClasses += ' bg-[var(--color-accent-bg)] text-[var(--color-text-on-accent)] font-bold';
          } else if (isToday) {
            dayClasses += ' bg-[var(--color-accent-bg)]/20 text-[var(--color-accent-text)] font-bold';
          } else if (isPast) {
            dayClasses += ' text-[var(--color-text-secondary)] opacity-50';
          } else {
            dayClasses += ' text-[var(--color-text-primary)] hover:bg-[var(--color-surface-secondary)]';
          }

          return (
            <div key={day} className={dayClasses}>
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StreakCalendar;