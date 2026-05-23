import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'primary' | 'warning' | 'success';
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon,
  variant = 'default'
}) => {
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 border bg-card text-card-foreground select-none relative group",
        "hover:shadow-medium hover:border-border/80",
        variant === 'primary' && "hover:border-primary/30",
        variant === 'warning' && "hover:border-warning/30",
        variant === 'success' && "hover:border-success/30"
      )}
    >
      {/* Premium subtle top-edge color strip */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 h-[3px] bg-transparent transition-colors duration-300",
          variant === 'primary' && "bg-primary/20 group-hover:bg-primary/60",
          variant === 'warning' && "bg-warning/20 group-hover:bg-warning/60",
          variant === 'success' && "bg-success/20 group-hover:bg-success/60"
        )} 
      />

      <CardContent className="p-5 flex items-center justify-between gap-4 mt-[3px]">
        <div className="space-y-1 min-w-0">
          <p className="text-label-lbl font-semibold text-muted-foreground uppercase tracking-wider truncate">
            {title}
          </p>
          <h3 className="text-[22px] font-bold tracking-tight text-foreground leading-none">
            {value}
          </h3>
          {subtitle && (
            <p className="text-metadata text-muted-foreground leading-normal truncate">
              {subtitle}
            </p>
          )}
        </div>
        
        {icon && (
          <div 
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 [&_svg]:h-5 [&_svg]:w-5",
              "bg-muted text-muted-foreground group-hover:scale-105",
              variant === 'primary' && "bg-primary/5 text-primary group-hover:bg-primary/10",
              variant === 'warning' && "bg-warning/5 text-warning group-hover:bg-warning/10",
              variant === 'success' && "bg-success/5 text-success group-hover:bg-success/10"
            )}
          >
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

