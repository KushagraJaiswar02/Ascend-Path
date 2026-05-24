import React from 'react';
import { CheckCircle2, Lock, Circle } from 'lucide-react';
import { RoadmapStepCard } from './RoadmapStepCard';

interface RoadmapTimelineProps {
  sections: any[];
  completedSteps: string[];
  bookmarkedSteps: string[];
  notes: Record<string, string>;
  isEnrolled: boolean;
  onToggleComplete: (stepId: string) => void;
  onToggleBookmark: (stepId: string) => void;
  onSaveNote: (stepId: string, text: string) => void;
  togglingStepId?: string;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  sections,
  completedSteps,
  bookmarkedSteps,
  notes,
  isEnrolled,
  onToggleComplete,
  onToggleBookmark,
  onSaveNote,
  togglingStepId,
}) => {
  const completedSet = new Set(completedSteps.map(id => id.toString()));

  // 1. Pre-determine the active step (first uncompleted required step)
  let activeStepId: string | null = null;
  let foundActive = false;

  for (const section of sections) {
    if (section.steps) {
      for (const step of section.steps) {
        if (!step.isOptional && !completedSet.has(step._id.toString())) {
          activeStepId = step._id.toString();
          foundActive = true;
          break;
        }
      }
    }
    if (foundActive) break;
  }

  // 2. Scan steps and build visual timeline list
  let hasPassedActive = false;

  return (
    <div className="relative pl-4 sm:pl-6 space-y-10 py-4 select-none">
      {/* Background timeline core path vertical connector line */}
      <div className="absolute left-[29px] sm:left-[37px] top-6 bottom-6 w-0.5 bg-border/60 pointer-events-none" />

      {sections.map((section, sIdx) => {
        const sectionSteps = section.steps || [];
        const requiredSteps = sectionSteps.filter((s: any) => !s.isOptional) || [];
        const completedRequired = requiredSteps.filter((s: any) => completedSet.has(s._id.toString())).length;
        const isSectionFinished = requiredSteps.length > 0 && completedRequired === requiredSteps.length;

        return (
          <div key={section._id} className="space-y-6 relative">
            
            {/* ================= MODULE NODE SECTION HEADER ================= */}
            <div className="flex items-center gap-4 relative z-10 select-none">
              {/* Giant visual node bullet for module */}
              <div 
                className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                  isSectionFinished
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-card text-muted-foreground border-border/80'
                }`}
              >
                {isSectionFinished ? (
                  <CheckCircle2 className="h-5 w-5 stroke-[2.2]" />
                ) : (
                  <span className="text-[10px] font-black">{sIdx + 1}</span>
                )}
              </div>
              
              <div className="space-y-0.5">
                <div className="flex items-center gap-xs flex-wrap">
                  <h3 className="text-body-xs font-black text-foreground uppercase tracking-wider leading-none">
                    {section.title}
                  </h3>
                  {isSectionFinished && (
                    <span className="text-[9px] font-extrabold text-emerald-600 select-none leading-none bg-emerald-500/5 border border-emerald-500/10 px-1 rounded">
                      Completed
                    </span>
                  )}
                </div>
                {section.description && (
                  <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed max-w-2xl">
                    {section.description}
                  </p>
                )}
              </div>
            </div>

            {/* ================= STEPS TIMELINE SUB-NODES ================= */}
            <div className="pl-8 sm:pl-10 space-y-5 relative">
              {sectionSteps.map((step: any) => {
                const stepIdStr = step._id.toString();
                const isStepCompleted = completedSet.has(stepIdStr);
                const isActive = stepIdStr === activeStepId;
                
                // Determine lock state (uncompleted steps after active step are locked/future)
                let isLocked = false;
                if (!isStepCompleted && !isActive) {
                  if (activeStepId && hasPassedActive) {
                    isLocked = true;
                  }
                }

                if (isActive) {
                  hasPassedActive = true;
                }

                return (
                  <div key={step._id} className="relative group/timeline flex gap-4 items-start">
                    
                    {/* Small step dot connector */}
                    <div className="absolute left-[-24px] sm:left-[-29px] top-4.5 flex items-center justify-center shrink-0 z-10 select-none">
                      {isStepCompleted ? (
                        <div className="h-4 w-4 rounded-full bg-emerald-500 border border-emerald-500/20 text-white flex items-center justify-center shadow-subtle">
                          <CheckCircle2 className="h-3 w-3 stroke-[2.5]" />
                        </div>
                      ) : isActive ? (
                        <div className="relative flex h-4.5 w-4.5 items-center justify-center select-none">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/20 opacity-75"></span>
                          <div className="relative h-3 w-3 rounded-full bg-primary border-2 border-card shadow-md flex items-center justify-center" />
                        </div>
                      ) : isLocked ? (
                        <div className="h-3 w-3 rounded-full bg-muted border border-border/80 flex items-center justify-center text-muted-foreground shadow-sm">
                          <Lock className="h-1.5 w-1.5" />
                        </div>
                      ) : (
                        <div className="h-3.5 w-3.5 rounded-full bg-card border border-border/80 flex items-center justify-center text-muted-foreground shadow-sm">
                          <Circle className="h-1.5 w-1.5 fill-muted-foreground/30 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Step Card Learning Unit */}
                    <div className="flex-1 min-w-0">
                      <RoadmapStepCard
                        step={step}
                        isCompleted={isStepCompleted}
                        isBookmarked={bookmarkedSteps.includes(stepIdStr)}
                        noteText={notes[stepIdStr]}
                        isEnrolled={isEnrolled}
                        onToggleComplete={() => onToggleComplete(step._id)}
                        onToggleBookmark={() => onToggleBookmark(step._id)}
                        onSaveNote={(text) => onSaveNote(step._id, text)}
                        isTogglingComplete={togglingStepId === step._id}
                        isActive={isActive}
                        isLocked={isLocked}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        );
      })}
    </div>
  );
};
