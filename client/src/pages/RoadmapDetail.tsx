import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ReportModal } from '@/features/moderation/components/ReportModal';
import {
  useRoadmap,
  useMyRoadmapProgress,
  useEnrollInRoadmap,
  useToggleStepComplete,
  useToggleStepUncomplete,
  useUpdateProgressDetails,
} from '../features/roadmaps/hooks/useRoadmapProgress';
import { useRoadmapCommunity } from '../features/roadmaps/hooks/useRoadmapCommunity';
import { ProgressOverview } from '../features/roadmaps/components/ProgressOverview';
import { RoadmapTimeline } from '../features/roadmaps/components/RoadmapTimeline';
import { EnrollmentCTA } from '../features/roadmaps/components/EnrollmentCTA';
import { CommunityProgressIndicator } from '../features/roadmaps/components/CommunityProgressIndicator';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, AlertCircle, Award, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export const RoadmapDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [togglingStepId, setTogglingStepId] = useState<string | undefined>(undefined);
  const [reportOpen, setReportOpen] = useState(false);

  // 1. Fetch complete roadmap tree (slug or ObjectId lookup)
  const { data: roadmap, isLoading: isRoadmapLoading, isError: isRoadmapError } = useRoadmap(id || '');

  // 2. Fetch active learner enrollment progress
  const {
    data: progress,
  } = useMyRoadmapProgress(roadmap?._id || '', !!roadmap?._id);
  const { data: community } = useRoadmapCommunity(roadmap?._id);

  // Mutations
  const enrollMutation = useEnrollInRoadmap();
  const completeMutation = useToggleStepComplete();
  const uncompleteMutation = useToggleStepUncomplete();
  const updateProgressDetailsMutation = useUpdateProgressDetails();

  if (isRoadmapLoading) {
    return (
      <PageContainer size="default" className="space-y-md py-10 animate-pulse">
        <div className="h-6 w-24 bg-muted rounded" />
        <div className="h-40 w-full bg-muted rounded-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-md">
          <div className="lg:col-span-2 space-y-sm">
            <div className="h-14 w-full bg-muted rounded-2xl" />
            <div className="h-14 w-full bg-muted rounded-2xl" />
          </div>
          <div className="h-60 bg-muted rounded-2xl" />
        </div>
      </PageContainer>
    );
  }

  if (isRoadmapError || !roadmap) {
    return (
      <PageContainer size="default" className="flex items-center justify-center min-h-[60vh] py-10">
        <Card className="max-w-md w-full border-destructive/20 bg-destructive/5 text-center shadow-subtle rounded-3xl">
          <CardContent className="p-8 flex flex-col items-center gap-md select-none">
            <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-body-md font-black text-foreground mb-xxs">Curriculum Not Found</h3>
              <p className="text-muted-foreground text-body-xs leading-relaxed font-semibold">
                The requested study map does not exist or has been retracted by its creator.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/explore')}
              className="gap-xxs font-bold mt-xs border-border text-foreground hover:bg-muted cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Discovery</span>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const isEnrolled = !!progress;
  const completedSteps = progress?.completedSteps || [];
  const bookmarkedSteps = progress?.bookmarkedSteps || [];
  
  // Format Map or Record of notes to a standard JS Object for easier component processing
  let notesRecord: Record<string, string> = {};
  if (progress?.notes) {
    if (progress.notes instanceof Map) {
      progress.notes.forEach((val: string, key: string) => {
        notesRecord[key] = val;
      });
    } else {
      notesRecord = progress.notes as Record<string, string>;
    }
  }

  // Count total required steps across curriculum sections
  const requiredSteps = roadmap.sections?.flatMap((s: any) => s.steps || []).filter((step: any) => !step.isOptional) || [];
  const totalRequiredSteps = requiredSteps.length;
  const completedRequiredSteps = requiredSteps.filter((step: any) => completedSteps.includes(step._id.toString())).length;

  const handleEnroll = () => {
    enrollMutation.mutate(roadmap._id);
  };

  const handleToggleComplete = async (stepId: string) => {
    if (!isEnrolled) return;
    setTogglingStepId(stepId);
    try {
      const isCurrentlyCompleted = completedSteps.includes(stepId);
      if (isCurrentlyCompleted) {
        await uncompleteMutation.mutateAsync({ stepId, roadmapId: roadmap._id });
      } else {
        await completeMutation.mutateAsync({ stepId, roadmapId: roadmap._id });
      }
    } catch (err) {
      console.error('Failed to toggle completion status:', err);
    } finally {
      setTogglingStepId(undefined);
    }
  };

  const handleToggleBookmark = async (stepId: string) => {
    if (!isEnrolled) return;
    const isCurrentlyBookmarked = bookmarkedSteps.includes(stepId);
    let updatedBookmarks = [...bookmarkedSteps];
    if (isCurrentlyBookmarked) {
      updatedBookmarks = updatedBookmarks.filter((id) => id !== stepId);
    } else {
      updatedBookmarks.push(stepId);
    }

    try {
      await updateProgressDetailsMutation.mutateAsync({
        roadmapId: roadmap._id,
        bookmarkedSteps: updatedBookmarks,
      });
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleSaveNote = async (stepId: string, text: string) => {
    if (!isEnrolled) return;
    const updatedNotes = { ...notesRecord, [stepId]: text };

    try {
      await updateProgressDetailsMutation.mutateAsync({
        roadmapId: roadmap._id,
        notes: updatedNotes,
      });
    } catch (err) {
      console.error('Failed to save study notes:', err);
    }
  };

  return (
    <PageContainer size="default" className="py-8 space-y-8 select-text">
      {/* Back link breadcrumb */}
      <div className="select-none flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="h-8.5 px-sm text-body-xs font-black uppercase tracking-wider gap-xxs border border-border/80 bg-card shadow-sm cursor-pointer hover:bg-muted rounded-xl"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </Button>

        <div className="flex items-center gap-sm select-none">
          {isEnrolled && (
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-500/5 px-2.5 py-1 border border-emerald-500/10 rounded-full">
              Active Journey
            </span>
          )}
          <Button
            onClick={() => setReportOpen(true)}
            variant="ghost"
            className="h-8.5 px-sm text-body-xs font-black uppercase tracking-wider border border-border/80 bg-card shadow-sm cursor-pointer hover:bg-muted hover:text-red-400 rounded-xl"
          >
            Report
          </Button>
        </div>
      </div>

      {/* Header Panel (Sleeker and tighter footprints) */}
      <div className="relative">
        {isEnrolled ? (
          <ProgressOverview
            progressPercentage={progress.progressPercentage || 0}
            completedStepsCount={completedRequiredSteps}
            totalRequiredSteps={totalRequiredSteps}
            streakCount={progress.streakCount || 0}
            lastActiveAt={progress.lastActiveAt}
          />
        ) : (
          <EnrollmentCTA
            title={roadmap.title}
            description={roadmap.description}
            isEnrolling={enrollMutation.isPending}
            onEnroll={handleEnroll}
            difficulty={roadmap.difficulty}
            estimatedWeeks={roadmap.estimatedWeeks}
          />
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Vertical Progression Timeline path */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center select-none pb-3 border-b border-border/40">
            <h2 className="text-body-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary shrink-0" />
              <span>Learning Journey Path</span>
            </h2>
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
              {roadmap.sections?.length || 0} Syllabus Modules
            </span>
          </div>

          <RoadmapTimeline
            sections={roadmap.sections || []}
            completedSteps={completedSteps}
            bookmarkedSteps={bookmarkedSteps}
            notes={notesRecord}
            isEnrolled={isEnrolled}
            onToggleComplete={handleToggleComplete}
            onToggleBookmark={handleToggleBookmark}
            onSaveNote={handleSaveNote}
            togglingStepId={togglingStepId}
          />
        </div>

        {/* Right Side: Curator details, target outcomes, prerequisites sidebar */}
        <div className="space-y-6">
          <CommunityProgressIndicator community={community} />

          {/* Owning Curator Profile */}
          {roadmap.createdBy && (
            <Card className="border border-border/80 shadow-subtle rounded-2xl overflow-hidden select-none bg-card hover:border-border transition-colors duration-200">
              <div className="p-4 bg-muted/15 border-b border-border/40">
                <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">Roadmap Curator</h4>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="flex gap-3 items-center">
                  {roadmap.createdBy.avatar ? (
                    <img
                      src={roadmap.createdBy.avatar}
                      alt={roadmap.createdBy.name}
                      className="w-11 h-11 rounded-full object-cover shrink-0 border border-border"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-body-xs font-black shrink-0 border border-primary/20">
                      {roadmap.createdBy.name?.[0] || 'C'}
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <Link
                      to={`/profile/${roadmap.createdBy._id}`}
                      className="text-body-xs font-black text-foreground hover:text-primary transition block truncate leading-tight"
                    >
                      {roadmap.createdBy.name}
                    </Link>
                    <Badge variant="secondary" className="capitalize text-[9px] font-bold px-1.5 py-0 border border-border">
                      {roadmap.createdBy.role}
                    </Badge>
                  </div>
                </div>

                {roadmap.createdBy.bio && (
                  <p className="text-[11px] text-muted-foreground leading-normal font-semibold">
                    {roadmap.createdBy.bio}
                  </p>
                )}

                <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-t border-border/40 pt-4">
                  <Award className="h-4 w-4 text-primary shrink-0" />
                  <span>Reputation:</span>
                  <span className="text-foreground font-black">{roadmap.createdBy.respectPoints || 0} RP</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Target Outcomes */}
          {roadmap.learningOutcomes && roadmap.learningOutcomes.length > 0 && (
            <Card className="border border-border/80 shadow-subtle rounded-2xl bg-card hover:border-border transition-colors duration-200">
              <div className="p-4 bg-muted/15 border-b border-border/40 select-none">
                <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Target Outcomes</span>
                </h4>
              </div>
              <CardContent className="p-5 select-text">
                <ul className="space-y-2">
                  {roadmap.learningOutcomes.map((outcome: string, idx: number) => (
                    <li key={idx} className="flex gap-2 items-start text-body-xs font-semibold text-foreground leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Prerequisites */}
          {roadmap.prerequisites && roadmap.prerequisites.length > 0 && (
            <Card className="border border-border/80 shadow-subtle rounded-2xl bg-card hover:border-border transition-colors duration-200">
              <div className="p-4 bg-muted/15 border-b border-border/40 select-none">
                <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">Prerequisites</h4>
              </div>
              <CardContent className="p-5 select-text">
                <ul className="space-y-2">
                  {roadmap.prerequisites.map((req: string, idx: number) => (
                    <li key={idx} className="flex gap-2 items-start text-body-xs font-semibold text-muted-foreground leading-relaxed">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0 mt-2" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetType="roadmap"
        targetId={roadmap._id}
        targetName={roadmap.title}
      />
    </PageContainer>
  );
};
