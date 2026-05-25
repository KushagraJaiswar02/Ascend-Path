import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, MessageSquare, UserRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import type { RecommendationResponse } from '../types';
import { SimilarLearnerMomentum } from '../../recommendations/components/SimilarLearnerMomentum';

export const RecommendationPreview = ({ recommendations }: { recommendations?: RecommendationResponse }) => {
  if (!recommendations) return null;

  if (recommendations.rails) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">{recommendations.contextLabel}</p>
        <div className="grid gap-4 lg:grid-cols-4">
          <RecommendationColumn
            title="Roadmaps"
            icon={<BookOpen className="h-4 w-4" />}
            items={recommendations.rails.roadmaps.slice(0, 3).map((entry) => ({
              label: entry.item.title,
              detail: entry.reasons.join(', '),
              href: `/roadmaps/${entry.item.slug || entry.item._id}`,
            }))}
          />
          <RecommendationColumn
            title="Mentors"
            icon={<UserRound className="h-4 w-4" />}
            items={recommendations.rails.mentors.slice(0, 3).map((entry) => ({
              label: entry.item.name,
              detail: entry.reasons.join(', '),
              href: `/profile/${entry.item._id}`,
            }))}
          />
          <RecommendationColumn
            title="Workshops"
            icon={<CalendarDays className="h-4 w-4" />}
            items={recommendations.rails.sessions.slice(0, 3).map((entry) => ({
              label: entry.item.title,
              detail: entry.reasons.join(', '),
              href: `/sessions/${entry.item._id}`,
            }))}
          />
          <RecommendationColumn
            title="Community"
            icon={<MessageSquare className="h-4 w-4" />}
            items={recommendations.rails.forum.slice(0, 3).map((entry) => ({
              label: entry.item.title,
              detail: entry.reasons.join(', '),
              href: `/forum/${entry.item._id}`,
            }))}
          />
        </div>
        <SimilarLearnerMomentum journey={recommendations.starterJourney} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <RecommendationColumn
        title="Roadmaps"
        icon={<BookOpen className="h-4 w-4" />}
        items={[
          ...recommendations.roadmaps.map((entry) => ({
            label: entry.item.title,
            detail: entry.reason,
            href: `/roadmaps/${entry.item.slug || entry.item._id}`,
          })),
          ...recommendations.fallbackRoadmaps.map((entry) => ({
            label: entry.title,
            detail: entry.reason,
            href: '/explore',
          })),
        ].slice(0, 3)}
      />
      <RecommendationColumn
        title="Mentors"
        icon={<UserRound className="h-4 w-4" />}
        items={recommendations.mentors.slice(0, 3).map((entry) => ({
          label: entry.item.name,
          detail: entry.reason,
          href: `/profile/${entry.item._id}`,
        }))}
      />
      <RecommendationColumn
        title="Community"
        icon={<MessageSquare className="h-4 w-4" />}
        items={recommendations.posts.slice(0, 3).map((entry) => ({
          label: entry.item.title,
          detail: entry.reason,
          href: `/forum/${entry.item._id}`,
        }))}
      />
    </div>
  );
};

const RecommendationColumn = ({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: Array<{ label: string; detail: string; href: string }>;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {items.length === 0 && <p className="text-sm text-muted-foreground">Recommendations will appear as the catalog grows.</p>}
      {items.map((item) => (
        <Link key={`${title}-${item.label}`} to={item.href} className="block rounded-md border border-border p-3 transition-colors hover:bg-muted">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold">{item.label}</div>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </CardContent>
  </Card>
);
