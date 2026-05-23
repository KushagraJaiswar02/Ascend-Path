import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Clock, Info } from 'lucide-react';

interface AvailabilityCardProps {
  availability?: {
    text: string;
    schedule: { day: string; slots: string[] }[];
  };
}

export const AvailabilityCard: React.FC<AvailabilityCardProps> = ({
  availability,
}) => {
  const defaultText = 'Contact guide directly to discuss schedules';
  const defaultSchedule = [
    { day: 'Monday - Friday', slots: ['Flexible Bookings'] },
    { day: 'Saturday - Sunday', slots: ['By Request'] },
  ];

  const text = availability?.text || defaultText;
  const schedule = availability?.schedule && availability.schedule.length > 0
    ? availability.schedule
    : defaultSchedule;

  return (
    <Card className="border border-border bg-card shadow-subtle flex flex-col h-full hover:border-border/80 transition-all select-none">
      <CardHeader className="p-md pb-xs border-b border-border/50 bg-muted/10">
        <CardTitle className="text-body-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-xs">
          <CalendarClock className="h-4.5 w-4.5 text-primary shrink-0" />
          <span>Availability Schedule</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-md sm:p-lg flex-grow flex flex-col gap-md">
        {/* Descriptive Summary Info Box */}
        <div className="flex items-start gap-xs p-sm bg-muted/30 border border-border/50 rounded-xl">
          <Info className="h-4.5 w-4.5 text-primary/70 shrink-0 mt-xxs" />
          <p className="text-muted-sm text-muted-foreground leading-normal select-text">
            {text}
          </p>
        </div>

        {/* Schedule grid layout */}
        <div className="space-y-sm">
          {schedule.map((slot, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-sm last:border-b-0 last:pb-0 gap-xs"
            >
              <span className="text-body-xs font-bold text-foreground shrink-0 sm:w-28">
                {slot.day}
              </span>
              
              <div className="flex flex-wrap gap-xxs items-center">
                {slot.slots.length === 0 ? (
                  <span className="text-[10px] italic text-muted-foreground/60">
                    No active slots
                  </span>
                ) : (
                  slot.slots.map((time, sIdx) => (
                    <Badge
                      key={sIdx}
                      variant="secondary"
                      className="text-[10px] font-semibold px-2 py-0.5 border border-border/50 flex items-center gap-xxs bg-muted/30 hover:bg-muted/50 cursor-default"
                    >
                      <Clock className="h-2.5 w-2.5 text-primary shrink-0" />
                      <span>{time}</span>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
