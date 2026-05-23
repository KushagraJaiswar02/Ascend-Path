import { useMemo, useState } from 'react';
import { CheckCircle2, EyeOff, Filter, UserCheck, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { useModerationActions, useReports } from '../hooks';
import { ReportReviewPanel } from './ReportReviewPanel';

const statuses = ['pending', 'assigned', 'reviewed', 'actioned', 'dismissed'];

export const ModerationQueue = () => {
  const [status, setStatus] = useState('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTarget, setSearchTarget] = useState('');
  const { data, isLoading } = useReports({ status, limit: 25 });
  const actions = useModerationActions();

  const reports = useMemo(() => {
    const rows = data?.reports || [];
    if (!searchTarget) return rows;
    return rows.filter((report: any) => report.targetId?.includes(searchTarget));
  }, [data, searchTarget]);

  const toggleSelected = (reportId: string) => {
    setSelectedIds((current) => (current.includes(reportId) ? current.filter((id) => id !== reportId) : [...current, reportId]));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Moderation Queue</h1>
          <p className="text-sm text-muted-foreground">Review incoming safety reports and route action through auditable workflows.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!selectedIds.length}
            onClick={() => actions.bulkAction.mutate({ reportIds: selectedIds, action: 'dismiss', payload: { resolution: 'Bulk dismissed' } })}
          >
            <XCircle className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            disabled={!selectedIds.length}
            onClick={() => actions.bulkAction.mutate({ reportIds: selectedIds, action: 'resolve', payload: { resolution: 'Bulk reviewed' } })}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select className="rounded-md border bg-background px-3 py-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <Input placeholder="Filter by target id" value={searchTarget} onChange={(event) => setSearchTarget(event.target.value)} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="w-10 py-2"></th>
                  <th>Priority</th>
                  <th>Target</th>
                  <th>Reason</th>
                  <th>Reporter</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">Loading reports</td>
                  </tr>
                )}
                {reports.map((report: any) => (
                  <tr key={report._id} className="border-b last:border-0">
                    <td className="py-3">
                      <input type="checkbox" checked={selectedIds.includes(report._id)} onChange={() => toggleSelected(report._id)} />
                    </td>
                    <td><Badge variant={report.priority === 'critical' ? 'destructive' : 'secondary'}>{report.priority}</Badge></td>
                    <td>
                      <div className="font-medium">{report.targetType}</div>
                      <div className="max-w-[160px] truncate text-xs text-muted-foreground">{report.targetId}</div>
                    </td>
                    <td>{report.reason}</td>
                    <td>{report.reporterId?.name || 'Unknown'}</td>
                    <td>{report.status}</td>
                    <td className="space-x-1 text-right">
                      <Button variant="outline" size="sm" onClick={() => actions.assignReport.mutate(report._id)}>
                        <UserCheck className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => actions.hideContent.mutate({ targetType: report.targetType, targetId: report.targetId, reason: report.reason })}>
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <ReportReviewPanel report={reports[0]} />
      </div>
    </div>
  );
};
