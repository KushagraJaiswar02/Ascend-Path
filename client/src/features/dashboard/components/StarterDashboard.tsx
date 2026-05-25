import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, CalendarDays, Lightbulb, Map, MessageCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMyActiveRoadmaps } from '../../roadmaps/hooks/useRoadmapProgress';
import type { DashboardData } from '../hooks/useDashboardData';
import type { DashboardExperiencePayload } from '../../onboarding/types';
import { GuidedEmptyState } from './GuidedEmptyState';
import { DashboardExperienceLevelEngine } from './DashboardExperienceLevelEngine';
import { useMentorshipConversations } from '../../mentorship/hooks';
import { ActiveMentorshipCard } from '../../mentorship/components/ActiveMentorshipCard';

interface StarterDashboardProps {
  data: DashboardData;
  user: any;
  experience: DashboardExperiencePayload;
}

export const StarterDashboard: React.FC<StarterDashboardProps> = ({ data, user, experience }) => {
  const navigate = useNavigate();
  const { data: activeRoadmaps } = useMyActiveRoadmaps();
  const mentorship = useMentorshipConversations();
  const activeRoadmap = activeRoadmaps?.[0];
  const recommendedRoadmap = data.contextualRecommendations?.rails?.roadmaps?.[0]?.item;
  const recommendedMentor = data.contextualRecommendations?.rails?.mentors?.[0]?.item;
  const firstSession = data.contextualRecommendations?.rails?.sessions?.[0]?.item;

  const nextAction = activeRoadmap
    ? { label: 'Resume your path', href: `/roadmaps/${activeRoadmap.roadmapId?.slug || activeRoadmap.roadmapId?._id}` }
    : recommendedRoadmap
      ? { label: 'Start this roadmap', href: `/roadmaps/${recommendedRoadmap.slug || recommendedRoadmap._id}` }
      : { label: 'Explore starter paths', href: '/explore' };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-6 shadow-subtle sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge variant="secondary" className="w-fit">Beginner mode</Badge>
            <h1 className="text-3xl font-bold leading-tight text-foreground">Welcome, {user?.name}. Here is your first clear step.</h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Your dashboard is intentionally calm right now. Advanced maps, companion analytics, and tracking systems will appear as your path becomes clearer.
            </p>
          </div>
          <Button className="h-11 shrink-0" onClick={() => navigate(nextAction.href)}>
            {nextAction.label}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <Map className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Recommended roadmap</h2>
            </div>
            {activeRoadmap || recommendedRoadmap ? (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-foreground">{activeRoadmap?.roadmapId?.title || recommendedRoadmap?.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {activeRoadmap?.roadmapId?.description || recommendedRoadmap?.description || 'A structured starting point matched to your interests and current clarity.'}
                </p>
                <Button variant="outline" onClick={() => navigate(nextAction.href)}>Open roadmap</Button>
              </div>
            ) : (
              <GuidedEmptyState icon={Map} title="Your first roadmap is almost ready" guidance="Explore a starter path so AscendPath can anchor your next actions around one realistic direction." actionLabel="Explore paths" onAction={() => navigate('/explore')} />
            )}
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Starter mentor</h2>
            </div>
            {recommendedMentor ? (
              <div className="space-y-3">
                <h3 className="text-base font-bold text-foreground">{recommendedMentor.name}</h3>
                <p className="text-sm text-muted-foreground">A mentor match to help clarify your next decision without overwhelming you.</p>
                <Button variant="outline" onClick={() => navigate(`/profile/${recommendedMentor._id}`)}>View mentor</Button>
              </div>
            ) : (
              <GuidedEmptyState icon={MessageCircle} title="Start with one mentor conversation" guidance="One short mentor conversation can turn uncertainty into a concrete next step." actionLabel="Find mentors" onAction={() => navigate('/explore?tab=guides')} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <ActiveMentorshipCard preview={mentorship.data?.[0]?.lastMessagePreview} />
        <Card>
          <CardContent className="p-5">
            <CalendarDays className="mb-3 h-5 w-5 text-primary" />
            <h2 className="font-bold text-foreground">First session or workshop</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {firstSession?.title || data.upcomingSessions?.[0]?.topic || 'Join one guided session to make the path feel less abstract.'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <BriefcaseBusiness className="mb-3 h-5 w-5 text-primary" />
            <h2 className="font-bold text-foreground">Simple opportunity</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Focus on one beginner-friendly opportunity after your roadmap has a first milestone.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <Lightbulb className="mb-3 h-5 w-5 text-primary" />
            <h2 className="font-bold text-foreground">Growth insight</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your clarity level is {experience.progressSignals.confidence.replace('_', ' ')}. We will keep recommendations gentle until your direction sharpens.
            </p>
          </CardContent>
        </Card>
      </div>

      <DashboardExperienceLevelEngine experience={experience} />

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 text-primary" />
          <p className="text-sm leading-relaxed text-foreground">
            Advanced recommendation rails, companion analytics, pathway graphs, portfolio systems, and opportunity tracking are intentionally hidden until they become useful instead of noisy.
          </p>
        </div>
      </div>
    </div>
  );
};
