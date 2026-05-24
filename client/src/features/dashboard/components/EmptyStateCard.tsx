import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
  title,
  description,
  icon: Icon,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-6 sm:p-8 border border-dashed border-border/80 rounded-2xl bg-card text-card-foreground shadow-subtle min-h-[220px] select-none relative overflow-hidden group transition-all duration-300 hover:border-primary/20",
        className
      )}
    >
      {/* Soft background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition-all duration-300" />
      
      <div className="p-3.5 bg-primary/5 text-primary rounded-2xl mb-4 border border-primary/10 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 shrink-0">
        <Icon className="h-6 w-6 stroke-[1.8]" />
      </div>
      
      <div className="space-y-1.5 max-w-sm mx-auto mb-5">
        <h3 className="text-body-p font-bold text-foreground leading-snug">
          {title}
        </h3>
        <p className="text-metadata text-muted-foreground font-medium leading-relaxed">
          {description}
        </p>
      </div>
      
      {action && (
        <Button
          onClick={action.onClick}
          variant="primary"
          className="h-9 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-primary hover:bg-primary/95 text-white shadow-sm transition-transform duration-200 active:scale-[0.98] cursor-pointer"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};
