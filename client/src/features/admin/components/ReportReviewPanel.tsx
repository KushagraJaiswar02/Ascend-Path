import { CheckCircle2, EyeOff, UserX, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Textarea } from '../../../components/ui/textarea';
import { useModerationActions } from '../hooks';
import { useState } from 'react';

export const ReportReviewPanel = ({ report }: { report?: any }) => {
  const [resolution, setResolution] = useState('');
  const actions = useModerationActions();

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Panel</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">Select or load a report to inspect the current queue.</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <Row label="Target" value={`${report.targetType} / ${report.targetId}`} />
          <Row label="Reason" value={report.reason} />
          <Row label="Reporter" value={report.reporterId?.email || 'Unknown'} />
          <Row label="Priority" value={report.priority} />
        </div>
        <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
          {report.description || report.details || 'No reporter description provided.'}
        </div>
        <Textarea value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="Resolution notes" />
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => actions.actionReport.mutate({ reportId: report._id, payload: { status: 'dismissed', resolution } })}
          >
            <XCircle className="h-4 w-4" />
            Dismiss
          </Button>
          <Button onClick={() => actions.actionReport.mutate({ reportId: report._id, payload: { status: 'actioned', resolution } })}>
            <CheckCircle2 className="h-4 w-4" />
            Resolve
          </Button>
          <Button
            variant="outline"
            onClick={() => actions.hideContent.mutate({ targetType: report.targetType, targetId: report.targetId, reason: resolution || report.reason })}
          >
            <EyeOff className="h-4 w-4" />
            Hide
          </Button>
          {report.targetType === 'user' || report.targetType === 'guide_profile' ? (
            <Button
              variant="destructive"
              onClick={() => actions.suspendUser.mutate({ userId: report.targetId, payload: { days: 7, reason: resolution || report.reason } })}
            >
              <UserX className="h-4 w-4" />
              Suspend
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3">
    <span className="text-muted-foreground">{label}</span>
    <span className="truncate text-right font-medium">{value}</span>
  </div>
);
