import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { RoadmapStepCard } from './RoadmapStepCard';

interface RoadmapSectionAccordionProps {
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

export const RoadmapSectionAccordion: React.FC<RoadmapSectionAccordionProps> = ({
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // By default, open the first section
    if (sections.length > 0) {
      return { [sections[0]._id]: true };
    }
    return {};
  });

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Helper to count required step completions in a section
  const getSectionProgress = (section: any) => {
    const requiredSteps = section.steps?.filter((s: any) => !s.isOptional) || [];
    const totalRequired = requiredSteps.length;
    const completedRequired = requiredSteps.filter((s: any) => completedSteps.includes(s._id.toString())).length;
    return { completedRequired, totalRequired };
  };

  return (
    <div className="space-y-md select-none">
      {sections.map((section) => {
        const isOpen = !!openSections[section._id];
        const { completedRequired, totalRequired } = getSectionProgress(section);
        const isSectionFinished = totalRequired > 0 && completedRequired === totalRequired;

        return (
          <div
            key={section._id}
            className={`bg-card border rounded-2xl overflow-hidden transition-all duration-300 ${
              isOpen ? 'shadow-sm border-border' : 'border-border/60 hover:border-border'
            }`}
          >
            {/* Section Header Row */}
            <div
              onClick={() => toggleSection(section._id)}
              className="p-5 flex items-center justify-between gap-sm cursor-pointer select-none bg-muted/[0.15] border-b border-border/40"
            >
              <div className="space-y-xxs">
                <div className="flex items-center gap-xs flex-wrap">
                  <h3 className="text-body-sm font-black text-foreground">
                    {section.title}
                  </h3>
                  {isSectionFinished && (
                    <span className="flex items-center gap-xxs text-[9px] font-extrabold uppercase text-emerald-600 bg-emerald-500/5 px-xs py-xxs border border-emerald-500/10 rounded">
                      <CheckCircle className="h-3 w-3 shrink-0" />
                      <span>Section Done</span>
                    </span>
                  )}
                </div>
                {section.description && (
                  <p className="text-muted-foreground text-body-xs font-medium max-w-2xl leading-relaxed">
                    {section.description}
                  </p>
                )}
              </div>

              {/* Progress Count Indicator & Collapse button */}
              <div className="flex items-center gap-md shrink-0">
                {totalRequired > 0 && (
                  <div className="flex items-center gap-xs text-[10px] font-extrabold text-muted-foreground bg-card border border-border/80 px-sm py-[5px] rounded-xl shadow-xs">
                    <span>Required:</span>
                    <span className={completedRequired === totalRequired ? 'text-emerald-600' : 'text-foreground'}>
                      {completedRequired} / {totalRequired}
                    </span>
                  </div>
                )}
                <div className="p-1 rounded-lg text-muted-foreground">
                  {isOpen ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                </div>
              </div>
            </div>

            {/* Accordion Steps List Content */}
            {isOpen && (
              <div className="p-4 sm:p-5 space-y-sm select-text">
                {section.steps && section.steps.length > 0 ? (
                  section.steps.map((step: any) => (
                    <RoadmapStepCard
                      key={step._id}
                      step={step}
                      isCompleted={completedSteps.includes(step._id.toString())}
                      isBookmarked={bookmarkedSteps.includes(step._id.toString())}
                      noteText={notes[step._id.toString()]}
                      isEnrolled={isEnrolled}
                      onToggleComplete={() => onToggleComplete(step._id)}
                      onToggleBookmark={() => onToggleBookmark(step._id)}
                      onSaveNote={(text) => onSaveNote(step._id, text)}
                      isTogglingComplete={togglingStepId === step._id}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-body-xs font-bold select-none border border-dashed border-border/60 rounded-2xl">
                    No steps have been added to this curriculum section yet.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
