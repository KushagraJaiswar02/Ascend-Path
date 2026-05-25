import { Link } from 'react-router-dom';
import type { CareerCluster } from '../../taxonomy/types';

export const CareerExplorer = ({ clusters }: { clusters: CareerCluster[] }) => (
  <div className="grid gap-4 md:grid-cols-2">
    {clusters.map((cluster) => (
      <section key={cluster.id} className="rounded-md border border-border bg-card p-4">
        <h3 className="text-sm font-bold">{cluster.name}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {(cluster.domains || []).slice(0, 8).map((domain) => (
            <Link key={domain.id} to={`/domains/${domain.slug}`} className="rounded-md border border-border px-2 py-1 text-xs font-semibold hover:bg-muted">
              {domain.name}
            </Link>
          ))}
        </div>
      </section>
    ))}
  </div>
);
