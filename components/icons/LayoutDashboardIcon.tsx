import React from 'react';

export const LayoutDashboardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 1.085m-1.085-1.085a2.25 2.25 0 0 0-3.182 0l-1.085 1.085m0 0v-2.25m0 2.25a2.25 2.25 0 0 0 3.182 0l1.085-1.085m-1.085-1.085-1-1.085m0 0a2.25 2.25 0 0 0-3.182 0l-1.085 1.085m7.5 0v2.25"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12.75h18"
    />
  </svg>
);