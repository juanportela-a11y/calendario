import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-2xl ${className}`}
    />
  );
};

export const CalendarSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={`head-${i}`} className="h-6 w-full" />
        ))}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`cell-${i}`} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
};

export const TickerSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-800/60 h-10 rounded-2xl animate-pulse flex items-center px-4 gap-3">
      <div className="w-20 h-4 bg-slate-300 dark:bg-slate-700 rounded-md" />
      <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700/60 rounded-md" />
    </div>
  );
};

export const DashboardCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );
};
