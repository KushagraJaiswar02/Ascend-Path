import React from 'react';
import { Navigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import type { DashboardData } from '../hooks/useDashboardData';
import { useDashboardExperience } from '../../onboarding/hooks/useOnboarding';
import { StarterDashboard } from './StarterDashboard';
import { MenteeDashboard } from './MenteeDashboard';
import { DashboardExperienceLevelEngine } from './DashboardExperienceLevelEngine';
import { ProgressiveRevealSection } from './ProgressiveRevealSection';

interface AdaptiveDashboardRouterProps {
  data: DashboardData;
  user: any;
}

export const AdaptiveDashboardRouter: React.FC<AdaptiveDashboardRouterProps> = ({ data, user }) => {
  const experience = useDashboardExperience();

  if (experience.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="grid gap-5 md:grid-cols-3">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      </div>
    );
  }

  if (experience.data?.onboardingRequired) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!experience.data || experience.data.level <= 1) {
    return <StarterDashboard data={data} user={user} experience={experience.data || {
      onboardingRequired: false,
      personalizationReady: true,
      level: 1,
      label: 'Starter',
      mode: 'starter',
      exposedFeatures: [],
      hiddenFeatures: [],
      reasoning: ['Starter mode keeps the first experience focused and calm.'],
      progressSignals: {
        onboardingCompleted: true,
        confidence: 'exploring',
        hasCareerDomains: false,
        hasCareerGoals: false,
        hasMentorActivity: false,
        engagementScore: 0,
      },
    }} />;
  }

  if (experience.data.level === 2) {
    return (
      <div className="space-y-6">
        <StarterDashboard data={data} user={user} experience={experience.data} />
        <ProgressiveRevealSection
          title="Pathway visualization"
          description="You have unlocked the first layer of pathway context. Deeper branching stays quiet until your direction becomes more focused."
          unlocked
        >
          <DashboardExperienceLevelEngine experience={experience.data} />
        </ProgressiveRevealSection>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardExperienceLevelEngine experience={experience.data} />
      <MenteeDashboard data={data} user={user} />
    </div>
  );
};
