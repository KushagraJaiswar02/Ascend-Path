import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Trophy } from 'lucide-react';

interface FameScoreCardProps {
  fameScore: number;
  guideRank: string;
}

export const FameScoreCard: React.FC<FameScoreCardProps> = ({
  fameScore,
  guideRank,
}) => {
  // Compute SVG circular progress variables
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(fameScore, 100) / 100) * circumference;

  const getRankDescription = (rank: string) => {
    switch (rank?.toLowerCase()) {
      case 'expert guide':
        return 'Recognized expert with stellar ratings, high session completions, and deep community impact.';
      case 'established guide':
        return 'Active and well-regarded mentor consistently delivering valuable support and positive session reviews.';
      default:
        return 'An up-and-coming guide building up session histories, respect points, and review counts.';
    }
  };

  return (
    <Card className="border border-border bg-card shadow-subtle flex flex-col h-full hover:border-border/80 transition-all select-none">
      <CardHeader className="p-md pb-xs border-b border-border/50 bg-muted/10">
        <CardTitle className="text-body-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-xs">
          <Sparkles className="h-4 w-4 text-warning shrink-0" />
          <span>Fame & Authority</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-md sm:p-lg flex flex-col sm:flex-row items-center gap-md sm:gap-lg justify-center flex-grow">
        {/* Radial Circular SVG Dial */}
        <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
          <svg className="h-full w-full -rotate-90">
            {/* Background Circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-muted fill-none"
              strokeWidth="8"
            />
            {/* Foreground Progress Circle */}
            <circle
              cx="56"
              cy="56"
              r={radius}
              className="stroke-primary fill-none transition-all duration-500 ease-out"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          {/* Central Percentage */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-heading-md font-black text-foreground leading-none">
              {fameScore}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase mt-xxs">
              / 100
            </span>
          </div>
        </div>

        {/* Details & Copy */}
        <div className="space-y-xs text-center sm:text-left flex-1">
          <h4 className="text-body-md font-extrabold text-foreground flex items-center justify-center sm:justify-start gap-xs">
            <Trophy className="h-4 w-4 text-warning shrink-0" />
            <span>{guideRank}</span>
          </h4>
          <p className="text-muted-sm text-muted-foreground leading-relaxed">
            {getRankDescription(guideRank)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
