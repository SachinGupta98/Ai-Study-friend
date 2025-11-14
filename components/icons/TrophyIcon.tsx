
import React from 'react';

export const TrophyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 1 9 0Zm0 0c1.813 0 3.375-1.125 4.125-2.625M16.5 18.75c-1.813 0-3.375-1.125-4.125-2.625M12 15.75h.008v.008H12v-.008Zm0 0c.334 0 .66.023.984.068M12 15.75c-.334 0-.66.023-.984.068M12 15.75v-1.5a2.625 2.625 0 0 1 5.25 0v1.5m-5.25 0v-1.5a2.625 2.625 0 0 0-5.25 0v1.5m10.5-11.25a2.25 2.25 0 0 0-2.25-2.25h-3.875a2.25 2.25 0 0 0-2.25 2.25v2.25h8.375v-2.25Z" />
  </svg>
);