import { Link } from 'react-router-dom';
import type { PathwayConnection } from '../types';

export const RelatedCareerStrip = ({ connections }: { connections: PathwayConnection[] }) => (
  <div className="flex gap-3 overflow-x-auto pb-2">
    {connections.slice(0, 8).map((connection) => (
      <Link key={connection.id} to={`/domains/${connection.targetDomain?.slug}`} className="min-w-48 rounded-md border border-border bg-card p-3 hover:bg-muted">
        <div className="text-sm font-bold">{connection.targetDomain?.name}</div>
        <div className="mt-1 text-xs text-muted-foreground">{connection.relationshipType.replace(/_/g, ' ')}</div>
      </Link>
    ))}
  </div>
);
