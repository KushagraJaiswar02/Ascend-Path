import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  MessageCircle,
  Plus,
  Bell,
  CheckCircle2,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useUpdateApplication, useAddReminder } from '../api';
import type { Application, ApplicationStatus } from '../types';
import { usePortfolioProjects, useAchievements } from '../../credibility/hooks/useCredibility';

interface ApplicationTrackerBoardProps {
  applications: Application[];
  onRefresh: () => void;
}

const COLUMNS: { label: string; status: ApplicationStatus; color: string; bg: string }[] = [
  { label: 'Applied', status: 'applied', color: 'text-primary border-primary/20', bg: 'bg-primary/5' },
  { label: 'Shortlisted', status: 'shortlisted', color: 'text-indigo-500 border-indigo-500/20', bg: 'bg-indigo-500/5' },
  { label: 'Interviewing', status: 'interviewing', color: 'text-warning border-warning/20', bg: 'bg-warning/5' },
  { label: 'Accepted', status: 'accepted', color: 'text-success border-success/20', bg: 'bg-success/5' },
  { label: 'Rejected', status: 'rejected', color: 'text-destructive border-destructive/20', bg: 'bg-destructive/5' },
  { label: 'Archived', status: 'archived', color: 'text-muted-foreground border-border/20', bg: 'bg-muted/15' },
];

