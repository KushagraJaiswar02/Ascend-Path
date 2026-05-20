import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export const RoadmapProgress: React.FC = () => {
  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground shadow-subtle overflow-hidden relative group">
      <CardHeader className="flex flex-row items-center justify-between p-md border-b border-border/50 bg-muted/20">
        <CardTitle className="text-body-lg font-bold text-foreground">
          Tracked Roadmaps
        </CardTitle>
      </CardHeader>
      
      {/* Background content is blurred and slightly desaturated to indicate locked status */}
      <CardContent className="p-md sm:p-lg flex-grow flex flex-col gap-lg select-none filter blur-[0.5px] opacity-75">
        <div className="space-y-sm">
          <div className="flex justify-between items-baseline">
            <span className="text-body-sm font-bold text-foreground">
              Frontend Masterclass
            </span>
            <span className="text-body-sm font-semibold text-primary">45%</span>
          </div>
          {/* Extremely thin progress bar */}
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-none">
            Next: Advanced CSS & Layout Grid
          </p>
        </div>
        
        <div className="space-y-sm">
          <div className="flex justify-between items-baseline">
            <span className="text-body-sm font-bold text-foreground">
              System Design Roadmap
            </span>
            <span className="text-body-sm font-semibold text-success">12%</span>
          </div>
          {/* Extremely thin progress bar */}
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="bg-success h-full rounded-full" style={{ width: '12%' }}></div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-none">
            Next: Horizontal Scaling & Load Balancers
          </p>
        </div>
      </CardContent>

      {/* Exquisite glassmorphic lock overlay - Fades in softly on hover */}
      <div className="absolute inset-0 bg-background/40 dark:bg-background/25 backdrop-blur-[4px] flex items-center justify-center flex-col opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-focus-within:opacity-100">
        <div className="flex flex-col items-center gap-xs p-md text-center">
          <div className="h-8 w-8 rounded-full bg-card border border-border/80 flex items-center justify-center text-foreground shadow-medium mb-xs animate-bounce">
            <Lock className="h-3.5 w-3.5" />
          </div>
          <span className="text-body-sm font-bold text-foreground">
            Tracked Roadmaps
          </span>
          <p className="text-muted-xs text-muted-foreground max-w-[200px] leading-normal">
            Custom curriculum tracking is coming soon in Phase 3.
          </p>
        </div>
      </div>
    </Card>
  );
};

