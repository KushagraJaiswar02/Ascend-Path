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
  Sparkles,
  Lock,
  Compass,
  FileCode,
  BookMarked
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StepCompletionToggle } from './StepCompletionToggle';
import { MarkdownRenderer } from './MarkdownRenderer';

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
  isActive?: boolean;
  isLocked?: boolean;
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
  isActive = false,
  isLocked = false,
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
        return <Play className="h-4 w-4 text-blue-500 fill-blue-500/10 shrink-0" />;
      case 'project':
        return <Code className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'assignment':
        return <FileText className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-purple-500 shrink-0" />;
      case 'session':
        return <Users className="h-4 w-4 text-pink-500 shrink-0" />;
      case 'external resource':
        return <ExternalLink className="h-4 w-4 text-cyan-500 shrink-0" />;
      default:
        return <BookOpen className="h-4 w-4 text-indigo-500 shrink-0" />;
    }
  };

  // Helper to extract clean video iframe embed link (YouTube, Vimeo, Loom)
  const getVideoEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // YouTube embeds
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    
    // Vimeo embeds
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/i);
    if (vimeoMatch && vimeoMatch[3]) {
      return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
    }
    
    // Loom embeds
    const loomMatch = url.match(/loom\.com\/share\/([^"&?\/\s]+)/i);
    if (loomMatch && loomMatch[1]) {
      return `https://www.loom.com/embed/${loomMatch[1]}`;
    }
    
    return url;
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

  const videoEmbed = step.videoUrl ? getVideoEmbedUrl(step.videoUrl) : '';
  const isEmbeddable = videoEmbed.includes('youtube.com/embed') || videoEmbed.includes('vimeo.com/video') || videoEmbed.includes('loom.com/embed');

  return (
    <div 
      className={`bg-card border rounded-2xl transition-all duration-300 relative overflow-hidden group/card ${
        isCompleted 
          ? 'border-emerald-500/10 bg-emerald-500/[0.01] hover:border-emerald-500/20' 
          : isActive
            ? 'border-primary/30 shadow-subtle ring-1 ring-primary/5 hover:border-primary/40 bg-gradient-to-br from-card to-primary/[0.01]'
            : isLocked
              ? 'border-border/40 opacity-70 hover:opacity-85'
              : 'border-border/80 hover:border-border'
      }`}
    >
      {/* Visual left edge highlighting for currently active step */}
      {isActive && (
        <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full z-20" />
      )}

      {/* Primary Card Row */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4.5 flex items-center justify-between gap-sm flex-wrap sm:flex-nowrap cursor-pointer select-none"
      >
        <div className="flex items-start gap-3.5 w-full min-w-0">
          {/* Step Type Icon Indicator */}
          <div className={`p-2.5 rounded-xl border mt-xxs transition-colors shrink-0 ${
            isCompleted 
              ? 'bg-emerald-500/5 border-emerald-500/15' 
              : isActive
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-muted/40 border-border/40 text-muted-foreground'
          }`}>
            {isLocked ? <Lock className="h-4 w-4 text-muted-foreground/60 shrink-0" /> : getStepIcon()}
          </div>

          <div className="space-y-1 w-full min-w-0">
            <div className="flex items-center gap-xs flex-wrap">
              <h4 className={`text-body-xs font-bold transition-all truncate pr-1 ${
                isCompleted 
                  ? 'text-muted-foreground/80 line-through font-semibold' 
                  : isActive
                    ? 'text-foreground font-black text-primary'
                    : 'text-foreground'
              }`}>
                {step.title}
              </h4>
              {step.isOptional && (
                <span className="px-1.5 py-[2px] bg-muted/60 text-[8px] font-extrabold uppercase tracking-widest text-muted-foreground rounded border border-border/80 select-none">
                  Optional
                </span>
              )}
              {isActive && (
                <span className="px-1.5 py-[2px] bg-primary/10 text-primary text-[8px] font-extrabold uppercase tracking-widest rounded border border-primary/15 select-none animate-pulse">
                  Up Next
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-sm text-[10px] font-bold text-muted-foreground select-none">
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3 shrink-0" />
                <span>{step.estimatedMinutes || 20}m</span>
              </span>
              <span className="capitalize">• {step.difficulty || 'beginner'}</span>
              <span className="uppercase">• {step.type || 'article'}</span>
            </div>
          </div>
        </div>

        {/* Completion Control, Bookmark, and Collapse Button */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0 pt-sm sm:pt-0 shrink-0 select-none">
          {isEnrolled && !isLocked && (
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
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-sm'
                    : 'bg-card text-muted-foreground hover:text-foreground border-border/80 hover:border-border'
                }`}
                title="Bookmark step"
              >
                <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
              </button>
            </>
          )}
          <div className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </div>
        </div>
      </div>

      {/* Expanded Learning Unit Content Panel */}
      {isOpen && (
        <div className="px-5 pb-6 pt-2 border-t border-border/40 space-y-5 bg-muted/[0.08] select-text">
          
          {/* Locked future feedback warning */}
          {isLocked && (
            <div className="flex items-center gap-3 p-3 bg-muted/40 border border-border/60 rounded-2xl select-none">
              <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-[11px] font-bold text-muted-foreground">
                This curriculum milestone is locked. Complete the preceding active steps to unlock this content slot.
              </span>
            </div>
          )}

          {/* Mentor Tip Callout Banner */}
          {step.mentorTip && (
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl select-text transition-all hover:bg-primary/10 hover:border-primary/15">
              <div className="h-5.5 w-5.5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 select-none">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-extrabold uppercase text-primary tracking-wider leading-none select-none">
                  Mentor Tip & Advice
                </p>
                <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
                  {step.mentorTip}
                </p>
              </div>
            </div>
          )}

          {/* Detailed step description */}
          {step.description && (
            <p className="text-body-xs text-muted-foreground/90 leading-relaxed max-w-3xl">
              {step.description}
            </p>
          )}

          {/* Embedded Video Lecture */}
          {step.videoUrl && (
            <div className="space-y-2">
              <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground select-none">Lecture Embed</h5>
              
              {isEmbeddable ? (
                <div className="relative aspect-video w-full max-w-2xl rounded-2xl overflow-hidden border border-border/80 bg-slate-900 shadow-md">
                  <iframe
                    src={videoEmbed}
                    title={step.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
              ) : (
                <a
                  href={step.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-card border border-border hover:border-primary/30 rounded-xl transition group text-body-xs font-bold text-foreground max-w-xl"
                >
                  <span className="truncate pr-xs">{step.videoUrl}</span>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-primary group-hover:underline shrink-0 flex items-center gap-1">
                    <span>Watch Externally</span>
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </a>
              )}
            </div>
          )}

          {/* Rich Learning Notes (Markdown Renderer) */}
          {step.richNotes && (
            <div className="space-y-2 border-t border-border/40 pt-4">
              <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground select-none">Conceptual Lesson Notes</h5>
              <div className="p-4.5 bg-card border border-border/60 rounded-2xl shadow-xs">
                <MarkdownRenderer content={step.richNotes} />
              </div>
            </div>
          )}

          {/* Structured Resources Collection */}
          {step.resources && step.resources.length > 0 && (
            <div className="space-y-2 border-t border-border/40 pt-4 select-none">
              <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Curated Study Resources</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {step.resources.map((res: any, idx: number) => {
                  const isRepo = res.type === 'repository' || res.url.includes('github.com');
                  const isDoc = res.type === 'documentation' || res.type === 'docs';
                  const isVideo = res.type === 'video' || res.type === 'tutorial';

                  return (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start justify-between p-4 bg-card border border-border/80 hover:border-primary/30 rounded-2xl transition group shadow-xs hover:shadow-subtle"
                    >
                      <div className="flex gap-3 items-center min-w-0 pr-xs">
                        <div className="p-2 bg-muted/40 text-muted-foreground rounded-lg border border-border/50 group-hover:scale-105 transition-transform duration-200 shrink-0">
                          {isRepo ? (
                            <FileCode className="h-4.5 w-4.5 text-slate-700 dark:text-slate-300" />
                          ) : isDoc ? (
                            <BookMarked className="h-4.5 w-4.5 text-blue-500" />
                          ) : isVideo ? (
                            <Play className="h-4.5 w-4.5 text-amber-500 fill-amber-500/10" />
                          ) : (
                            <Compass className="h-4.5 w-4.5 text-indigo-500" />
                          )}
                        </div>
                        <div className="min-w-0 space-y-0.5 text-left">
                          <span className="text-[11px] font-extrabold text-foreground block truncate">{res.title}</span>
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block">{res.type || 'reference link'}</span>
                        </div>
                      </div>
                      <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-center">
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Learner Notes Workspace */}
          {isEnrolled && !isLocked && (
            <div className="space-y-2 border-t border-border/40 pt-4">
              <div className="flex items-center justify-between select-none">
                <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <FileEdit className="h-3 w-3 text-primary" />
                  <span>My Study Notes Workspace</span>
                </h5>
                <Button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  variant="ghost"
                  className="h-8 text-[9px] font-black uppercase tracking-wider gap-xxs px-3 border border-border bg-card shadow-sm cursor-pointer select-none rounded-xl"
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
                      <span>Save Worklog</span>
                    </>
                  )}
                </Button>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Jot down personal notes, code snippets, VPC configurations, or questions to ask your guide in this space..."
                className="w-full min-h-[100px] p-3 text-body-xs text-foreground bg-card border border-border rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-y leading-relaxed font-semibold"
              />
            </div>
          )}

        </div>
      )}
    </div>
  );
};
