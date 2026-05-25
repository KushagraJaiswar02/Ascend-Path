import { cn } from '../../../lib/utils';
import { ClusterAccordion } from '../../taxonomy/components/ClusterAccordion';
import type { CareerCluster } from '../../taxonomy/types';

export const DomainSelector = ({
  clusters,
  value,
  onChange,
}: {
  clusters?: CareerCluster[];
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  if (clusters?.length) {
    return <ClusterAccordion clusters={clusters} value={value} onChange={onChange} />;
  }

  const fallbackDomains = ['Computer Science', 'Medicine', 'Finance', 'Marketing', 'Civil Services', 'UX Design', 'Psychology', 'Mechanical Engineering'];
  const toggle = (domain: string) => {
    onChange(value.includes(domain) ? value.filter((item) => item !== domain) : [...value, domain]);
  };

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {fallbackDomains.map((domain) => (
        <button
          key={domain}
          type="button"
          onClick={() => toggle(domain)}
          className={cn(
            'min-h-12 rounded-md border px-3 py-2 text-sm font-semibold transition-colors',
            value.includes(domain) ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-muted'
          )}
        >
          {domain}
        </button>
      ))}
    </div>
  );
};
