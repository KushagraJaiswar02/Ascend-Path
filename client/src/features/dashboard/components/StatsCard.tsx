import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, subtitle, icon }) => {
  return (
    <Card className="overflow-hidden transition-all duration-250 hover:shadow-medium border border-border bg-card text-card-foreground">
      <CardContent className="p-md sm:p-lg flex items-center justify-between">
        <div className="space-y-xs">
          <p className="text-body-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <h3 className="text-heading-sm sm:text-heading-md font-bold tracking-tight text-foreground">
            {value}
          </h3>
          {subtitle && (
            <p className="text-muted-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:h-5 [&_svg]:w-5">
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

