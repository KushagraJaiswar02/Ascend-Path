import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Play,
  Code,
  FileText,
  HelpCircle,
  Users,
  ExternalLink,
  Clock,
  Bookmark,
  ChevronDown,
  ChevronUp,
  FileEdit,
  Save,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepCompletionToggle } from './StepCompletionToggle';

interface RoadmapStepCardProps {
  step: any;
  isCompleted: boolean;
  isBookmarked: boolean;
  noteText?: string;
  isEnrolled: boolean;
  onToggleComplete: () => void;
  onToggleBookmark: () => void;
  onSaveNote: (text: string) => void;
  isTogglingComplete: boolean;
}

export const RoadmapStepCard: React.FC<RoadmapStepCardProps> = ({
  step,
  isCompleted,
  isBookmarked,
  noteText = '',
  isEnrolled,
  onToggleComplete,
  onToggleBookmark,
  onSaveNote,
  isTogglingComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState(noteText);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setNote(noteText);
  }, [noteText]);

  // Determine icon based on step type
  const getStepIcon = () => {
    switch (step.type) {
      case 'video':
        return <Play className="h-4.5 w-4.5 text-blue-500 fill-blue-500/10 shrink-0" />;
      case 'project':
        return <Code className="h-4.5 w-4.5 text-emerald-500 shrink-0" />;
      case 'assignment':
        return <FileText className="h-4.5 w-4.5 text-amber-500 shrink-0" />;
      case 'quiz':
        return <HelpCircle className="h-4.5 w-4.5 text-purple-500 shrink-0" />;
      case 'session':
        return <Users className="h-4.5 w-4.5 text-pink-500 shrink-0" />;
      case 'external resource':
        return <ExternalLink className="h-4.5 w-4.5 text-cyan-500 shrink-0" />;
      default:
        return <BookOpen className="h-4.5 w-4.5 text-indigo-500 shrink-0" />;
    }
  };

  const handleSaveNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSavingNote(true);
    onSaveNote(note);
    setTimeout(() => {
      setIsSavingNote(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }, 500);
  };

  return (
    <div className={`bg-card border rounded-2xl transition-all duration-300 ${
      isCompleted 
        ? 'border-emerald-500/20 bg-emerald-500/[0.01]' 
        : 'border-border/80 hover:border-border'
    }`}>
      {/* Primary Card Row */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 flex items-center justify-between gap-sm flex-wrap sm:flex-nowrap cursor-pointer select-none"
      >
        <div className="flex items-start gap-sm w-full">
          {/* Step Type Icon Indicator */}
          <div className={`p-2.5 rounded-xl border mt-xxs ${
            isCompleted 
              ? 'bg-emerald-500/5 border-emerald-500/10' 
              : 'bg-muted/40 border-border/40'
          }`}>
            {getStepIcon()}
          </div>

          <div className="space-y-xxs w-full">
            <div className="flex items-center gap-xs flex-wrap">
              <h4 className={`text-body-sm font-black transition-colors ${
                isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
              }`}>
                {step.title}
              </h4>
              {step.isOptional && (
                <span className="px-xs py-[2px] bg-muted text-[8px] font-extrabold uppercase tracking-widest text-muted-foreground rounded border border-border/80">
                  Optional
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-sm text-[10px] font-bold text-muted-foreground">
              <span className="flex items-center gap-xxs">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{step.estimatedMinutes || 20}m</span>
              </span>
              <span className="capitalize">• {step.difficulty || 'beginner'}</span>
              <span className="uppercase">• {step.type || 'article'}</span>
            </div>
          </div>
        </div>

        {/* Completion Control, Bookmark Star, and Collapse Indicator */}
        <div className="flex items-center gap-xs ml-auto sm:ml-0 pt-sm sm:pt-0 shrink-0">
          {isEnrolled && (
            <>
              <StepCompletionToggle
                isCompleted={isCompleted}
                isLoading={isTogglingComplete}
                onToggle={onToggleComplete}
                isOptional={step.isOptional}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark();
                }}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-card text-muted-foreground hover:text-foreground border-border/80'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              </button>
            </>
          )}
          <div className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {/* Expandable Resources & Learner Notes Panel */}
      {isOpen && (
        <div className="px-5 pb-5 pt-xxs border-t border-border/40 space-y-md bg-muted/5 select-text">
          {/* Detailed step description */}
          {step.description && (
            <p className="text-body-xs text-muted-foreground leading-relaxed max-w-3xl">
              {step.description}
            </p>
          )}

          {/* Structured Resources */}
          {step.resources && step.resources.length > 0 && (
            <div className="space-y-xs">
              <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Learning Resources</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
                {step.resources.map((res: any, idx: number) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-card border border-border/60 hover:border-primary/40 rounded-xl transition group text-body-xs font-bold text-foreground"
                  >
                    <span className="truncate pr-xs">{res.title}</span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-primary group-hover:underline shrink-0 flex items-center gap-xxs">
                      <span>{res.type || 'Link'}</span>
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Learner Notes Workspace */}
          {isEnrolled && (
            <div className="space-y-xs pt-xs">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-xxs">
                  <FileEdit className="h-3 w-3" />
                  <span>My Study Notes</span>
                </h5>
                <Button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  variant="ghost"
                  className="h-7 text-[9px] font-black uppercase tracking-wider gap-xxs px-xs border border-border bg-card shadow-sm cursor-pointer select-none"
                >
                  {isSavingNote ? (
                    'Saving...'
                  ) : savedSuccess ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span className="text-emerald-500">Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3" />
                      <span>Save Note</span>
                    </>
                  )}
                </Button>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Jot down notes, code snippets, key concepts or URLs to remember from this lesson..."
                className="w-full min-h-[90px] p-3 text-body-xs text-foreground bg-card border border-border rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-y leading-relaxed"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
