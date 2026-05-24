import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  GitBranch,
  CalendarCheck,
  MessageSquareWarning,
  Users,
  Star,
  Activity,
  TrendingUp,
  ShieldAlert,
  Server
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardSection } from './DashboardSection';
import { useAdminStats, useAdminAnalytics, usePlatformHealth } from '../../admin/hooks';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: isStatsLoading } = useAdminStats();
  const { data: analytics, isLoading: isAnalyticsLoading } = useAdminAnalytics();
  const { data: health, isLoading: isHealthLoading } = usePlatformHealth();

  const pct = (value: number) => `${Math.round((value || 0) * 1000) / 10}%`;

  const metricCards = [
    { label: 'Daily Active Users', value: stats?.activeToday, icon: Users, desc: 'Users active today' },
    { label: 'Roadmap Enrollments', value: analytics?.roadmapEnrollmentsLast30Days, icon: GitBranch, desc: 'In the last 30 days' },
    { label: 'Session Bookings', value: analytics?.sessionBookingsLast30Days, icon: CalendarCheck, desc: 'In the last 30 days' },
    { label: 'Pending Reports', value: stats?.pendingReports, icon: MessageSquareWarning, desc: 'Awaiting moderation' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8 select-none"
    >
      {/* ================= HERO SECTION ================= */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-violet-500/5 to-primary/5 rounded-3xl blur-md pointer-events-none" />
        <Card className="border border-border/80 bg-gradient-to-br from-card to-muted/15 p-6 sm:p-8 rounded-3xl shadow-subtle relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                Strategic platform control
              </span>
              <h2 className="text-page-title font-bold text-foreground tracking-tight leading-tight sm:text-3xl">
                Platform Overview Snapshot
              </h2>
              <p className="text-body-p text-muted-foreground leading-relaxed font-medium max-w-2xl">
                Monitor system operations, growth telemetry, health metrics, and catalog oversight.
              </p>
            </div>

            <div className="shrink-0 flex gap-2 flex-wrap">
              <Button
                onClick={() => navigate('/admin/health')}
                className="h-10.5 px-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl uppercase tracking-wider text-[10px] shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Server className="h-4 w-4" />
                <span>System Status</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/users')}
                className="h-10.5 px-4 border border-border bg-card text-foreground font-bold rounded-xl uppercase tracking-wider text-[10px] hover:bg-muted cursor-pointer"
              >
                <span>Users Control</span>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* ================= MAIN METRICS GRID ================= */}
      <DashboardSection title="Core Growth Telemetry" subtitle="Platform metrics for active cohorts and student interactions" accentColor="primary">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className="border border-border/80 shadow-subtle hover:border-border transition rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5 bg-muted/10">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{metric.label}</CardTitle>
                  <Icon className="h-4.5 w-4.5 text-primary shrink-0" />
                </CardHeader>
                <CardContent className="p-5">
                  <div className="text-3xl font-black text-foreground">
                    {isStatsLoading || isAnalyticsLoading ? (
                      <span className="h-8 w-16 bg-muted/60 animate-pulse rounded block" />
                    ) : (
                      metric.value ?? '0'
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mt-1.5">{metric.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DashboardSection>

      {/* ================= TWO COLUMN ANALYTICS SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Columns - Growth & Abuse Signals */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardSection title="Operations Analytics" subtitle="Signal analysis for platform growth vectors and abuse monitoring">
            <Card className="border border-border/80 shadow-subtle rounded-2xl overflow-hidden bg-card">
              <CardHeader className="p-5 border-b border-border/40 bg-muted/10">
                <CardTitle className="text-body-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span>Growth and Abuse Telemetry</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span>User Registration Growth</span>
                  </h3>
                  <div className="space-y-2">
                    {isAnalyticsLoading ? (
                      [1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted/30 rounded-xl animate-pulse" />)
                    ) : !analytics?.growth?.length ? (
                      <p className="text-xs text-muted-foreground font-semibold italic">No growth signal data recorded yet.</p>
                    ) : (
                      analytics.growth.slice(-5).map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between rounded-xl border border-border/50 px-3.5 py-2.5 text-body-xs font-semibold">
                          <span className="truncate text-muted-foreground">{item.date}</span>
                          <span className="font-extrabold text-foreground">{item.count} users</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1">
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                    <span>Abuse Spike Activity</span>
                  </h3>
                  <div className="space-y-2">
                    {isAnalyticsLoading ? (
                      [1, 2, 3].map((i) => <div key={i} className="h-10 bg-muted/30 rounded-xl animate-pulse" />)
                    ) : !analytics?.abuseSpikes?.length ? (
                      <p className="text-xs text-muted-foreground font-semibold italic">No abuse or threat indicators present.</p>
                    ) : (
                      analytics.abuseSpikes.slice(-5).map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between rounded-xl border border-border/50 px-3.5 py-2.5 text-body-xs font-semibold">
                          <span className="truncate text-muted-foreground capitalize">{item.reason || 'Reports'}</span>
                          <span className="font-extrabold text-destructive bg-destructive/5 px-2 py-0.5 rounded border border-destructive/10">{item.count} events</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </DashboardSection>
        </div>

        {/* Right Sidebar - Platform Health & Top Mentors */}
        <div className="space-y-6">
          <DashboardSection title="Platform Trust Rates" subtitle="Operations sanity metrics">
            <Card className="border border-border/80 shadow-subtle rounded-2xl overflow-hidden bg-card">
              <CardHeader className="p-5 border-b border-border/40 bg-muted/10">
                <CardTitle className="text-body-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span>Trust & Safety Percentages</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3.5">
                {isHealthLoading ? (
                  [1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted/30 rounded-xl animate-pulse" />)
                ) : (
                  <>
                    <div className="flex justify-between items-center text-body-xs font-semibold">
                      <span className="text-muted-foreground">Abuse report action rate</span>
                      <span className="font-extrabold text-emerald-600 bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded">
                        {pct(health?.reportConversionRate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-body-xs font-semibold">
                      <span className="text-muted-foreground">User suspension rate</span>
                      <span className="font-extrabold text-amber-600 bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded">
                        {pct(health?.suspensionRate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-body-xs font-semibold">
                      <span className="text-muted-foreground">User ban rate</span>
                      <span className="font-extrabold text-red-600 bg-red-500/5 px-2 py-0.5 border border-red-500/10 rounded">
                        {pct(health?.banRate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-body-xs font-semibold">
                      <span className="text-muted-foreground">Average Guide rating</span>
                      <span className="font-extrabold text-primary bg-primary/5 px-2 py-0.5 border border-primary/10 rounded flex items-center gap-0.5">
                        <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                        <span>{(health?.averageGuideRating || 0).toFixed(2)}</span>
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </DashboardSection>

          {/* Top Curators */}
          <DashboardSection title="Top Performing Mentors" subtitle="Most active guides">
            <Card className="border border-border/80 shadow-subtle rounded-2xl overflow-hidden bg-card">
              <CardHeader className="p-5 border-b border-border/40 bg-muted/10">
                <CardTitle className="text-body-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                  <Star className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span>Leaderboard mentors</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3.5">
                {isAnalyticsLoading ? (
                  [1, 2, 3].map((i) => <div key={i} className="h-8 bg-muted/30 rounded-xl animate-pulse" />)
                ) : !analytics?.topMentors?.length ? (
                  <p className="text-xs text-muted-foreground font-semibold italic">No active mentors logged.</p>
                ) : (
                  analytics.topMentors.slice(0, 4).map((mentor: any, idx: number) => (
                    <div key={mentor._id} className="flex items-center justify-between gap-3 text-body-xs font-semibold">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-black text-muted-foreground">#{idx + 1}</span>
                        <span className="truncate text-foreground font-bold">{mentor.name}</span>
                      </div>
                      <span className="text-muted-foreground flex items-center gap-0.5 shrink-0 font-bold">
                        <span>Fame:</span>
                        <span className="text-primary">{mentor.fameScore}</span>
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </DashboardSection>
        </div>

      </div>

    </motion.div>
  );
};
