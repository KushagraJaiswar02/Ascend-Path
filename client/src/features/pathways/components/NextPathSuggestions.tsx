import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PathwayConnection } from '../types';

export const NextPathSuggestions = ({ connections }: { connections: PathwayConnection[] }) => (
  <Card className="border border-border bg-card shadow-subtle">
    <CardHeader>
      <CardTitle className="text-base font-bold">Possible Next Paths</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {connections.slice(0, 4).map((connection) => (
        <Link key={connection.id} to={`/domains/${connection.targetDomain?.slug}`} className="block rounded-md border border-border p-3 hover:bg-muted">
          <div className="text-sm font-bold">{connection.targetDomain?.name}</div>
          <p className="mt-1 text-xs text-muted-foreground">{connection.relationshipType.replace(/_/g, ' ')} with {connection.overlapStrength}% overlap</p>
        </Link>
      ))}
      {connections.length === 0 && <p className="text-sm text-muted-foreground">No next paths mapped yet.</p>}
    </CardContent>
  </Card>
);