export const ApplicationTrackerBoard: React.FC<ApplicationTrackerBoardProps> = ({
  applications,
  onRefresh,
}) => {
  const updateApp = useUpdateApplication();
  const addReminder = useAddReminder();

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Edit fields
  const [notes, setNotes] = useState('');
  const [mentorGuidance, setMentorGuidance] = useState('');
  const [interviewReflections, setInterviewReflections] = useState('');
  const [connectedProjects, setConnectedProjects] = useState<string[]>([]);
  const [connectedAchievements, setConnectedAchievements] = useState<string[]>([]);

  // Fetch projects and achievements for the selected user
  const { data: userProjects = [] } = usePortfolioProjects(selectedApp?.userId || '');
  const { data: userAchievements = [] } = useAchievements(selectedApp?.userId || '');

  // Reminder fields
  const [reminderNote, setReminderNote] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  const handleOpenDetails = (app: Application) => {
    setSelectedApp(app);
    setNotes(app.notes || '');
    setMentorGuidance(app.mentorGuidance || '');
    setInterviewReflections(app.interviewReflections || '');
    setConnectedProjects(app.connectedProjects?.map((p) => p._id) || []);
    setConnectedAchievements(app.connectedAchievements?.map((a) => a._id) || []);
    setReminderNote('');
    setReminderDate('');
    setIsDetailsOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedApp) return;
    try {
      await updateApp.mutateAsync({
        appId: selectedApp._id,
        notes,
        mentorGuidance,
        interviewReflections,
        connectedProjects,
        connectedAchievements,
      });
      setIsDetailsOpen(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (app: Application, nextStatus: ApplicationStatus) => {
    try {
      await updateApp.mutateAsync({
        appId: app._id,
        status: nextStatus,
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddReminder = async () => {
    if (!selectedApp || !reminderDate || !reminderNote) return;
    try {
      await addReminder.mutateAsync({
        appId: selectedApp._id,
        date: new Date(reminderDate),
        note: reminderNote,
      });
      // Refresh local copy
      const updatedReminders = [
        ...(selectedApp.reminders || []),
        { date: new Date(reminderDate).toISOString(), note: reminderNote, sent: false },
      ];
      setSelectedApp({ ...selectedApp, reminders: updatedReminders as any });
      setReminderNote('');
      setReminderDate('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Grid columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colApps = applications.filter((app) => app.status === col.status);

          return (
            <div
              key={col.status}
              className={`flex flex-col gap-4 p-4.5 rounded-2xl ${col.bg} border border-border/40 min-h-[450px] shrink-0 min-w-[200px]`}
            >
              {/* Header column title */}
              <div className="flex justify-between items-center select-none pb-2 border-b border-border/30">
                <span className={`text-xs font-extrabold uppercase tracking-widest ${col.color}`}>
                  {col.label}
                </span>
                <Badge variant="outline" className="text-[10px] font-bold px-2 rounded-full border-border/65">
                  {colApps.length}
                </Badge>
              </div>

              {/* Items list */}
              <div className="flex-grow space-y-3.5 overflow-y-auto max-h-[500px] pr-0.5">
                {colApps.map((app) => {
                  const opp = app.opportunityId;
                  if (!opp) return null;

                  return (
                    <Card
                      key={app._id}
                      className="border border-border/80 bg-card hover:border-primary/20 hover:shadow-subtle transition-all duration-300 rounded-xl overflow-hidden cursor-pointer"
                      onClick={() => handleOpenDetails(app)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="space-y-1">
                          <h5 className="text-body-xs font-bold text-foreground leading-snug line-clamp-1">
                            {opp.title}
                          </h5>
                          <p className="text-[10px] font-semibold text-muted-foreground truncate leading-none">
                            {opp.organizationName}
                          </p>
                        </div>

                        {/* Summary indicators */}
                        <div className="flex gap-2 text-metadata text-muted-foreground font-semibold border-t border-border/35 pt-2">
                          {app.reminders && app.reminders.length > 0 && (
                            <div className="flex items-center gap-0.5 text-warning" title="Reminders active">
                              <Bell className="h-3 w-3" />
                              <span className="text-[10px]">{app.reminders.length}</span>
                            </div>
                          )}
                          {app.notes && (
                            <div className="flex items-center gap-0.5 text-primary" title="Has notes">
                              <FileText className="h-3 w-3" />
                            </div>
                          )}
                          {app.mentorGuidance && (
                            <div className="flex items-center gap-0.5 text-indigo-500" title="Has mentor guidance">
                              <MessageCircle className="h-3 w-3" />
                            </div>
                          )}
                        </div>

                        {/* Status fast switcher */}
                        <div className="flex justify-end gap-1.5 pt-2 select-text" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app, e.target.value as ApplicationStatus)}
                            className="text-[10px] font-bold border border-border/60 bg-muted/20 hover:bg-muted/40 rounded px-1.5 py-0.5 outline-none text-foreground"
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.status} value={c.status}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {colApps.length === 0 && (
                  <div className="h-28 border border-dashed border-border/40 rounded-xl flex items-center justify-center text-center p-3 select-none">
                    <p className="text-[11px] text-muted-foreground font-medium">
                      No tracked roles
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Details editor dialog modal */}
      {selectedApp && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border bg-card">
            <DialogHeader className="pb-3 border-b border-border/40">
              <DialogTitle className="text-body-lg font-extrabold text-foreground leading-snug">
                Application Detail Tracking
              </DialogTitle>
              <DialogDescription className="text-metadata text-muted-foreground font-semibold">
                "{selectedApp.opportunityId?.title}" at {selectedApp.opportunityId?.organizationName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Application Details split grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Notes Column */}
                <div className="space-y-2">
                  <label className="text-body-xs font-bold text-foreground">
                    Personal Application Notes
                  </label>
                  <Textarea
                    placeholder="Enter application deadlines, resume variations, or links..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] text-xs"
                  />
                </div>

                {/* Interview Reflections Column */}
                <div className="space-y-2">
                  <label className="text-body-xs font-bold text-foreground">
                    Interview Reflections
                  </label>
                  <Textarea
                    placeholder="Log question details, coding challenges, behavioral feedback..."
                    value={interviewReflections}
                    onChange={(e) => setInterviewReflections(e.target.value)}
                    className="min-h-[100px] text-xs"
                  />
                </div>
              </div>

              {/* Mentor guidance row */}
              <div className="space-y-2">
                <label className="text-body-xs font-bold text-foreground flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-indigo-500 shrink-0" />
                  <span>Mentor Guidance & Preparation Notes</span>
                </label>
                <Textarea
                  placeholder="Record roadmap suggestions or mock feedback detailed by your guides..."
                  value={mentorGuidance}
                  onChange={(e) => setMentorGuidance(e.target.value)}
                  className="min-h-[80px] text-xs"
                />
              </div>

              {/* Capability & Outcomes Proof Linking section */}
              <div className="space-y-4 bg-muted/10 border border-border/40 p-4 rounded-2xl">
                <div>
                  <h4 className="text-body-xs font-extrabold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    <span>Link Verified Proof of Capabilities</span>
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-0.5">
                    Connect relevant projects or achievements to this application to verify capability claims and dynamically boost your readiness score.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Portfolio Projects Multi-select Column */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                      Portfolio Projects
                    </label>
                    <div className="border border-border/50 rounded-xl p-2.5 max-h-36 overflow-y-auto space-y-1.5 bg-card">
                      {userProjects.map((proj) => {
                        const isChecked = connectedProjects.includes(proj._id);
                        return (
                          <label key={proj._id} className="flex items-start gap-2 text-xs font-semibold cursor-pointer select-none text-foreground/80 hover:text-foreground">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setConnectedProjects(connectedProjects.filter((id) => id !== proj._id));
                                } else {
                                  setConnectedProjects([...connectedProjects, proj._id]);
                                }
                              }}
                              className="mt-0.5 shrink-0 rounded border-border"
                            />
                            <div className="min-w-0">
                              <span className="truncate block">{proj.title}</span>
                              {proj.isMentorReviewed && (
                                <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.2 rounded-full mt-0.5">
                                  <CheckCircle2 className="h-2 w-2" /> Mentor Verified
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                      {userProjects.length === 0 && (
                        <p className="text-[10px] text-muted-foreground font-medium italic text-center py-4">
                          No portfolio projects found.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Verified Achievements Multi-select Column */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                      Credentials & Milestones
                    </label>
                    <div className="border border-border/50 rounded-xl p-2.5 max-h-36 overflow-y-auto space-y-1.5 bg-card">
                      {userAchievements.map((ach) => {
                        const isChecked = connectedAchievements.includes(ach._id);
                        return (
                          <label key={ach._id} className="flex items-start gap-2 text-xs font-semibold cursor-pointer select-none text-foreground/80 hover:text-foreground">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setConnectedAchievements(connectedAchievements.filter((id) => id !== ach._id));
                                } else {
                                  setConnectedAchievements([...connectedAchievements, ach._id]);
                                }
                              }}
                              className="mt-0.5 shrink-0 rounded border-border"
                            />
                            <div className="min-w-0">
                              <span className="truncate block flex items-center gap-1">
                                <Award className="h-3 w-3 text-warning shrink-0" />
                                {ach.title}
                              </span>
                              <span className="text-[9px] text-muted-foreground capitalize mt-0.5 block">
                                {ach.type} · {ach.category.replace('_', ' ')}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                      {userAchievements.length === 0 && (
                        <p className="text-[10px] text-muted-foreground font-medium italic text-center py-4">
                          No achievements earned yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-border/40" />

              {/* Reminders system */}
              <div className="space-y-4">
                <h4 className="text-body-xs font-extrabold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-warning shrink-0" />
                  <span>Application Calendar Reminders</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                      Reminder Date
                    </label>
                    <Input
                      type="datetime-local"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                      Note
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Interview prep, follow up email, submission deadline..."
                        value={reminderNote}
                        onChange={(e) => setReminderNote(e.target.value)}
                        className="h-9 text-xs flex-grow"
                      />
                      <Button
                        type="button"
                        onClick={handleAddReminder}
                        variant="outline"
                        className="h-9 font-bold px-3 text-xs shrink-0 cursor-pointer"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Reminders List */}
                <div className="space-y-2">
                  {selectedApp.reminders && selectedApp.reminders.length > 0 ? (
                    <div className="max-h-36 overflow-y-auto space-y-1.5 border border-border/45 rounded-xl p-3 bg-muted/10">
                      {selectedApp.reminders.map((rem, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-metadata border-b border-border/25 pb-1.5 last:border-b-0 last:pb-0"
                        >
                          <span className="font-semibold text-foreground">{rem.note}</span>
                          <span className="text-[10px] text-muted-foreground">
                            📅 {new Date(rem.date).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-metadata text-muted-foreground font-medium">
                      No reminders registered yet.
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom CTAs */}
              <div className="flex justify-end gap-2 border-t border-border/40 pt-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                  className="h-10 text-xs font-bold px-4 rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveChanges}
                  className="h-10 text-xs font-bold px-5 rounded-xl bg-primary text-white hover:bg-primary/95 cursor-pointer"
                >
                  Save Tracking Info
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
