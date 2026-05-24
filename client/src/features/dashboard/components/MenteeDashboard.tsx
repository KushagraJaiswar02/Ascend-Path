import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Video,
  Inbox,
  Sparkles,
  UsersRound,
  TrendingUp,
  Award,
  ArrowUpRight,
  Compass,
  CheckCircle2,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DashboardSection } from './DashboardSection';
import { EmptyStateCard } from './EmptyStateCard';
import { StatsCard } from './StatsCard';
import { UpcomingSessions } from './UpcomingSessions';
import { RecentPings } from './RecentPings';
import { useMyActiveRoadmaps, useRoadmap } from '../../roadmaps/hooks/useRoadmapProgress';
import { RoadmapProgressBar } from '../../roadmaps/components/RoadmapProgressBar';
import type { DashboardData } from '../hooks/useDashboardData';

interface MenteeDashboardProps {
  data: DashboardData;
  user: any;
}

export const MenteeDashboard: React.FC<MenteeDashboardProps> = ({ data, user }) => {
  const navigate = useNavigate();
  const { data: activeRoadmaps, isLoading: isActiveRoadmapsLoading } = useMyActiveRoadmaps();

  const activeProgress = activeRoadmaps?.[0];
  const activeRoadmapId = activeProgress?.roadmapId?._id;

  // Retrieve the full active roadmap tree to identify the first uncompleted required step
  const { data: fullActiveRoadmap } = useRoadmap(activeRoadmapId, !!activeRoadmapId);

  // Find the exact next step / milestone
  let nextStep: any = null;
  if (fullActiveRoadmap?.sections && activeProgress?.completedSteps) {
    const completedSet = new Set(activeProgress.completedSteps.map((id: any) => id.toString()));
    for (const section of fullActiveRoadmap.sections) {
      if (section.steps) {
        const step = section.steps.find((s: any) => !s.isOptional && !completedSet.has(s._id.toString()));
        if (step) {
          nextStep = step;
          break;
        }
      }
    }
  }

  const hasActiveRoadmap = !!activeProgress;
  const progressPercentage = activeProgress?.progressPercentage || 0;
  const streak = activeProgress?.streakCount || 0;

  // Find latest completed steps to show in the momentum list
  const recentCompletedSteps = fullActiveRoadmap?.sections
    ? fullActiveRoadmap.sections
        .flatMap((s: any) => s.steps || [])
        .filter((step: any) => activeProgress?.completedSteps?.includes(step._id.toString()))
        .slice(-2)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* ================= HERO SECTION: CONTINUE YOUR JOURNEY ================= */}
      <section className="relative select-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-violet-500/5 to-indigo-500/5 rounded-3xl blur-md pointer-events-none" />
        
        <Card className="border border-border/80 bg-gradient-to-br from-card to-muted/15 p-6 sm:p-8 rounded-3xl shadow-subtle relative overflow-hidden group">
          {/* Subtle colored glow blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-all duration-500 group-hover:bg-primary/15" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full select-none">
                  Continue Your Journey
                </span>
                {streak > 0 && (
                  <div className="flex items-center gap-1 text-orange-500 bg-orange-500/5 border border-orange-500/10 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide select-none">
                    <Flame className="h-3 w-3 fill-orange-500/10" />
                    <span>{streak} Day Streak</span>
                  </div>
                )}
              </div>

              {!hasActiveRoadmap ? (
                <div className="space-y-3 max-w-xl">
                  <h2 className="text-page-title font-bold text-foreground tracking-tight leading-tight sm:text-3xl">
                    Unlock Your Professional Growth
                  </h2>
                  <p className="text-body-p text-muted-foreground leading-relaxed font-medium">
                    You have not enrolled in any study path yet. Unlock curriculum modules, check milestones, and connect with peers!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="text-page-title font-bold text-foreground tracking-tight leading-tight sm:text-3xl group-hover:text-primary transition-colors duration-300">
                    {activeProgress.roadmapId?.title}
                  </h2>
                  <p className="text-body-p text-muted-foreground leading-relaxed font-medium max-w-2xl line-clamp-1">
                    {activeProgress.roadmapId?.description || 'Your structured development study map.'}
                  </p>
                </div>
              )}

              {/* Progressive Tracking & Milestone Details */}
              {hasActiveRoadmap && (
                <div className="space-y-4 max-w-xl">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground select-none">
                      <span>Course Progress</span>
                      <span className="font-bold text-foreground">{progressPercentage}% Complete</span>
                    </div>
                    <RoadmapProgressBar progressPercentage={progressPercentage} height="sm" />
                  </div>

                  {/* Next Step Guidance Banner */}
                  {nextStep ? (
                    <div className="flex items-start gap-3 p-3.5 bg-muted/30 border border-border/40 rounded-2xl select-text transition-all duration-300 hover:border-primary/10 hover:bg-muted/40">
                      <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 select-none">
                        <Sparkles className="h-3 w-3" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-extrabold uppercase text-primary tracking-wider leading-none select-none">
                          Next Step Recommendation
                        </p>
                        <h4 className="text-body-xs font-bold text-foreground leading-snug">
                          {nextStep.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-normal leading-relaxed line-clamp-1">
                          {nextStep.description || 'Learn and review step requirements.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    progressPercentage === 100 && (
                      <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/15 rounded-2xl">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        <span className="text-body-xs font-bold text-foreground leading-tight">
                          Congratulations! You have completed all milestones in this track!
                        </span>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Mentor follow-up recommendation callout inside hero if available */}
              {data.mentorRecommendations?.[0]?.mentorFollowup && (
                <div className="flex items-center gap-2 text-metadata text-primary bg-primary/5 border border-primary/15 py-2 px-3.5 rounded-full w-fit font-bold select-none leading-none animate-pulse mt-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span>💡 Suggested by your Mentor: "{data.mentorRecommendations[0].mentorFollowup.mentorNotes?.slice(0, 45)}..."</span>
                </div>
              )}
            </div>

            {/* Button CTA Link */}
            <div className="shrink-0 w-full lg:w-auto self-end lg:self-center">
              {!hasActiveRoadmap ? (
                <Button
                  onClick={() => navigate('/explore')}
                  className="w-full lg:w-auto h-12 px-7 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl uppercase tracking-wider text-xs shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Discover Roadmaps</span>
                  <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />
                </Button>
              ) : (
                <Button
                  onClick={() => navigate(`/roadmaps/${activeProgress.roadmapId?.slug}`)}
                  className="w-full lg:w-auto h-12 px-7 bg-primary hover:bg-primary/95 text-white font-bold rounded-2xl uppercase tracking-wider text-xs shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Resume Path</span>
                  <ArrowRight className="h-4.5 w-4.5 stroke-[2.5]" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* ================= MAIN CONTENT ASYMMETRIC GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column (2/3 width) - Upcoming Sessions & Pending Pings */}
        <div className="lg:col-span-2 space-y-8">
          <DashboardSection
            title="Upcoming Mentorship & Guidance"
            subtitle="Connect with guides, answer follow-ups, and review booked slots"
            accentColor="primary"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Booked Calendar Sessions */}
              <div className="flex flex-col h-full">
                <UpcomingSessions sessions={data.upcomingSessions || []} />
              </div>

              {/* Card 2: Action Required Inbox Pings */}
              <div className="flex flex-col h-full">
                <RecentPings pings={data.pendingPings || []} />
              </div>
            </div>
          </DashboardSection>

          {/* Mentor Advice / Matching Suggestions */}
          <DashboardSection
            title="Personalized Mentor Advice"
            subtitle="Review structured task follow-ups and step recommendations suggested by your mentors"
          >
            {data.mentorRecommendations && data.mentorRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {data.mentorRecommendations.map((reflection) => (
                  <Card key={reflection._id} className="border border-border/80 hover:border-primary/20 hover:shadow-subtle transition-all duration-300 rounded-2xl overflow-hidden">
                    <CardContent className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[9px] font-bold">
                              {typeof reflection.mentorId === 'object' && reflection.mentorId?.name
                                ? reflection.mentorId.name.slice(0, 2).toUpperCase()
                                : 'M'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-body-xs font-bold text-foreground leading-none">
                            {typeof reflection.mentorId === 'object' && reflection.mentorId?.name
                              ? reflection.mentorId.name
                              : 'Your Mentor'}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            • Advice
                          </span>
                        </div>
                        <h4 className="text-body-xs font-bold text-foreground">
                          {reflection.mentorFollowup?.nextSessionSuggestion || 'Study Strategy'}
                        </h4>
                        <p className="text-metadata text-muted-foreground font-medium leading-relaxed max-w-xl">
                          {reflection.mentorFollowup?.mentorNotes || 'Complete recommended projects and review steps.'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/sessions`)}
                        className="shrink-0 text-xs font-bold h-9 px-3 rounded-xl hover:border-primary/20 hover:bg-primary/5 gap-1"
                      >
                        <span>View Reflections</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyStateCard
                icon={Sparkles}
                title="No mentor recommendations yet"
                description="Book a verified 1-on-1 session with a professional guide to unlock step suggestions, resources, and custom study plans!"
                action={{
                  label: "Discover Mentors",
                  onClick: () => navigate("/explore")
                }}
              />
            )}
          </DashboardSection>
        </div>

        {/* Right Column (1/3 width) - Lightweight Momentum Section */}
        <div className="space-y-6">
          <DashboardSection
            title="Your Momentum"
            subtitle="Encouraging signals on your path"
          >
            <div className="space-y-5">
              {/* Streak & Reputation Stats */}
              <div className="grid grid-cols-1 gap-4">
                <StatsCard
                  title="Daily commit streak"
                  value={streak > 0 ? `${streak} Days` : '0 Days'}
                  subtitle="Consecutive learning activity"
                  icon={<Flame className="text-orange-500 fill-orange-500/10" />}
                  variant="warning"
                />

                <StatsCard
                  title="Respect Points"
                  value={user?.respectPoints || 0}
                  subtitle="Earned from community help"
                  icon={<Award />}
                  variant="primary"
                />
              </div>

              {/* Peer and Social Momentum Card */}
              <Card className="border border-border/80 rounded-2xl bg-card text-card-foreground shadow-subtle overflow-hidden">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2 select-none">
                    <div className="p-2 bg-primary/5 text-primary rounded-xl">
                      <UsersRound className="h-4 w-4 shrink-0" />
                    </div>
                    <span className="text-body-xs font-bold text-foreground">Peer Momentum</span>
                  </div>

                  {data.roadmapMomentum && data.roadmapMomentum.length > 0 ? (
                    <div className="space-y-3">
                      {data.roadmapMomentum.slice(0, 2).map((item) => (
                        <div key={item.roadmap._id} className="rounded-xl border border-border bg-muted/15 p-3.5 transition-all hover:bg-muted/20">
                          <Link to={`/roadmaps/${item.roadmap.slug}`} className="text-body-xs font-bold text-foreground hover:text-primary leading-snug">
                            {item.roadmap.title}
                          </Link>
                          <p className="text-[11px] text-muted-foreground font-medium mt-1 select-none">
                            🔥 {item.community?.activeLearnerCount || 12} peers are progressing on this path.
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-metadata text-muted-foreground select-none leading-relaxed font-medium">
                      Enroll in structured tracks to see active peer growth indicators.
                    </p>
                  )}

                  {/* Trending Tracks */}
                  {data.trendingRoadmaps && data.trendingRoadmaps.length > 0 && (
                    <div className="space-y-3 border-t border-border/40 pt-4">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1 select-none">
                        <TrendingUp className="h-3.5 w-3.5 text-success shrink-0" />
                        <span>Trending Paths</span>
                      </p>
                      {data.trendingRoadmaps.slice(0, 2).map((item) => (
                        <div key={item.roadmapId} className="flex items-center justify-between gap-3 p-1.5 hover:bg-muted/10 rounded-xl">
                          <div className="min-w-0">
                            <p className="text-body-xs font-bold text-foreground truncate">{item.roadmap.title}</p>
                            <p className="text-[11px] text-muted-foreground font-medium select-none">{item.currentGrowth || 24} new learners this week</p>
                          </div>
                          <Button asChild variant="outline" size="sm" className="h-7.5 text-[10px] font-bold uppercase rounded-lg px-2 shrink-0">
                            <Link to={`/roadmaps/${item.roadmap.slug}`}>Join</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Milestone completions history */}
              {hasActiveRoadmap && (
                <Card className="border border-border/80 rounded-2xl bg-card text-card-foreground shadow-subtle overflow-hidden">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-2 select-none">
                      <div className="p-2 bg-success/5 text-success rounded-xl">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                      </div>
                      <span className="text-body-xs font-bold text-foreground">Recent Completions</span>
                    </div>

                    {recentCompletedSteps.length > 0 ? (
                      <ul className="space-y-3 pt-1">
                        {recentCompletedSteps.map((step: any) => (
                          <li key={step._id} className="flex gap-2.5 items-start text-metadata">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="font-bold text-foreground block truncate leading-tight">{step.title}</span>
                              <span className="text-[11px] text-muted-foreground select-none">Completed step successfully</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-metadata text-muted-foreground select-none leading-relaxed font-medium">
                        Complete required curriculum steps to unlock milestone completions history.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </DashboardSection>
        </div>
      </div>
    </motion.div>
  );
};
