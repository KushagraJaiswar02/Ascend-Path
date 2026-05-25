import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RecommendationItem } from '../types';
import { useRecommendationInteraction } from '../hooks/useRecommendations';

const hrefFor = (entry: RecommendationItem) => {
  const item = entry.item || {};
  if (entry.targetType === 'mentor') return `/profile/${item._id}`;
  if (entry.targetType === 'roadmap') return `/roadmaps/${item.slug || item._id}`;
  if (entry.targetType === 'session') return `/sessions/${item._id}`;
  if (entry.targetType === 'forum') return `/forum/${item._id}`;
  return '/explore';
};

const titleFor = (entry: RecommendationItem) => entry.item?.title || entry.item?.name || entry.item?.topic || 'Recommended item';

export const RecommendationRail = ({
  title,
  subtitle,
  items,
  context = 'dashboard',
}: {
  title: string;
  subtitle?: string;
  items: RecommendationItem[];
  context?: string;
}) => {
  const interaction = useRecommendationInteraction();

  return (
    <Card className="border border-border bg-card shadow-subtle">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-bold">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Personalized suggestions will appear as your activity grows.</p>}
        {items.slice(0, 4).map((entry) => {
          const targetId = entry.item?._id;
          return (
            <Link
              key={`${entry.targetType}-${targetId}`}
              to={hrefFor(entry)}
              onClick={() => {
                if (targetId) {
                  interaction.mutate({ targetType: entry.targetType, targetId, interactionType: 'clicked', context });
                }
              }}
              className="block rounded-md border border-border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{titleFor(entry)}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {entry.reasons?.join(', ') || entry.contextLabel || 'Recommended for your context'}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
};
