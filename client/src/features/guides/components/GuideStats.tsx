import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, CalendarCheck2, Compass, Star } from 'lucide-react';

interface GuideStatsProps {
  totalSessions: number;
  averageRating: number;
  roadmapCount: number;
  respectPoints: number;
}

export const GuideStats: React.FC<GuideStatsProps> = ({
  totalSessions,
  averageRating,
  roadmapCount,
  respectPoints,
}) => {
  const stats = [
    {
      label: 'Sessions Completed',
      value: totalSessions || 0,
      icon: CalendarCheck2,
      color: 'text-primary bg-primary/10',
    },
    {
      label: 'Average Rating',
      value: averageRating > 0 ? `${averageRating.toFixed(2)}` : 'N/A',
      icon: Star,
      color: 'text-warning bg-warning/10',
      extra: averageRating > 0 ? (
        <div className="flex items-center gap-[2px] mt-xs">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3 w-3 ${
                star <= Math.round(averageRating)
                  ? 'fill-warning text-warning'
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      ) : null,
    },
    {
      label: 'Owned Roadmaps',
      value: roadmapCount || 0,
      icon: Compass,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20',
    },
    {
      label: 'Respect Points',
      value: respectPoints || 0,
      icon: Award,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-md w-full select-none">
      {stats.map((stat, idx) => (
        <Card key={idx} className="border border-border bg-card shadow-subtle hover:border-border/80 hover:shadow-md transition-all duration-200">
          <CardContent className="p-md flex flex-col items-center text-center">
            <div className={`p-sm rounded-xl mb-sm ${stat.color} flex items-center justify-center shrink-0`}>
              <stat.icon className="h-5 w-5 shrink-0" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-xxs">
              {stat.label}
            </span>
            <span className="text-heading-sm font-black text-foreground">
              {stat.value}
            </span>
            {stat.extra}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
