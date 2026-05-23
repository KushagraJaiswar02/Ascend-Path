import React from 'react';
import { Check, Loader2 } from 'lucide-react';

interface StepCompletionToggleProps {
  isCompleted: boolean;
  isLoading: boolean;
  onToggle: () => void;
  isOptional?: boolean;
}

export const StepCompletionToggle: React.FC<StepCompletionToggleProps> = ({
  isCompleted,
  isLoading,
  onToggle,
  isOptional = false,
}) => {
  return (
    <button
      disabled={isLoading}
      onClick={(e) => {
        e.stopPropagation(); // Avoid triggering card details toggle
        onToggle();
      }}
      className={`flex items-center gap-xs px-sm py-[7px] text-body-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer select-none border border-border/80 ${
        isCompleted
          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/15'
          : 'bg-card text-foreground hover:bg-muted/80'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground shrink-0" />
      ) : isCompleted ? (
        <Check className="h-3.5 w-3.5 text-emerald-500 stroke-[3] shrink-0" />
      ) : (
        <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/60 shrink-0" />
      )}
      <span>{isCompleted ? 'Completed' : isOptional ? 'Optional' : 'Mark Complete'}</span>
    </button>
  );
};
