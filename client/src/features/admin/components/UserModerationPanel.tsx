import { useState } from 'react';
import { MinusCircle, Search, UserX } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { useAdminUsers, useModerationActions } from '../hooks';

export const UserModerationPanel = () => {
  const [search, setSearch] = useState('');
  const { data } = useAdminUsers({ search, limit: 25 });
  const actions = useModerationActions();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">User Moderation</h1>
        <p className="text-sm text-muted-foreground">Investigate accounts, apply temporary controls, and trace governance actions.</p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-2 p-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search name or email" value={search} onChange={(event) => setSearch(event.target.value)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="py-2">User</th>
                <th>Role</th>
                <th>Reputation</th>
                <th>Reports</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.users || []).map((user: any) => (
                <tr key={user._id} className="border-b last:border-0">
                  <td className="py-3">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </td>
                  <td>{user.role}</td>
                  <td>{user.fameScore ?? 0}</td>
                  <td>{user.reportCount ?? 0}</td>
                  <td>
                    <Badge variant={user.isBanned ? 'destructive' : 'secondary'}>{user.isBanned ? 'banned' : 'active'}</Badge>
                  </td>
                  <td className="space-x-1 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => actions.adjustReputation.mutate({ userId: user._id, payload: { delta: -10, reason: 'Moderation penalty' } })}
                    >
                      <MinusCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => actions.suspendUser.mutate({ userId: user._id, payload: { days: 7, reason: 'Safety investigation' } })}
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
