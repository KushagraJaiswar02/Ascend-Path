import React from 'react';
import { usePortfolioProjects, useAchievements, useEndorsements } from '../hooks/useCredibility';
import { PortfolioGrid } from './PortfolioGrid';
import { AchievementTimeline } from './AchievementTimeline';
import { EndorsementCard } from './EndorsementCard';
import { CredibilityBadges } from './CredibilityBadges';
import { VerifiedMilestoneStrip } from './VerifiedMilestoneStrip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileCredibilityPanelProps {
  userId: string;
  totalSessions?: number;
  averageRating?: number;
}

export const ProfileCredibilityPanel: React.FC<ProfileCredibilityPanelProps> = ({
  userId,
  totalSessions = 0,
  averageRating = 0,
}) => {
  const { data: projects = [], isLoading: pLoad } = usePortfolioProjects(userId);
  const { data: achievements = [], isLoading: aLoad } = useAchievements(userId);
  const { data: endorsements = [], isLoading: eLoad } = useEndorsements(userId);

  const isLoading = pLoad || aLoad || eLoad;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Milestone Strip */}
      {achievements.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Verified Credentials</p>
          <VerifiedMilestoneStrip achievements={achievements} />
        </div>
      )}

      {/* Credibility Badges */}
      <CredibilityBadges
        achievements={achievements}
        projects={projects}
        endorsements={endorsements}
        totalSessions={totalSessions}
        averageRating={averageRating}
      />

      {/* Tabs */}
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="bg-muted/40 p-1 border border-border/60 rounded-xl">
          <TabsTrigger value="portfolio" className="text-xs font-bold uppercase tracking-wider px-4">
            Portfolio ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs font-bold uppercase tracking-wider px-4">
            Credentials ({achievements.length})
          </TabsTrigger>
          <TabsTrigger value="endorsements" className="text-xs font-bold uppercase tracking-wider px-4">
            Endorsements ({endorsements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-4 focus-visible:outline-none">
          <PortfolioGrid projects={projects} isOwner={false} />
        </TabsContent>

        <TabsContent value="achievements" className="mt-4 focus-visible:outline-none">
          <AchievementTimeline achievements={achievements} />
        </TabsContent>

        <TabsContent value="endorsements" className="mt-4 focus-visible:outline-none space-y-3">
          {endorsements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No endorsements yet.</p>
          ) : (
            endorsements.map((e) => <EndorsementCard key={e._id} endorsement={e} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
