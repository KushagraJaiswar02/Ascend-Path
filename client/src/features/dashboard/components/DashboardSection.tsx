import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  accentColor?: 'primary' | 'success' | 'warning' | 'none';
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  headerActions,
  className,
  children,
  accentColor = 'none',
}) => {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-border/40 select-none">
        <div className="space-y-1 relative pl-3">
          {/* Subtle colored accent indicator on the left side of section titles for role-based UX identity */}
          {accentColor !== 'none' && (
            <span
              className={cn(
                "absolute left-0 top-1 bottom-1 w-1 rounded-full",
                accentColor === 'primary' && "bg-primary",
                accentColor === 'success' && "bg-success",
                accentColor === 'warning' && "bg-warning"
              )}
            />
          )}
          <h2 className="text-section-title font-semibold text-foreground tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-metadata text-muted-foreground font-normal leading-normal">
              {subtitle}
            </p>
          )}
        </div>
        {headerActions && (
          <div className="flex items-center gap-2 shrink-0 sm:self-center">
            {headerActions}
          </div>
        )}
      </div>
      <div className="min-w-0">
        {children}
      </div>
    </section>
  );
};
