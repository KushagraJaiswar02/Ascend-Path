import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  BookOpen,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReadinessMeter } from './ReadinessMeter';
import type { Opportunity } from '../types';

interface SkillGapPanelProps {
  opportunity: Opportunity;
  readinessScore: number;
  readinessGaps: string[];
  onClose?: () => void;
}

export const SkillGapPanel: React.FC<SkillGapPanelProps> = ({
  opportunity,
  readinessScore,
  readinessGaps,
  onClose,
}) => {
  const navigate = useNavigate();

  // Categorize Gaps for clean display
  const roadmapGaps = readinessGaps.filter((g) => g.toLowerCase().includes('roadmap'));
  const skillGaps = readinessGaps.filter((g) => g.toLowerCase().includes('skill'));
  const confidenceGaps = readinessGaps.filter((g) => g.toLowerCase().includes('confidence'));
  const sessionGaps = readinessGaps.filter(
    (g) => g.toLowerCase().includes('session') || g.toLowerCase().includes('activity')
  );

  return (
    <Card className="border border-border/80 bg-card/65 shadow-medium rounded-3xl overflow-hidden max-w-2xl w-full mx-auto select-none">
      <CardHeader className="pb-4 border-b border-border/40 bg-gradient-to-br from-card to-muted/10 relative">
        {/* Colorful top corner glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <CardTitle className="text-body-lg font-extrabold text-foreground leading-snug">
              Outcome Readiness Intelligence
            </CardTitle>
            <CardDescription className="text-metadata text-muted-foreground font-semibold leading-normal">
              Analyzing alignment for "{opportunity.title}" at {opportunity.organizationName}
            </CardDescription>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer rounded-full p-0 flex items-center justify-center shrink-0 border border-border/40"
            >
              ✕
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Dynamic readiness overview */}
        <div className="bg-muted/15 border border-border/40 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <ReadinessMeter score={readinessScore} size="lg" />
          <div className="text-center sm:text-left space-y-1">
            <p className="text-metadata text-muted-foreground font-semibold">
              Ecosystem Assessment
            </p>
            <h4 className="text-body-sm font-bold text-foreground">
              {readinessScore >= 80
                ? '⭐ Excellent match for this role!'
                : readinessScore >= 50
                ? '📈 You are well on your way. Solve the gaps below!'
                : '💡 Focus on roadmap progression and skill milestones first.'}
            </h4>
          </div>
        </div>

        {/* Dynamic Actionable Gaps List */}
        <div className="space-y-4">
          <h4 className="text-body-xs font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary shrink-0" />
            <span>Path to 100% Readiness</span>
          </h4>

          {readinessGaps.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center border border-success/15 bg-success/5 rounded-2xl space-y-2">
              <CheckCircle className="h-8 w-8 text-success" />
              <h5 className="text-body-xs font-bold text-foreground">Fully Ready!</h5>
              <p className="text-metadata text-muted-foreground font-medium max-w-sm">
                You meet all recommended curriculum roadmaps, skills criteria, and mentorship guidelines. Go ahead and submit your application!
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Category: Roadmaps */}
              {roadmapGaps.map((gap, index) => (
                <div
                  key={`roadmap-${index}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/20 border border-border/50 rounded-2xl transition-all hover:bg-muted/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl shrink-0 mt-0.5">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-body-xs font-bold text-foreground">Curriculum Goal</h5>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {gap}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/explore')}
                    variant="outline"
                    size="sm"
                    className="h-8 text-[11px] font-bold rounded-lg shrink-0 cursor-pointer self-start sm:self-center"
                  >
                    <span>Resume Learning</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}

              {/* Category: Skills */}
              {skillGaps.map((gap, index) => (
                <div
                  key={`skill-${index}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/20 border border-border/50 rounded-2xl transition-all hover:bg-muted/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-violet-500/10 text-violet-500 rounded-xl shrink-0 mt-0.5">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-body-xs font-bold text-foreground">Missing Capability</h5>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {gap}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/explore')}
                    variant="outline"
                    size="sm"
                    className="h-8 text-[11px] font-bold rounded-lg shrink-0 cursor-pointer self-start sm:self-center"
                  >
                    <span>Acquire Skill</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}

              {/* Category: Mentorship Prep */}
              {sessionGaps.map((gap, index) => (
                <div
                  key={`session-${index}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/20 border border-border/50 rounded-2xl transition-all hover:bg-muted/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-success/10 text-success rounded-xl shrink-0 mt-0.5">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-body-xs font-bold text-foreground">Mentorship Review</h5>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {gap}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/sessions/public')}
                    variant="primary"
                    size="sm"
                    className="h-8 text-[11px] font-bold rounded-lg shrink-0 cursor-pointer self-start sm:self-center text-white"
                  >
                    <span>Book Workshop</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}

              {/* Category: Confidence */}
              {confidenceGaps.map((gap, index) => (
                <div
                  key={`confidence-${index}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-muted/20 border border-border/50 rounded-2xl transition-all hover:bg-muted/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-warning/10 text-warning rounded-xl shrink-0 mt-0.5">
                      <Compass className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-body-xs font-bold text-foreground">Guidance Refocus</h5>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                        {gap}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    size="sm"
                    className="h-8 text-[11px] font-bold rounded-lg shrink-0 cursor-pointer self-start sm:self-center"
                  >
                    <span>Check In</span>
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Warning Alert */}
        <div className="bg-destructive/5 border border-destructive/10 p-4.5 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="h-4.5 w-4.5 text-destructive shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h5 className="text-[11px] font-extrabold uppercase text-destructive tracking-widest leading-none">
              Aspirational Guidance
            </h5>
            <p className="text-metadata text-muted-foreground font-semibold mt-1 leading-normal">
              Readiness is an estimation based on your course track, completed step logs, confidence reflections, and sessions attendance. Do not be discouraged if your score is low; complete the missing steps to level up!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
