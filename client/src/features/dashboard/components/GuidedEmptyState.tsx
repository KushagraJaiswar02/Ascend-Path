import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuidedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  guidance: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const GuidedEmptyState: React.FC<GuidedEmptyStateProps> = ({ icon: Icon, title, guidance, actionLabel, onAction }) => {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-5 text-center">
      <Icon className="mx-auto mb-3 h-6 w-6 text-primary" />
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{guidance}</p>
      {actionLabel && onAction && (
        <Button className="mt-4" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
