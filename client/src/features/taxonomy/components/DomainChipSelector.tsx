import { cn } from '../../../lib/utils';
import type { CareerDomain } from '../types';

export const DomainChipSelector = ({
  domains,
  value,
  onChange,
  max = 8,
}: {
  domains: CareerDomain[];
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
}) => {
  const toggle = (domainId: string) => {
    if (value.includes(domainId)) {
      onChange(value.filter((item) => item !== domainId));
      return;
    }
    if (value.length < max) onChange([...value, domainId]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {domains.map((domain) => {
        const selected = value.includes(domain.id);
        return (
          <button
            key={domain.id}
            type="button"
            onClick={() => toggle(domain.id)}
            className={cn(
              'min-h-10 rounded-md border px-3 py-2 text-sm font-semibold transition-colors',
              selected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-muted'
            )}
          >
            {domain.name}
          </button>
        );
      })}
    </div>
  );
};
