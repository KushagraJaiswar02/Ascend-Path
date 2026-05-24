import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  MessageSquareWarning,
  FileClock,
  Shield,
  Activity,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardSection } from './DashboardSection';
import { useReports, useAuditLogs, usePlatformHealth, useAdminStats } from '../../admin/hooks';

export const ModeratorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats } = useAdminStats();
  const { data: health, isLoading: isHealthLoading } = usePlatformHealth();
  const { data: reportsData, isLoading: isReportsLoading } = useReports({ status: 'pending', limit: 3 });
  const { data: auditData, isLoading: isAuditLoading } = useAuditLogs({ limit: 3 });

  const pct = (value: number) => `${Math.round((value || 0) * 1000) / 10}%`;

  const metricCards = [
    { label: 'Unresolved Reports', value: stats?.pendingReports || 0, icon: MessageSquareWarning, desc: 'Awaiting review' },
    { label: 'Abuse conversion rate', value: pct(health?.reportConversionRate), icon: Activity, desc: 'Report action rate' },
    { label: 'User ban rate', value: pct(health?.banRate), icon: Shield, desc: 'Global platform bans' },
    { label: 'Suspension rate', value: pct(health?.suspensionRate), icon: AlertTriangle, desc: 'Account suspensions' },
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
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-primary/5 to-violet-500/5 rounded-3xl blur-md pointer-events-none" />
        <Card className="border border-border/80 bg-gradient-to-br from-card to-muted/15 p-6 sm:p-8 rounded-3xl shadow-subtle relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                Abuse & safety queue
              </span>
              <h2 className="text-page-title font-bold text-foreground tracking-tight leading-tight sm:text-3xl">
                Trust & Safety Queue
              </h2>
              <p className="text-body-p text-muted-foreground leading-relaxed font-medium max-w-2xl">
                Maintain curriculum integrity, inspect audit history logs, and resolve flagged content.
              </p>
            </div>

            <div className="shrink-0 flex gap-2 flex-wrap">
              <Button
                onClick={() => navigate('/admin/moderation')}
                className="h-10.5 px-4 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl uppercase tracking-wider text-[10px] shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Review Reports</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/audit')}
                className="h-10.5 px-4 border border-border bg-card text-foreground font-bold rounded-xl uppercase tracking-wider text-[10px] hover:bg-muted cursor-pointer"
              >
                <span>Audit Logs</span>
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* ================= PRIMARY TELEMETRY TILES ================= */}
      <DashboardSection title="Moderation Telemetry" subtitle="Real-time safety quotients and queue summaries" accentColor="primary">
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
                    {isHealthLoading ? (
                      <span className="h-8 w-16 bg-muted/60 animate-pulse rounded block" />
                    ) : (
                      metric.value
                    )}
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mt-1.5">{metric.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DashboardSection>

      {/* ================= ASYMMETRIC GRID: REPORTS & AUDIT EVENT TIMELINE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Unresolved Reports Queue */}
        <div className="lg:col-span-2 space-y-6">
          <DashboardSection title="Pending Abuse Reports" subtitle="Review and action incoming flagged content reports">
            <Card className="border border-border/80 shadow-subtle rounded-2xl overflow-hidden bg-card">
              <CardHeader className="p-5 border-b border-border/40 bg-muted/10 flex flex-row items-center justify-between">
                <CardTitle className="text-body-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                  <MessageSquareWarning className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span>Unresolved safety items</span>
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-wider text-primary hover:text-primary/95">
                  <Link to="/admin/moderation">Manage Queue</Link>
                </Button>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {isReportsLoading ? (
                  [1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted/30 rounded-xl animate-pulse" />)
                ) : !reportsData?.reports?.length ? (
                  <div className="text-center py-8 text-muted-foreground font-semibold italic text-body-xs bg-muted/5 border border-dashed border-border rounded-xl">
                    🎉 Excellent! All safety reports have been successfully cleared!
                  </div>
                ) : (
                  reportsData.reports.slice(0, 3).map((report: any) => (
                    <div key={report._id} className="flex justify-between items-center p-4 border border-border/60 bg-card rounded-xl hover:border-border transition gap-sm">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-xs flex-wrap">
                          <span className="text-body-xs font-bold text-foreground capitalize">{report.targetType} Report</span>
                          <Badge variant={report.priority === 'critical' ? 'destructive' : 'secondary'} className="text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-[0.5px]">
                            {report.priority}
                          </Badge>
                        </div>
                        <p className="text-metadata text-muted-foreground font-semibold truncate max-w-sm">
                          Reason: {report.reason} • Reporter: {report.reporterId?.name || 'anonymous'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/moderation')}
                        className="h-8 text-[10px] font-black uppercase tracking-wider rounded-lg shrink-0 gap-xxs"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </DashboardSection>
        </div>

        {/* Right Side: Audit Event Log timelines */}
        <div className="space-y-6">
          <DashboardSection title="Platform Audit Events" subtitle=" priviledged admin activity feed">
            <Card className="border border-border/80 shadow-subtle rounded-2xl overflow-hidden bg-card">
              <CardHeader className="p-5 border-b border-border/40 bg-muted/10">
                <CardTitle className="text-body-xs font-black uppercase tracking-wider text-foreground flex items-center gap-2">
                  <FileClock className="h-4.5 w-4.5 text-primary shrink-0" />
                  <span>Audit Event Log</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3.5">
                {isAuditLoading ? (
                  [1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted/30 rounded-xl animate-pulse" />)
                ) : !auditData?.logs?.length ? (
                  <p className="text-xs text-muted-foreground font-semibold italic">No platform audit logs recorded.</p>
                ) : (
                  auditData.logs.slice(0, 3).map((log: any) => (
                    <div key={log._id} className="text-body-xs font-semibold space-y-1 p-3 border border-border/50 bg-muted/15 rounded-xl">
                      <div className="flex justify-between items-center gap-xs">
                        <span className="font-extrabold text-foreground capitalize bg-muted border border-border px-1.5 py-0.5 rounded leading-none text-[9px] uppercase tracking-wider">
                          {log.action}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-medium shrink-0">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-metadata text-muted-foreground font-medium leading-relaxed">
                        {log.details}
                      </p>
                      <p className="text-[9px] text-muted-foreground/80 font-bold tracking-wide">
                        👤 Actor: {log.actorId?.email || 'system'}
                      </p>
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
