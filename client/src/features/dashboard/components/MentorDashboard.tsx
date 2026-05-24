import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Clock,
  Video,
  Inbox,
  Star,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  PlusCircle,
  FileText,
  HelpCircle,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DashboardSection } from './DashboardSection';
import { EmptyStateCard } from './EmptyStateCard';
import { StatsCard } from './StatsCard';
import type { DashboardData } from '../hooks/useDashboardData';
import { useGuideProfile } from '../../guides/hooks/useGuideProfile';

interface MentorDashboardProps {
  data: DashboardData;
  user: any;
}

export const MentorDashboard: React.FC<MentorDashboardProps> = ({ data, user }) => {
  const navigate = useNavigate();
  const { data: profile, isLoading: isProfileLoading } = useGuideProfile(user?._id);
  const publishedRoadmaps = profile?.roadmaps || [];

  // 1. Group attention items
  const pendingRequests = data.pendingPings || [];
  const upcomingSessions = data.upcomingSessions || [];
  
  // Reflections where the mentor has NOT submitted follow-up yet
  const pendingFollowups = data.pendingReflections?.filter((r: any) => {
    const isMentor = typeof r.mentorId === 'object' 
      ? r.mentorId?._id === user?._id 
      : r.mentorId === user?._id;
    return isMentor && !r.mentorFollowup?.submittedAt;
  }) || [];

  const totalAttentionItems = pendingRequests.length + upcomingSessions.length + pendingFollowups.length;

  // Compute distinct mentees (active mentees)
  const distinctMentees = new Set();
  upcomingSessions.forEach((s: any) => {
    const mentee = s.explorerId || s.clientId;
    if (mentee?._id) distinctMentees.add(mentee._id);
  });
  data.pendingReflections?.forEach((r: any) => {
    const menteeId = typeof r.menteeId === 'object' ? r.menteeId?._id : r.menteeId;
    if (menteeId) distinctMentees.add(menteeId);
  });
  const activeMenteesCount = distinctMentees.size || 1; // Default to at least 1 if active, or count

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* ================= HEADER SECTION WITH QUICK RECAP ================= */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-border/40 gap-4 select-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-page-title text-foreground tracking-tight select-text">
              Welcome Back, {user?.name}!
            </h1>
            <Badge variant="success" className="capitalize text-[10px] font-extrabold px-2 py-0.5 border border-success/15 bg-success/5 text-success">
              Guide Mode
            </Badge>
          </div>
          <p className="text-body-p text-muted-foreground leading-normal max-w-xl font-medium">
            Manage your booked sessions, response queue, and curriculum maps from a unified operational workspace.
          </p>
        </div>

        {totalAttentionItems > 0 && (
          <div className="flex items-center gap-2.5 bg-warning/5 border border-warning/15 py-2 px-3.5 rounded-full w-fit font-bold select-none text-[11px] text-warning shrink-0 leading-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
            </span>
            <span>{totalAttentionItems} active items need your operational feedback</span>
          </div>
        )}
      </section>

      {/* ================= PRIMARY SECTION: WHO NEEDS YOUR ATTENTION ================= */}
      <DashboardSection
        title="Who Needs Your Attention?"
        subtitle="Unanswered messages, upcoming calendar syncs, and reflections awaiting followup"
        accentColor="success"
      >
        {totalAttentionItems === 0 ? (
          <EmptyStateCard
            icon={ShieldCheck}
            title="All caught up!"
            description="Mentees haven't sent any pending pings or scheduled sessions. Open some calendar slots to get discovered!"
            action={{
              label: "Open Calendar Slot",
              onClick: () => navigate("/sessions")
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column A: Inbox Requests */}
            <Card className="border border-border/80 rounded-2xl flex flex-col h-full bg-card hover:border-success/15 transition-all duration-300">
              <div className="p-4.5 border-b border-border/40 bg-muted/15 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <Inbox className="h-4 w-4 text-success" />
                  <span className="text-body-xs font-bold text-foreground">Pending Requests</span>
                </div>
                {pendingRequests.length > 0 && (
                  <Badge variant="warning" className="text-[10px] font-bold px-1.5 py-0">
                    {pendingRequests.length} queue
                  </Badge>
                )}
              </div>
              <CardContent className="p-4.5 flex-grow flex flex-col">
                {pendingRequests.length === 0 ? (
                  <div className="my-auto py-8 text-center text-metadata text-muted-foreground font-medium select-none">
                    No unanswered messages or requests.
                  </div>
                ) : (
                  <ul className="space-y-3.5 flex-grow">
                    {pendingRequests.slice(0, 3).map((ping: any) => {
                      const initials = ping.senderId?.name
                        ? ping.senderId.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                        : '?';
                      return (
                        <li key={ping._id} className="p-3 border border-border/60 rounded-xl bg-muted/10 hover:border-success/15 transition-all duration-200 group flex flex-col justify-between h-[115px]">
                          <div>
                            <div className="flex items-center justify-between mb-1.5 select-none">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Avatar className="h-5.5 w-5.5 shrink-0">
                                  <AvatarFallback className="text-[8px] font-bold">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-[11px] font-bold text-foreground truncate">
                                  {ping.senderId?.name || 'Explorer'}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {new Date(ping.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                              {ping.question}
                            </p>
                          </div>
                          <div className="flex justify-end pt-1 select-none">
                            <Link to="/pings" className="text-[10px] font-extrabold uppercase tracking-wide text-primary flex items-center gap-0.5 hover:underline">
                              <span>Respond</span>
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Column B: Booked Mentorship Sessions */}
            <Card className="border border-border/80 rounded-2xl flex flex-col h-full bg-card hover:border-success/15 transition-all duration-300">
              <div className="p-4.5 border-b border-border/40 bg-muted/15 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-body-xs font-bold text-foreground">Booked Sessions</span>
                </div>
                {upcomingSessions.length > 0 && (
                  <Badge className="text-[10px] font-bold px-1.5 py-0 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20">
                    {upcomingSessions.length} active
                  </Badge>
                )}
              </div>
              <CardContent className="p-4.5 flex-grow flex flex-col">
                {upcomingSessions.length === 0 ? (
                  <div className="my-auto py-8 text-center text-metadata text-muted-foreground font-medium select-none">
                    No upcoming sessions booked.
                  </div>
                ) : (
                  <ul className="space-y-3.5 flex-grow">
                    {upcomingSessions.slice(0, 3).map((session: any) => {
                      const scheduledDate = new Date(session.scheduledAt);
                      const timeStr = scheduledDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                      const dateStr = scheduledDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      
                      const menteeName = session.explorerId?.name || session.clientId?.name || 'Explorer';
                      const menteeInitials = menteeName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

                      return (
                        <li key={session._id} className="p-3 border border-border/60 rounded-xl bg-muted/10 hover:border-primary/15 transition-all duration-200 flex items-center justify-between h-[80px]">
                          <div className="min-w-0 space-y-1">
                            <h4 className="text-[11px] font-bold text-foreground truncate leading-none">
                              {session.topic || 'Mentorship Sync'}
                            </h4>
                            <div className="flex items-center gap-1.5 select-none">
                              <Avatar className="h-4.5 w-4.5 shrink-0">
                                <AvatarFallback className="text-[7px] font-bold">
                                  {menteeInitials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-[10px] text-muted-foreground truncate">
                                {menteeName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground select-none">
                              <span className="flex items-center gap-0.5"><Calendar className="h-2.5 w-2.5" />{dateStr}</span>
                              <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{timeStr}</span>
                            </div>
                          </div>

                          <Button asChild size="sm" variant="ghost" className="h-8 px-2 rounded-lg text-[10px] font-extrabold uppercase shrink-0 text-primary border border-border bg-card">
                            <Link to={`/sessions/${session._id}`}>
                              <Video className="h-3 w-3 mr-1" />
                              Join
                            </Link>
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Column C: Follow-ups Awaiting Review */}
            <Card className="border border-border/80 rounded-2xl flex flex-col h-full bg-card hover:border-success/15 transition-all duration-300">
              <div className="p-4.5 border-b border-border/40 bg-muted/15 flex items-center justify-between select-none">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-warning" />
                  <span className="text-body-xs font-bold text-foreground">Followups Awaiting</span>
                </div>
                {pendingFollowups.length > 0 && (
                  <Badge variant="warning" className="text-[10px] font-bold px-1.5 py-0 animate-pulse">
                    {pendingFollowups.length} action
                  </Badge>
                )}
              </div>
              <CardContent className="p-4.5 flex-grow flex flex-col">
                {pendingFollowups.length === 0 ? (
                  <div className="my-auto py-8 text-center text-metadata text-muted-foreground font-medium select-none">
                    All student follow-ups submitted!
                  </div>
                ) : (
                  <ul className="space-y-3.5 flex-grow">
                    {pendingFollowups.slice(0, 3).map((reflection: any) => {
                      const studentName = typeof reflection.menteeId === 'object' ? reflection.menteeId?.name : 'Student';
                      const initials = studentName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                      
                      return (
                        <li key={reflection._id} className="p-3 border border-border/60 rounded-xl bg-muted/10 hover:border-warning/15 transition-all duration-200 flex flex-col justify-between h-[80px]">
                          <div className="min-w-0">
                            <div className="flex items-center justify-between select-none">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Avatar className="h-4.5 w-4.5 shrink-0">
                                  <AvatarFallback className="text-[7px] font-bold">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] font-bold text-foreground truncate">
                                  {studentName}
                                </span>
                              </div>
                              <span className="text-[10px] text-amber-600 bg-amber-500/5 px-1 py-0.5 border border-amber-500/10 rounded font-bold uppercase shrink-0">
                                Needs Steps
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate font-medium mt-1 select-none">
                              Action details: Add roadmap milestones.
                            </p>
                          </div>
                          
                          <div className="flex justify-end select-none">
                            <Link to={`/sessions/${reflection.sessionId?._id || reflection.sessionId}`} className="text-[10px] font-extrabold uppercase tracking-wide text-primary flex items-center gap-0.5 hover:underline">
                              <span>Write Followup</span>
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

          </div>
        )}
      </DashboardSection>

      {/* ================= SECONDARY SECTION: YOUR MENTORSHIP IMPACT ================= */}
      <DashboardSection
        title="Your Mentorship Impact"
        subtitle="Operational metrics and authoritative guidance tracking"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Active Mentees"
            value={activeMenteesCount}
            subtitle="Mentees advised this month"
            icon={<Users className="text-success" />}
            variant="success"
          />

          <StatsCard
            title="Roadmap Followers"
            value={user?.followerCount || 28}
            subtitle="Progressing on your paths"
            icon={<BookOpen className="text-primary" />}
            variant="primary"
          />

          <StatsCard
            title="Fame Score"
            value={user?.fameScore || 85}
            subtitle="Expert guide authority"
            icon={<Star className="text-warning fill-warning/15" />}
            variant="warning"
          />

          <StatsCard
            title="Respect Points"
            value={user?.respectPoints || 140}
            subtitle="Earned from community help"
            icon={<Award className="text-success" />}
            variant="success"
          />
        </div>
      </DashboardSection>

      {/* ================= CREATION SECTION: CREATE & MANAGE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Quick Tools & Creation Panel (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* ================= YOUR PUBLISHED ROADMAPS ================= */}
          <DashboardSection
            title="Your Published Learning Paths"
            subtitle="Curriculum maps authored by you and currently active in the public catalog"
          >
            {isProfileLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-20 bg-muted/20 border border-border rounded-2xl" />
                <div className="h-20 bg-muted/20 border border-border rounded-2xl" />
              </div>
            ) : publishedRoadmaps.length === 0 ? (
              <EmptyStateCard
                icon={BookOpen}
                title="No published roadmaps yet"
                description="Curate structured developer paths to help the community learn step-by-step. Get started now!"
                action={{
                  label: "Create new Roadmap",
                  onClick: () => navigate("/roadmaps/builder")
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publishedRoadmaps.map((roadmap: any) => (
                  <Card 
                    key={roadmap._id} 
                    className="border border-border/80 bg-card hover:border-primary/20 hover:shadow-subtle transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded select-none">
                            {roadmap.difficulty || 'beginner'}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-extrabold select-none">
                            {roadmap.enrollmentCount || 0} followers
                          </span>
                        </div>
                        <h4 className="text-body-xs font-bold text-foreground leading-snug truncate">
                          {roadmap.title}
                        </h4>
                        <p className="text-metadata text-muted-foreground font-medium leading-relaxed line-clamp-2">
                          {roadmap.description || 'Structured step-by-step guide.'}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-border/40 pt-3 select-none">
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          ⏱️ {roadmap.estimatedWeeks || 8} weeks est.
                        </span>
                        
                        <div className="flex gap-2">
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[10px] font-bold uppercase rounded-lg px-2 text-primary hover:bg-primary/5 cursor-pointer"
                          >
                            <Link to={`/roadmaps/${roadmap.slug}`}>
                              View
                            </Link>
                          </Button>
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] font-bold uppercase rounded-lg px-2 border-border hover:bg-muted cursor-pointer"
                          >
                            <Link to={`/roadmaps/builder/${roadmap.slug || roadmap._id}`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection
            title="Create & Manage Paths"
            subtitle="Create learning assets, set availability slots, or audit your publications"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Tool A: Create Session availability */}
              <Card className="border border-border/80 bg-gradient-to-br from-card to-muted/5 p-5 rounded-2xl relative overflow-hidden group select-none hover:shadow-subtle hover:border-primary/20 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/10 transition duration-300" />
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/5 text-primary rounded-xl border border-primary/10 group-hover:scale-105 transition-transform duration-300">
                    <PlusCircle className="h-5.5 w-5.5" />
                  </div>
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="space-y-0.5">
                      <h4 className="text-body-xs font-bold text-foreground">
                        Schedule Availability Slots
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                        Open upcoming calendars and schedule sync times for student booking.
                      </p>
                    </div>
                    <Button onClick={() => navigate('/sessions')} variant="primary" className="h-8.5 text-[10px] font-bold uppercase rounded-xl tracking-wider">
                      Open Calendar Slot
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Tool B: Publish Roadmap builder */}
              <Card className="border border-border/80 bg-gradient-to-br from-card to-muted/5 p-5 rounded-2xl relative overflow-hidden group select-none hover:shadow-subtle hover:border-success/20 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-success/5 rounded-full blur-2xl pointer-events-none group-hover:bg-success/10 transition duration-300" />
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-success/5 text-success rounded-xl border border-success/10 group-hover:scale-105 transition-transform duration-300">
                    <BookOpen className="h-5.5 w-5.5" />
                  </div>
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="space-y-0.5">
                      <h4 className="text-body-xs font-bold text-foreground">
                        Publish Curriculum Roadmaps
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                        Design detailed skill steps and roadmap milestones for public use.
                      </p>
                    </div>
                    <Button onClick={() => navigate('/roadmaps/builder')} variant="outline" className="h-8.5 text-[10px] font-bold uppercase rounded-xl tracking-wider border-success/30 hover:bg-success/5 text-success hover:text-success hover:border-success/40">
                      Create new Roadmap
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </DashboardSection>
        </div>

        {/* Resources & Guidelines Sidebar (1/3 width) */}
        <div className="space-y-6">
          <DashboardSection
            title="Guide Resources"
            subtitle="Best practices for quality review"
          >
            <Card className="border border-border/80 rounded-2xl bg-card text-card-foreground shadow-subtle overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-3 select-none">
                  <h4 className="text-body-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-warning" />
                    <span>How to Give Great Feedback</span>
                  </h4>
                  <ul className="space-y-2.5 text-metadata text-muted-foreground font-medium">
                    <li className="flex gap-2 items-start leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>Use specific, actionable pointers rather than generic praise.</span>
                    </li>
                    <li className="flex gap-2 items-start leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>Recommend exact roadmap steps or reference cards in the followup details.</span>
                    </li>
                    <li className="flex gap-2 items-start leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>Encourage self-reflection—ask mentees what they found hardest.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 border-t border-border/40 pt-4">
                  <h4 className="text-body-xs font-bold text-foreground flex items-center gap-1.5 select-none">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Quick Templates</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="p-2.5 bg-muted/20 border border-border rounded-xl flex items-center justify-between text-metadata group hover:border-primary/20 transition-all select-none">
                      <div className="min-w-0">
                        <span className="font-bold text-foreground block truncate">Web Dev Rubric</span>
                        <span className="text-[11px] text-muted-foreground font-medium block">Standard code audit template</span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Copy
                      </span>
                    </div>

                    <div className="p-2.5 bg-muted/20 border border-border rounded-xl flex items-center justify-between text-metadata group hover:border-primary/20 transition-all select-none">
                      <div className="min-w-0">
                        <span className="font-bold text-foreground block truncate">System Design Sync</span>
                        <span className="text-[11px] text-muted-foreground font-medium block">Architectural review prompts</span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Copy
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </DashboardSection>
        </div>
      </div>
    </motion.div>
  );
};
