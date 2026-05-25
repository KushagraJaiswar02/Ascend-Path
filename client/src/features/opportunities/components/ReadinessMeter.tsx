import React from 'react';

interface ReadinessMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ReadinessMeter: React.FC<ReadinessMeterProps> = ({ score, size = 'md' }) => {
  // Determine color theme based on score threshold
  const getColorClasses = (val: number) => {
    if (val >= 80) return { text: 'text-success', bg: 'bg-success/10', border: 'border-success/20', fill: 'stroke-success' };
    if (val >= 50) return { text: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20', fill: 'stroke-warning' };
    return { text: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', fill: 'stroke-destructive' };
  };

  const colors = getColorClasses(score);

  if (size === 'sm') {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold leading-none select-none ${colors.text} ${colors.bg} border ${colors.border}`}>
        <span>{score}% Ready</span>
      </div>
    );
  }

  // Radial Ring dimensions
  const radius = size === 'lg' ? 45 : 30;
  const strokeWidth = size === 'lg' ? 7 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          className={`transform -rotate-90 ${size === 'lg' ? 'w-24 h-24' : 'w-16 h-16'}`}
          viewBox={`0 0 ${radius * 2 + strokeWidth * 2} ${radius * 2 + strokeWidth * 2}`}
        >
          {/* Background circle */}
          <circle
            className="stroke-muted/30"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
          />
          {/* Progress circle */}
          <circle
            className={`transition-all duration-700 ease-out ${colors.fill}`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={radius}
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
          />
        </svg>
        <span className={`absolute font-extrabold tracking-tight ${size === 'lg' ? 'text-xl' : 'text-xs'} text-foreground`}>
          {score}%
        </span>
      </div>
      <div>
        <h5 className="text-[11px] font-extrabold uppercase text-muted-foreground tracking-widest leading-none">
          Readiness
        </h5>
        <p className={`text-body-xs font-bold leading-snug ${colors.text} mt-0.5`}>
          {score >= 80 ? 'Highly Ready' : score >= 50 ? 'Developing' : 'Needs Preparation'}
        </p>
      </div>
    </div>
  );
};
