import * as React from 'react';
import { CheckCircle2, EyeOff, UserX, XCircle, AlertTriangle, ShieldAlert, Link2, Image, Terminal, ChevronRight, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Textarea } from '../../../components/ui/textarea';
import { useModerationActions } from '../hooks';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/services/apiClient';

export const ReportReviewPanel = ({ report }: { report?: any }) => {
  const { toast } = useToast();
  const [resolution, setResolution] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const actions = useModerationActions();

  React.useEffect(() => {
    setResolution('');
  }, [report]);

  if (!report) {
    return (
      <Card className="border border-slate-800 bg-slate-950 text-slate-100 shadow-xl rounded-xl">
        <CardHeader className="border-b border-slate-900 pb-4">
          <CardTitle className="text-lg font-bold flex items-center space-x-2 text-slate-300">
            <ShieldAlert className="h-5 w-5 text-slate-500" />
            <span>Inspection Panel</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-sm text-slate-500">
          Select a safety report from the queue to inspect details and route actions.
        </CardContent>
      </Card>
    );
  }

  const handleAction = async (
    status: string,
    decision: string,
    falseReportStrike: boolean = false
  ) => {
    if (falseReportStrike) {
      const confirmStrike = window.confirm(
        'WARNING: You are about to apply a FALSE-REPORT strike. This will immediately issue a 2-day temporary suspension to the reporter and increment their strike count. Do you want to proceed?'
      );
      if (!confirmStrike) return;
    }

    setIsSubmitting(true);
    try {
      await actions.actionReport.mutateAsync({
        reportId: report._id,
        payload: {
          status,
          resolution: resolution || `Resolved as ${decision}`,
          moderatorDecision: decision,
          falseReportStrike,
          moderatorNotes: resolution,
        },
      });

      toast({
        title: 'Action Applied Successfully',
        description: `Report was resolved as ${decision.replace('_', ' ')}.`,
        type: 'success',
      });
      setResolution('');
    } catch (error: any) {
      toast({
        title: 'Action Failed',
        description: error?.message || 'Something went wrong.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEscalate = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.patch(`/moderation/${report._id}/escalate`, {
        notes: resolution || 'Escalated to critical priority by moderator.',
      });
      toast({
        title: 'Report Escalated',
        description: 'Safety case upgraded to CRITICAL priority.',
        type: 'success',
      });
      // Invalidate query manually
      actions.actionReport.mutate({ reportId: report._id, payload: { status: report.status } });
    } catch (error: any) {
      toast({
        title: 'Escalation Failed',
        description: error?.message || 'Something went wrong.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHideContent = async () => {
    const confirmHide = window.confirm(
      'Are you sure you want to HIDE this content globally? This will automatically resolve all pending safety reports filed against it.'
    );
    if (!confirmHide) return;

    setIsSubmitting(true);
    try {
      await actions.hideContent.mutateAsync({
        targetType: report.targetType,
        targetId: report.targetId,
        reason: resolution || `Hidden by moderator due to safety report ${report._id}`,
      });
      toast({
        title: 'Content Hidden',
        description: 'The reported content was hidden globally and associated reports resolved.',
        type: 'success',
      });
      setResolution('');
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err?.message || 'Failed to hide content.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteContent = async () => {
    const confirmDelete = window.confirm(
      'DANGER: Are you sure you want to soft-DELETE this content globally? This will remove it from public view and automatically resolve all pending safety reports filed against it.'
    );
    if (!confirmDelete) return;

    setIsSubmitting(true);
    try {
      await actions.softDeleteContent.mutateAsync({
        targetType: report.targetType,
        targetId: report.targetId,
        reason: resolution || `Soft deleted by moderator due to safety report ${report._id}`,
      });
      toast({
        title: 'Content Deleted',
        description: 'The reported content was soft-deleted and associated reports resolved.',
        type: 'success',
      });
      setResolution('');
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err?.message || 'Failed to delete content.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspendUser = async () => {
    const confirmSuspend = window.confirm(
      'Are you sure you want to SUSPEND this user for 7 days? This will intercept their write access across the platform.'
    );
    if (!confirmSuspend) return;

    setIsSubmitting(true);
    try {
      await actions.suspendUser.mutateAsync({
        userId: report.targetId,
        payload: {
          days: 7,
          reason: resolution || `Policy violation from safety report: ${report._id}`,
        },
      });
      toast({
        title: 'User Suspended',
        description: 'Account successfully suspended for 7 days.',
        type: 'success',
      });
      setResolution('');
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err?.message || 'Failed to suspend user.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Safe checks for evidence and screenshots
  const finalLinks = Array.isArray(report.evidenceLinks) ? report.evidenceLinks : [];
  const finalScreenshots = Array.isArray(report.screenshots) ? report.screenshots : [];

  // Intelligent navigation builder for reported content
  const getViewUrl = () => {
    const id = report.targetId;
    const type = report.targetType;
    if (type === 'post') return `/forum/${id}`;
    if (type === 'reply') {
      const postId = report.metadata?.postId;
      return postId ? `/forum/${postId}#reply-${id}` : `/forum/${id}`;
    }
    if (type === 'session') return `/sessions/${id}`;
    if (type === 'roadmap') return `/roadmaps/${id}`;
    if (type === 'user' || type === 'guide_profile') return `/profile/${id}`;
    if (type === 'review') return `/profile/${id}`;
    return null;
  };
  const viewUrl = getViewUrl();

  return (
    <Card className="border border-violet-500/20 bg-slate-950 text-slate-100 shadow-xl rounded-xl">
      <CardHeader className="border-b border-slate-900 pb-4">
        <CardTitle className="text-lg font-bold flex items-center justify-between text-slate-200">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-5 w-5 text-violet-400" />
            <span>Inspection Panel</span>
          </div>
          <span className="text-[10px] bg-violet-600/20 border border-violet-500/30 text-violet-300 font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
            Case Details
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-5">
        {/* View Reported Content Button */}
        {viewUrl && (
          <Button
            variant="outline"
            className="w-full border-violet-500/30 text-violet-400 hover:bg-violet-950/20 hover:text-violet-300 font-extrabold text-xs flex items-center justify-center gap-1.5"
            onClick={() => window.open(viewUrl, '_blank')}
          >
            <Eye className="h-4 w-4" />
            <span>View Reported Content (New Tab)</span>
          </Button>
        )}

        {/* Core details table */}
        <div className="space-y-2.5 text-xs text-slate-300">
          <Row label="Target Item" value={`${report.targetType.toUpperCase()} / ${report.targetId}`} />
          <Row label="Reason Category" value={report.reasonCategory || report.reason || 'Other'} />
          <Row label="Filing Reporter" value={report.reporterId?.email || 'Unknown'} />
          <Row label="Current Status" value={report.status} />
          <Row label="Priority" value={report.priority} />
          {report.moderatorDecision && report.moderatorDecision !== 'pending' && (
            <Row label="Last Decision" value={report.moderatorDecision.replace('_', ' ')} />
          )}
        </div>

        {/* Written Explanation Description */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Written Explanation</span>
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 text-xs leading-relaxed text-slate-300">
            {report.detailedReason || report.description || report.details || 'No reporter description provided.'}
          </div>
        </div>

        {/* Evidence list */}
        {finalLinks.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center space-x-1">
              <Link2 className="h-3 w-3 text-violet-400" />
              <span>Verified Evidence Links ({finalLinks.length})</span>
            </span>
            <div className="space-y-1">
              {finalLinks.map((link: string, idx: number) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 p-2 border border-slate-800 hover:border-violet-500/40 bg-slate-900/40 hover:bg-violet-950/20 text-violet-400 hover:text-violet-300 rounded-lg text-xs leading-normal transition-all"
                >
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="truncate">{link}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Screenshots preview */}
        {finalScreenshots.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center space-x-1">
              <Image className="h-3 w-3 text-violet-400" />
              <span>Screenshots Attached ({finalScreenshots.length})</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              {finalScreenshots.map((shot: string, idx: number) => (
                <a
                  key={idx}
                  href={shot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative border border-slate-800 hover:border-violet-500/40 rounded-lg overflow-hidden group transition-all"
                >
                  <img src={shot} alt={`screenshot-${idx}`} className="w-full h-24 object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">View Full Image</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Resolution textbox */}
        <div className="space-y-1.5 pt-2 border-t border-slate-900">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center space-x-1">
            <Terminal className="h-3.5 w-3.5 text-violet-400" />
            <span>Resolution & Administrative Notes</span>
          </label>
          <Textarea
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Add review notes, reasons for action/dismissal, or details for suspension..."
            className="bg-slate-900 border-slate-800 text-slate-100 text-xs placeholder-slate-600 focus:border-violet-500 min-h-[70px] rounded-lg"
          />
        </div>

        {/* Action button grid */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
            disabled={isSubmitting}
            onClick={() => handleAction('dismissed', 'dismissed')}
          >
            <XCircle className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0" />
            Dismiss Report
          </Button>

          <Button
            className="bg-violet-600 hover:bg-violet-700 text-slate-100 font-semibold text-xs shadow-md shadow-violet-600/10"
            disabled={isSubmitting}
            onClick={() => handleAction('actioned', 'action_taken')}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-slate-100 shrink-0" />
            Accept & Resolve
          </Button>

          <Button
            variant="outline"
            className="border-slate-800 text-amber-400 hover:bg-amber-950/20 hover:text-amber-300 hover:border-amber-500/30 text-xs font-semibold"
            disabled={isSubmitting}
            onClick={handleEscalate}
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1 text-amber-400 shrink-0" />
            Escalate Priority
          </Button>

          <Button
            variant="outline"
            className="border-red-950 bg-red-950/15 text-red-400 hover:bg-red-950/30 hover:border-red-500/30 text-xs font-semibold"
            disabled={isSubmitting}
            onClick={() => handleAction('dismissed', 'false_report', true)}
          >
            <UserX className="h-3.5 w-3.5 mr-1 text-red-400 shrink-0" />
            False Report Strike
          </Button>

          {/* Contextual Hide & Suspend */}
          {report.targetType === 'roadmap' || report.targetType === 'review' ? (
            <Button
              variant="outline"
              className="col-span-2 border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              disabled={isSubmitting}
              onClick={handleHideContent}
            >
              <EyeOff className="h-3.5 w-3.5 mr-1 text-slate-400 shrink-0" />
              Hide Reported Content Globally
            </Button>
          ) : null}

          {report.targetType === 'post' || report.targetType === 'reply' ? (
            <Button
              variant="destructive"
              className="col-span-2 text-xs font-semibold"
              disabled={isSubmitting}
              onClick={handleDeleteContent}
            >
              <XCircle className="h-3.5 w-3.5 mr-1 text-white shrink-0" />
              Delete Reported Content Globally
            </Button>
          ) : null}

          {report.targetType === 'user' || report.targetType === 'guide_profile' ? (
            <Button
              variant="destructive"
              className="col-span-2 text-xs font-semibold"
              disabled={isSubmitting}
              onClick={handleSuspendUser}
            >
              <UserX className="h-3.5 w-3.5 mr-1 text-white shrink-0" />
              Suspend Target User (7 Days)
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3 border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
    <span className="text-slate-500">{label}</span>
    <span className="truncate text-right font-semibold text-slate-200 capitalize">{value}</span>
  </div>
);
