import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { RatingBreakdownData } from '../hooks/useReviews';
import { Star, MessageSquareCode } from 'lucide-react';

interface RatingBreakdownProps {
  breakdown: RatingBreakdownData;
}

export const RatingBreakdown: React.FC<RatingBreakdownProps> = ({ breakdown }) => {
  const { averageRating = 0, totalReviews = 0, starDistribution, tagsDistribution = [] } = breakdown;

  // Calculate percentages for star progress bars
  const getPercentage = (count: number) => {
    if (totalReviews === 0) return 0;
    return (count / totalReviews) * 100;
  };

  return (
    <Card className="border border-border bg-card shadow-subtle hover:border-border/80 transition-all select-none">
      <CardContent className="p-md sm:p-lg space-y-md">
        
        {/* Core Averages Header */}
        <div className="flex items-center gap-md pb-md border-b border-border/50">
          <div className="text-center shrink-0">
            <span className="text-heading-lg font-black text-foreground block leading-none">
              {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase mt-xxs block">
              Out of 5
            </span>
          </div>

          <div className="space-y-xs flex-grow">
            <div className="flex items-center gap-[2px]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4.5 w-4.5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-warning text-warning'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <span className="block text-body-xs font-semibold text-muted-foreground">
              Based on {totalReviews} verified reviews
            </span>
          </div>
        </div>

        {/* 5-to-1 Star Distribution Progress Bars */}
        <div className="space-y-xs">
          {([5, 4, 3, 2, 1] as const).map((rating) => {
            const count = starDistribution?.[rating] || 0;
            const pct = getPercentage(count);

            return (
              <div key={rating} className="flex items-center gap-sm text-body-xs font-medium">
                <span className="w-10 shrink-0 text-foreground text-right font-bold">
                  {rating} Star
                </span>
                
                {/* Visual Progress Track */}
                <div className="flex-grow h-2 bg-muted rounded-full overflow-hidden border border-border/40">
                  <div
                    className="h-full bg-warning rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-8 shrink-0 text-muted-foreground font-semibold text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Trait Tags aggregate */}
        {tagsDistribution.length > 0 && (
          <div className="pt-md border-t border-border/50 space-y-sm">
            <h4 className="text-body-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-xs">
              <MessageSquareCode className="h-4 w-4 text-primary shrink-0" />
              <span>Mentor Strengths</span>
            </h4>

            <div className="flex flex-wrap gap-xs pt-xxs">
              {tagsDistribution.map((item, idx) => {
                const traitPercentage = Math.round(getPercentage(item.count));

                return (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-xxs px-sm py-[4px] bg-primary/5 border border-primary/15 rounded-full text-body-xs text-primary font-bold shadow-sm"
                    title={`${item.count} reviews matching this trait`}
                  >
                    <span>{item.tag}</span>
                    <span className="text-[10px] font-normal text-muted-foreground/80">
                      ({traitPercentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
