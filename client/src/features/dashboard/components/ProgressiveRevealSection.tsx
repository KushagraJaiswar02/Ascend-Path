import React from 'react';
import { LockKeyhole, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ProgressiveRevealSectionProps {
  title: string;
  description: string;
  unlocked: boolean;
  children: React.ReactNode;
}

export const ProgressiveRevealSection: React.FC<ProgressiveRevealSectionProps> = ({ title, description, unlocked, children }) => {
  if (unlocked) return <>{children}</>;

  return (
    <Card className="border border-border bg-muted/15">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <Badge variant="outline" className="text-[10px]">Unlocks later</Badge>
            </div>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        <Sparkles className="hidden h-5 w-5 text-primary sm:block" />
      </CardContent>
    </Card>
  );
};
