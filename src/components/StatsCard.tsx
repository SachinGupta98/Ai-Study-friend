import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[var(--color-surface-primary)] border border-[var(--color-border)] rounded-lg p-4 text-center cursor-default shadow-sm hover:shadow-md hover:border-[var(--color-accent-text)]/50 transition-colors"
    >
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
      <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
    </motion.div>
  );
};

export default StatsCard;