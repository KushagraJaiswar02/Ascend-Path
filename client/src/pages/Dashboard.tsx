import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { PersonalizedWelcomeBanner } from '../features/onboarding/components/PersonalizedWelcomeBanner';
import { RecommendationPreview } from '../features/onboarding/components/RecommendationPreview';
import { useOnboardingRecommendations } from '../features/onboarding/hooks/useOnboarding';
import { MenteeDashboard } from '../features/dashboard/components/MenteeDashboard';
import { MentorDashboard } from '../features/dashboard/components/MentorDashboard';
import { ModeratorDashboard } from '../features/dashboard/components/ModeratorDashboard';
import { AdminDashboard } from '../features/dashboard/components/AdminDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data, isLoading, isError, refetch } = useDashboardData();
  const onboardingRecommendations = useOnboardingRecommendations();

  // 1. High-fidelity Loading Skeleton Grid specific to Mentor / Mentee/ Admin roles
  if (isLoading) {
    const role = user?.role || 'user';
    const isMentor = role === 'guide';
    const isAdmin = ['admin', 'architect', 'super_admin', 'moderator', 'sentinel'].includes(role);
    return (
      <PageContainer size="default">
        {/* Skeleton Header */}
        <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/50 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-56 sm:h-9" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>

        {isAdmin ? (
          /* Admin/Moderator skeleton */
          <div className="space-y-8 animate-pulse">
            <div className="space-y-4">
              <Skeleton className="h-[120px] w-full rounded-3xl" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="h-24 bg-card border border-border">
                    <CardContent className="p-5 flex flex-col justify-between h-full">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : isMentor ? (
          /* Mentor-specific high-fidelity skeleton */
          <div className="space-y-8 animate-pulse">
            {/* Attention section skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border border-border bg-card">
                    <div className="h-10 bg-muted/20 border-b border-border/50 p-4 flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-8 rounded-full" />
                    </div>
                    <CardContent className="p-4.5 space-y-3">
                      <Skeleton className="h-[75px] w-full rounded-xl" />
                      <Skeleton className="h-[75px] w-full rounded-xl" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {/* Impact stats skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="h-24 bg-card border border-border">
                    <CardContent className="p-5 flex flex-col justify-between h-full">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-3 w-28" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Mentee-specific high-fidelity skeleton */
          <div className="space-y-8 animate-pulse">
            {/* Hero banner skeleton */}
            <Card className="h-72 border border-border bg-card">
              <CardContent className="p-6 sm:p-8 flex flex-col justify-between h-full">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-8 w-2/3 sm:h-9" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-2 w-full rounded" />
                  <Skeleton className="h-8 w-32 rounded-xl" />
                </div>
              </CardContent>
            </Card>
            {/* Grid skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-6 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <Card key={i} className="h-60 border border-border bg-card">
                      <CardContent className="p-5">
                        <Skeleton className="h-5 w-32 mb-4" />
                        <Skeleton className="h-10 w-full mb-3" />
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <Skeleton className="h-6 w-48" />
                <Card className="h-80 border border-border bg-card">
                  <CardContent className="p-5 space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
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
              className="gap-xs mt-sm bg-card hover:bg-muted text-foreground border-border cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Refetch</span>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const role = user?.role || 'user';
  const isMentor = role === 'guide';
  const isOperator = ['admin', 'architect', 'super_admin', 'moderator', 'sentinel'].includes(role);

  return (
    <PageContainer size="default">
      {/* Mentee Onboarding Recommendation Banners (hidden for mentors & administrators) */}
      {!isMentor && !isOperator && (
        <>
          <PersonalizedWelcomeBanner
            recommendations={onboardingRecommendations.data}
            isLoading={onboardingRecommendations.isLoading}
          />

          {onboardingRecommendations.data?.onboardingCompleted && (
            <div className="mb-6">
              <RecommendationPreview recommendations={onboardingRecommendations.data} />
            </div>
          )}
        </>
      )}

      {/* Render the role-appropriate simplified dashboard */}
      {['admin', 'architect', 'super_admin'].includes(role) ? (
        <AdminDashboard />
      ) : ['moderator', 'sentinel'].includes(role) ? (
        <ModeratorDashboard />
      ) : isMentor ? (
        <MentorDashboard data={data!} user={user!} />
      ) : (
        <MenteeDashboard data={data!} user={user!} />
      )}
    </PageContainer>
  );
};

