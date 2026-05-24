import React from 'react';
import { CalendarDays, Radio, Users } from 'lucide-react';

export const WorkshopHeroBanner: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),rgba(99,102,241,0.08),rgba(245,158,11,0.08))]" />
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-primary">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-1">
            <Radio className="h-3 w-3" />
            Live learning events
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-2 py-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            Community RSVP
          </span>
        </div>
        <h1 className="mt-4 text-heading-lg font-black tracking-tight text-foreground">
          Public Workshops
        </h1>
        <p className="mt-2 max-w-2xl text-body-sm leading-relaxed text-muted-foreground">
          Join roadmap walkthroughs, AMAs, study events, and guide-led workshops designed for group learning.
        </p>
        <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>Upcoming sessions are hosted live and can include shared resources or recordings after the event.</span>
        </div>
      </div>
    </section>
  );
};
