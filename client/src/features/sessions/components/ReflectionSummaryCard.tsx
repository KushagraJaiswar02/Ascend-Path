import React from 'react';
import { ArrowRight, Brain, CheckCircle2, Gauge, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SessionReflection } from '../types';

interface ReflectionSummaryCardProps {
  reflection: SessionReflection | null | undefined;
  onAddReflection?: () => void;
}

export const ReflectionSummaryCard: React.FC<ReflectionSummaryCardProps> = ({ reflection, onAddReflection }) => {
  const menteeReflection = reflection?.menteeReflection;

  if (!reflection) return null;

  return (
    <Card className="border border-border bg-card overflow-hidden">
      <CardContent className="p-md space-y-md">
        <div className="flex items-start justify-between gap-sm">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Session outcomes</p>
            <h3 className="text-body-md font-bold text-foreground flex items-center gap-xs mt-0.5">
              <Brain className="h-4 w-4 text-primary" />
              Reflection and next steps
            </h3>
          </div>
          <Badge variant={menteeReflection?.submittedAt ? 'success' : 'outline'} className="text-[10px] shrink-0">
            {menteeReflection?.submittedAt ? 'Captured' : 'Pending'}
          </Badge>
        </div>

        {menteeReflection?.submittedAt ? (
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-md">
            <div className="rounded-md border border-border/70 bg-muted/20 p-sm">
              <div className="flex items-center gap-xs text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Key takeaway
              </div>
              <p className="text-body-sm text-foreground leading-relaxed whitespace-pre-wrap">{menteeReflection.learnings}</p>
            </div>

            <div className="space-y-sm">
              <div className="rounded-md border border-border/70 bg-muted/20 p-sm">
                <div className="flex items-center justify-between gap-sm mb-xs">
                  <span className="flex items-center gap-xs text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Gauge className="h-3.5 w-3.5" />
                    Confidence
                  </span>
                  <span className="text-body-sm font-bold text-foreground">{menteeReflection.confidenceLevel}/5</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(20, menteeReflection.confidenceLevel * 20)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-md border border-border/70 bg-muted/20 p-sm">
                <div className="flex items-center gap-xs text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-xs">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  Remaining challenge
                </div>
                <p className="text-body-xs text-foreground leading-relaxed whitespace-pre-wrap">{menteeReflection.nextChallenge}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-border/70 bg-muted/20 p-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm">
            <div>
              <p className="text-body-sm font-semibold text-foreground">Turn the session into a learning loop</p>
              <p className="text-body-xs text-muted-foreground mt-0.5">
                Capture what changed, what still feels hard, and what your next practice loop should target.
              </p>
            </div>
            {onAddReflection && (
              <Button variant="primary" size="sm" onClick={onAddReflection} className="shrink-0">
                Add reflection
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
