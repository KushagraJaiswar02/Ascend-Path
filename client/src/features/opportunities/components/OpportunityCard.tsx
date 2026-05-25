import React from 'react';
import { Calendar, MapPin, Briefcase, Sparkles, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ReadinessMeter } from './ReadinessMeter';
import type { Opportunity } from '../types';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewDetails: (opportunity: Opportunity) => void;
  onApply: (opportunityId: string) => void;
  isApplied?: boolean;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onViewDetails,
  onApply,
  isApplied = false,
}) => {
  const isExpired = new Date(opportunity.applicationDeadline).getTime() < Date.now();
  const deadlineDate = new Date(opportunity.applicationDeadline).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="border border-border/80 bg-card hover:border-primary/20 hover:shadow-subtle transition-all duration-300 rounded-3xl overflow-hidden group select-none relative flex flex-col justify-between h-full">
      {/* Featured tag glow banner */}
      {opportunity.isFeatured && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-indigo-500 to-violet-500" />
      )}

      <CardContent className="p-6 space-y-5 flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          {/* Top header row */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-3">
              {opportunity.organizationLogo ? (
                <img
                  src={opportunity.organizationLogo}
                  alt={opportunity.organizationName}
                  className="w-10 h-10 rounded-xl object-contain border border-border bg-muted/20 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary border border-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="text-body-xs font-bold text-foreground truncate group-hover:text-primary transition-colors duration-300">
                  {opportunity.title}
                </h4>
                <p className="text-[11px] font-semibold text-muted-foreground leading-none mt-1">
                  {opportunity.organizationName}
                </p>
              </div>
            </div>

            {/* Featured badge */}
            {opportunity.isFeatured && (
              <Badge variant="outline" className="text-[9px] font-extrabold uppercase border-primary/20 text-primary bg-primary/5 rounded-full select-none h-fit px-2 shrink-0">
                Featured
              </Badge>
            )}
          </div>

          {/* Quick tags */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px] font-bold capitalize bg-muted/30 border-border/50 text-foreground py-0.5 rounded-lg">
              <Briefcase className="h-2.5 w-2.5 mr-1" />
              {opportunity.opportunityType}
            </Badge>
            <Badge variant="outline" className="text-[10px] font-bold capitalize bg-muted/30 border-border/50 text-foreground py-0.5 rounded-lg">
              <MapPin className="h-2.5 w-2.5 mr-1" />
              {opportunity.location || 'Remote'}
            </Badge>
            {opportunity.difficulty && (
              <Badge variant="outline" className="text-[10px] font-bold capitalize bg-muted/30 border-border/50 text-foreground py-0.5 rounded-lg">
                {opportunity.difficulty}
              </Badge>
            )}
          </div>

          {/* Stipend / Salary */}
          {(opportunity.stipend || opportunity.salaryRange) && (
            <p className="text-body-xs font-extrabold text-foreground">
              💰 {opportunity.stipend || opportunity.salaryRange}
            </p>
          )}

          {/* Universal Taxonomy domains list */}
          {opportunity.careerDomains && opportunity.careerDomains.length > 0 && (
            <div className="flex flex-wrap gap-1 border-t border-border/40 pt-3">
              {opportunity.careerDomains.slice(0, 3).map((domain) => (
                <span
                  key={domain._id}
                  className="text-[9px] font-extrabold uppercase tracking-wider text-primary leading-none bg-primary/5 px-2 py-1 rounded-md"
                >
                  {domain.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Readiness Meter & CTAs block */}
        <div className="space-y-4 pt-4 border-t border-border/40 mt-4">
          <div className="flex justify-between items-center gap-4">
            {opportunity.readinessScore !== undefined && (
              <ReadinessMeter score={opportunity.readinessScore} size="sm" />
            )}

            <div className="flex items-center gap-1.5 text-metadata text-muted-foreground font-semibold">
              <Calendar className="h-3.5 w-3.5" />
              <span className={isExpired ? 'text-destructive font-bold' : ''}>
                {isExpired ? 'Expired' : deadlineDate}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(opportunity)}
              className="flex-1 text-xs font-bold h-9 px-3 rounded-xl border-border/80 hover:border-primary/20 hover:bg-primary/5 gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Readiness Details</span>
            </Button>

            {!isApplied ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onApply(opportunity._id)}
                disabled={isExpired}
                className="text-xs font-bold h-9 px-4 rounded-xl cursor-pointer"
              >
                Track Opportunity
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="text-xs font-extrabold text-success border-success/20 bg-success/5 h-9 px-4 rounded-xl"
              >
                Tracked ✓
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
