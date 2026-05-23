import { useState } from 'react';
import { FileClock, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useAuditLogs } from '../hooks';

export const AuditLogViewer = () => {
  const [action, setAction] = useState('');
  const { data } = useAuditLogs({ action: action || undefined, limit: 50 });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">Every privileged action is traceable by actor, target, action, and metadata.</p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-2 p-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select className="rounded-md border bg-background px-3 py-2 text-sm" value={action} onChange={(event) => setAction(event.target.value)}>
            <option value="">All actions</option>
            <option value="warn">warn</option>
            <option value="suspend">suspend</option>
            <option value="hide_content">hide_content</option>
            <option value="role_change">role_change</option>
            <option value="bulk_action">bulk_action</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileClock className="h-4 w-4" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data?.logs || []).map((log: any) => (
            <div key={log._id} className="rounded-md border p-3">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div className="font-medium">{log.action}</div>
                <div className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{log.details}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {log.actorId?.email || 'system'} {'->'} {log.targetType}:{log.targetId}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
