import React from 'react';

interface RoadmapProgressBarProps {
  progressPercentage: number;
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RoadmapProgressBar: React.FC<RoadmapProgressBarProps> = ({
  progressPercentage,
  height = 'md',
  showLabel = false,
}) => {
  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 select-none">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Progression</span>
          <span className="text-body-xs font-black text-foreground">{progressPercentage}%</span>
        </div>
      )}
      <div className={`w-full bg-muted/60 border border-border/40 rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
};
