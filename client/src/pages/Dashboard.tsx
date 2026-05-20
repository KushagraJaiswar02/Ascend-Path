import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useDashboardData } from '../features/dashboard/hooks/useDashboardData';
import { RecentPosts } from '../features/dashboard/components/RecentPosts';
import { RecentPings } from '../features/dashboard/components/RecentPings';
import { UpcomingSessions } from '../features/dashboard/components/UpcomingSessions';
import { RoadmapProgress } from '../features/dashboard/components/RoadmapProgress';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Star, AlertCircle, RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { data, isLoading, isError, refetch } = useDashboardData();

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
          {[1, 2, 3, 4].map((i) => (
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
            <h1 className="text-heading-md font-bold tracking-tight text-foreground sm:text-heading-lg leading-tight select-none">
              Welcome back, {user?.name}!
            </h1>
            <Badge variant="secondary" className="capitalize text-[11px] font-bold px-2 py-0.5 border border-border select-none">
              {user?.role}
            </Badge>
          </div>
          <p className="text-body-sm text-muted-foreground leading-normal max-w-xl">
            Review your notifications, track your curriculum goals, and manage your incoming messages.
          </p>
        </div>
        
        {/* Subtle, highly legible and recognizable Reputation Capsules */}
        <div className="flex flex-wrap items-center gap-sm mt-xs md:mt-0 select-none">
          <div className="inline-flex items-center gap-xs px-sm py-[3px] bg-muted/50 border border-border rounded-full shadow-subtle text-muted-foreground text-body-xs font-semibold transition-colors hover:bg-muted hover:border-border/80">
            <Award className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Respect Points:</span>
            <span className="text-foreground font-bold">{user?.respectPoints || 0}</span>
          </div>
          
          {user?.role === 'guide' && (
            <div className="inline-flex items-center gap-xs px-sm py-[3px] bg-warning/10 border border-warning/20 rounded-full shadow-subtle text-warning-foreground text-body-xs font-semibold transition-colors hover:bg-warning/15">
              <Star className="h-3.5 w-3.5 text-warning shrink-0" />
              <span>Fame Score:</span>
              <span className="text-foreground font-bold">{user?.fameScore || 0}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Balanced 2x2 Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-stretch">
        <div className="h-full">
          <RecentPings pings={data?.pendingPings || []} />
        </div>
        <div className="h-full">
          <RecentPosts posts={data?.recentPosts || []} />
        </div>
        <div className="h-full">
          <UpcomingSessions sessions={data?.upcomingSessions || []} />
        </div>
        <div className="h-full">
          <RoadmapProgress />
        </div>
      </div>
    </PageContainer>
  );
};

