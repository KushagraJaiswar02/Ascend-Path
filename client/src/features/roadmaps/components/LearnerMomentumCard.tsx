import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, UsersRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { RoadmapMomentumItem, TrendingRoadmapSignal } from '../types';

interface LearnerMomentumCardProps {
  momentum?: RoadmapMomentumItem[];
  trending?: TrendingRoadmapSignal[];
}

export const LearnerMomentumCard: React.FC<LearnerMomentumCardProps> = ({ momentum = [], trending = [] }) => {
  return (
    <Card className="flex flex-col h-full border border-border bg-card shadow-subtle overflow-hidden">
      <CardHeader className="p-md border-b border-border/50 bg-muted/20">
        <CardTitle className="text-body-lg font-bold text-foreground flex items-center gap-xs">
          <UsersRound className="h-4 w-4 text-primary" />
          Learning Momentum
        </CardTitle>
      </CardHeader>
      <CardContent className="p-md sm:p-lg space-y-md">
        {momentum.length > 0 ? (
          <div className="space-y-sm">
            {momentum.slice(0, 2).map((item) => (
              <div key={item.roadmap._id} className="rounded-md border border-border bg-muted/20 p-sm">
                <Link to={`/roadmaps/${item.roadmap.slug}`} className="text-body-sm font-bold text-foreground hover:text-primary">
                  {item.roadmap.title}
                </Link>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.community.activeLearnerCount} peers are progressing on this path.
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-muted-foreground">Enroll in a roadmap to see peer momentum around your path.</p>
        )}

        {trending.length > 0 && (
          <div className="space-y-sm border-t border-border/60 pt-md">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-xs">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              Trending this week
            </p>
            {trending.slice(0, 2).map((item) => (
              <div key={item.roadmapId} className="flex items-center justify-between gap-sm">
                <div className="min-w-0">
                  <p className="text-body-xs font-bold text-foreground truncate">{item.roadmap.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.currentGrowth} new learners this week</p>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link to={`/roadmaps/${item.roadmap.slug}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
