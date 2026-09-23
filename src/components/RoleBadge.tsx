import React from 'react';
import { Role } from '../types';

interface RoleBadgeProps {
  role?: Role;
  roleName?: string;
  size?: 'sm' | 'md';
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, roleName, size = 'sm' }) => {
  const name = role?.name || roleName || 'General Volunteer';
  const colorKey = role?.color || 'slate';
  const colors = COLOR_MAP[colorKey] || COLOR_MAP.slate;

  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-sm font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-md border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses}`}
    >
      {name}
    </span>
  );
};
