import { cn } from '../../../lib/utils';
import { onboardingDomains } from '../options';

export const DomainSelector = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const toggle = (domain: string) => {
    onChange(value.includes(domain) ? value.filter((item) => item !== domain) : [...value, domain]);
  };

  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
      {onboardingDomains.map((domain) => (
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
