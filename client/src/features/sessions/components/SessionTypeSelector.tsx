import React from 'react';
import { Users, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SessionTypeChoice = 'private_mentorship' | 'public_workshop';

interface SessionTypeSelectorProps {
  value: SessionTypeChoice;
  onChange: (value: SessionTypeChoice) => void;
}

const choices = [
  {
    value: 'private_mentorship' as const,
    label: 'Private Mentorship',
    description: '1-on-1 guidance, booking, reflections, and mentor followups.',
    icon: UserRound,
  },
  {
    value: 'public_workshop' as const,
    label: 'Public Workshop',
    description: 'Community event, RSVP flow, attendee counts, and shared resources.',
    icon: Users,
  },
];

export const SessionTypeSelector: React.FC<SessionTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
      {choices.map((choice) => {
        const Icon = choice.icon;
        const selected = value === choice.value;
        return (
          <button
            key={choice.value}
            type="button"
            onClick={() => onChange(choice.value)}
            className={cn(
              'text-left rounded-xl border p-4 transition bg-card cursor-pointer',
              selected ? 'border-primary ring-1 ring-primary/30 bg-primary/5' : 'border-border hover:border-primary/30'
            )}
          >
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Icon className={cn('h-4 w-4', selected ? 'text-primary' : 'text-muted-foreground')} />
              <span>{choice.label}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{choice.description}</p>
          </button>
        );
      })}
    </div>
  );
};
