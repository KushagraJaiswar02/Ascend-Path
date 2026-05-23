import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import type { RecommendationResponse } from '../types';

export const PersonalizedWelcomeBanner = ({
  recommendations,
  isLoading,
}: {
  recommendations?: RecommendationResponse;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="mb-lg rounded-md border border-border p-4">
        <Skeleton className="h-6 w-64" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      </div>
    );
  }

  if (!recommendations?.onboardingCompleted) {
    return (
      <div className="mb-lg flex flex-col gap-3 rounded-md border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            Shape your learning path
          </h2>
          <p className="text-sm text-muted-foreground">Answer a few goal questions to personalize roadmaps, mentors, and dashboard actions.</p>
        </div>
        <Button asChild>
          <Link to="/onboarding">
            Start onboarding
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  const primaryAction = recommendations.quickActions[0];

  return (
    <div className="mb-lg flex flex-col gap-3 rounded-md border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold">{recommendations.personalization.headline}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{recommendations.personalization.subheading}</p>
      </div>
      {primaryAction && (
        <Button asChild>
          <Link to={primaryAction.href}>
            {primaryAction.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
};
