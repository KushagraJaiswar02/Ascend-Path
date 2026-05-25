import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { DomainChipSelector } from './DomainChipSelector';
import type { CareerCluster } from '../types';

export const ClusterAccordion = ({
  clusters,
  value,
  onChange,
}: {
  clusters: CareerCluster[];
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const [openSlug, setOpenSlug] = useState(clusters[0]?.slug);

  return (
    <div className="space-y-2">
      {clusters.map((cluster) => {
        const isOpen = openSlug === cluster.slug;
        return (
          <section key={cluster.id} className="rounded-md border border-border bg-card">
            <button
              type="button"
              onClick={() => setOpenSlug(isOpen ? '' : cluster.slug)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
            >
              <span>
                <span className="block text-sm font-bold">{cluster.name}</span>
                {cluster.description && <span className="block text-xs text-muted-foreground">{cluster.description}</span>}
              </span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
            </button>
            {isOpen && cluster.domains && (
              <div className="border-t border-border px-4 py-3">
                <DomainChipSelector domains={cluster.domains} value={value} onChange={onChange} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
