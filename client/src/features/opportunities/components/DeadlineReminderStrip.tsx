import React from 'react';
import { AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Opportunity } from '../types';

interface DeadlineReminderStripProps {
  opportunities: Opportunity[];
  onViewDetails: (opportunity: Opportunity) => void;
}

export const DeadlineReminderStrip: React.FC<DeadlineReminderStripProps> = ({
  opportunities,
  onViewDetails,
}) => {
  // Filter for opportunities closing in the next 10 days, and not already expired
  const now = Date.now();
  const tenDaysMs = 10 * 24 * 60 * 60 * 1000;

  const urgentOpps = opportunities
    .filter((opp) => {
      const deadline = new Date(opp.applicationDeadline).getTime();
      return deadline > now && deadline - now <= tenDaysMs;
    })
    .sort((a, b) => new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime())
    .slice(0, 4);

  if (urgentOpps.length === 0) return null;

  return (
    <div className="space-y-3.5 select-none">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4.5 w-4.5 text-warning shrink-0 animate-pulse" />
        <h4 className="text-body-xs font-extrabold uppercase text-warning tracking-widest leading-none">
          Approaching Deadlines
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {urgentOpps.map((opp) => {
          const deadline = new Date(opp.applicationDeadline).getTime();
          const daysLeft = Math.ceil((deadline - now) / (24 * 60 * 60 * 1000));

          return (
            <Card
              key={opp._id}
              className="border border-warning/15 bg-warning/5 rounded-2xl overflow-hidden hover:border-warning/30 transition-all duration-300"
            >
              <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-warning uppercase tracking-wider leading-none">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span>Closing in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>
                  </div>
                  <h5 className="text-body-xs font-bold text-foreground truncate leading-snug pt-0.5">
                    {opp.title}
                  </h5>
                  <p className="text-[10px] font-semibold text-muted-foreground leading-none">
                    {opp.organizationName}
                  </p>
                </div>

                <Button
                  onClick={() => onViewDetails(opp)}
                  variant="ghost"
                  size="sm"
                  className="w-full text-warning hover:text-warning hover:bg-warning/10 h-8 text-[11px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1 border border-warning/20 bg-card/40"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
