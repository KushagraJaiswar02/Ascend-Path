import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { RecentPosts } from '../features/dashboard/components/RecentPosts';
import { RecentPings } from '../features/dashboard/components/RecentPings';
import { UpcomingSessions } from '../features/dashboard/components/UpcomingSessions';
import { RoadmapProgress } from '../features/dashboard/components/RoadmapProgress';
import { MentorRecommendations } from '../features/dashboard/components/MentorRecommendations';
import { LearnerMomentumCard } from '../features/roadmaps/components/LearnerMomentumCard';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Star, AlertCircle, RefreshCw, Flame } from 'lucide-react';
import { BecomeMentorCTA } from '../features/mentorApplications/components/BecomeMentorCTA';
import { MentorApplicationStatusCard } from '../features/mentorApplications/components/MentorApplicationStatusCard';
import { useMyMentorApplication } from '../features/mentorApplications/hooks/useMentorApplications';
import { PersonalizedWelcomeBanner } from '../features/onboarding/components/PersonalizedWelcomeBanner';
import { RecommendationPreview } from '../features/onboarding/components/RecommendationPreview';
import { useOnboardingRecommendations } from '../features/onboarding/hooks/useOnboarding';
import { StatsCard } from '../features/dashboard/components/StatsCard';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data, isLoading, isError, refetch } = useDashboardData();
  const mentorApplication = useMyMentorApplication();
  const onboardingRecommendations = useOnboardingRecommendations();

  // 1. High-fidelity Loading Skeleton Grid
  if (isLoading) {
    return (
      <PageContainer size="default">
        {/* Skeleton Header */}
        <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between pb-md border-b border-border/50 mb-lg">
          <div className="space-y-xs">
            <div className="flex items-center gap-sm">
              <Skeleton className="h-8 w-56 sm:h-9" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-xs mt-sm sm:mt-0">
            <Skeleton className="h-7 w-24 rounded-full" />
            {user?.role === 'guide' && <Skeleton className="h-7 w-24 rounded-full" />}
          </div>
        </div>

        {/* Skeleton 2x2 Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 space-y-lg">
            {[1, 2].map((i) => (
              <Card key={i} className="flex flex-col h-[280px] border border-border bg-card">
                <div className="flex items-center justify-between p-md border-b border-border/50 bg-muted/20">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <CardContent className="p-md sm:p-lg flex-grow flex flex-col gap-md">
                  <div className="flex items-center gap-sm">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="space-y-xs flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <div className="flex justify-end mt-auto">
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="space-y-lg">
            <Card className="h-[200px] border border-border bg-card">
              <CardContent className="p-md flex flex-col gap-sm">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    );
  }

  // 2. High-fidelity Error Fallback State
  if (isError) {
    return (
      <PageContainer size="default" className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full border-destructive/20 bg-destructive/5 text-center">
          <CardContent className="p-lg flex flex-col items-center gap-md">
            <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-body-lg font-bold text-foreground mb-xs">
                Failed to load Dashboard
              </h3>
              <p className="text-muted-sm text-muted-foreground leading-normal">
                There was a problem communicating with our servers. Let's try refetching the data.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => refetch()} 
              className="gap-xs mt-sm bg-card hover:bg-muted text-foreground border-border"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Refetch</span>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer size="default">
      {/* 3. Quiet and Premium Header Section */}
      <div className="flex flex-col gap-sm md:flex-row md:items-center md:justify-between pb-md border-b border-border/60 mb-lg">
        <div className="space-y-xs">
          <div className="flex flex-wrap items-center gap-sm">
            <h1 className="text-page-title text-foreground tracking-tight select-none">
              Welcome back, {user?.name}!
            </h1>
            <Badge variant="secondary" className="capitalize text-[11px] font-bold px-2 py-0.5 border border-border select-none bg-muted/60">
              {user?.role}
            </Badge>
          </div>
          <p className="text-body-p text-muted-foreground leading-normal max-w-xl">
            Review your notifications, track your curriculum goals, and manage your incoming messages.
          </p>
        </div>
        
        {/* Compact Onboarding Action in Header */}
        {user?.role !== 'guide' && <BecomeMentorCTA />}
      </div>

      <PersonalizedWelcomeBanner
        recommendations={onboardingRecommendations.data}
        isLoading={onboardingRecommendations.isLoading}
      />

      {onboardingRecommendations.data?.onboardingCompleted && (
        <div className="mb-lg">
          <RecommendationPreview recommendations={onboardingRecommendations.data} />
        </div>
      )}

      {/* 4. Asymmetric Two-Column Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
        {/* Left Column - Main Learning Momentum & Schedule (2/3 width) */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Active Path Tracking */}
          <RoadmapProgress />
          
          {/* Momentum & Streaks */}
          <LearnerMomentumCard
            momentum={data?.roadmapMomentum || []}
            trending={data?.trendingRoadmaps || []}
          />
          
          {/* Upcoming Schedule */}
          <UpcomingSessions sessions={data?.upcomingSessions || []} />
          
          {/* Tailored Matches & Mentor Advice */}
          <MentorRecommendations reflections={data?.mentorRecommendations || []} />
        </div>

        {/* Right Column - Sidebar Feed, Inbox & Status (1/3 width) */}
        <div className="space-y-lg">
          {/* Reputation Stat Cards widget (replaces tiny pills) */}
          <div className="space-y-sm">
            <h2 className="text-section-title text-foreground px-xs">Your Progress</h2>
            <div className="grid grid-cols-1 gap-sm">
              <StatsCard
                title="Respect Points"
                value={user?.respectPoints || 0}
                subtitle="Earned from community help"
                icon={<Award />}
                variant="primary"
              />
              
              {user?.role === 'guide' ? (
                <StatsCard
                  title="Fame Score"
                  value={user?.fameScore || 0}
                  subtitle="Expert mentor authority"
                  icon={<Star className="fill-warning/10 text-warning" />}
                  variant="warning"
                />
              ) : (
                <StatsCard
                  title="Roadmap Momentum"
                  value={`${data?.roadmapMomentum?.[0]?.streakCount || 0} Days`}
                  subtitle="Consecutive learning streak"
                  icon={<Flame className="text-orange-500 fill-orange-500/10" />}
                  variant="warning"
                />
              )}
            </div>
          </div>

          {user?.role !== 'guide' && (
            <MentorApplicationStatusCard application={mentorApplication.data} isLoading={mentorApplication.isLoading} />
          )}

          {/* Action Required Messages */}
          <RecentPings pings={data?.pendingPings || []} />

          {/* Forum Interactions */}
          <RecentPosts posts={data?.recentPosts || []} />
        </div>
      </div>
    </PageContainer>
  );
};

