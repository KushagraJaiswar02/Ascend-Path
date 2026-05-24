import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Loader2,
  Play,
  BookOpen,
  LayoutGrid,
  Sparkles,
  FileText,
  Code,
  HelpCircle,
  Users,
  ExternalLink,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Lock,
  Check,
  CheckCircle2,
  FileEdit,
  Eye,
  Settings,
  X,
  Compass,
  ArrowRight,
  ListTodo
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useRoadmap } from '../features/roadmaps/hooks/useRoadmapProgress';
import { apiClient } from '../services/apiClient';
import { MarkdownRenderer } from '../features/roadmaps/components/MarkdownRenderer';

export const RoadmapBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Existing roadmap ID if editing
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEditingMode = !!id;

  // Roadmap Form Fields (Metadata)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [estimatedWeeks, setEstimatedWeeks] = useState(8);
  const [domainsInput, setDomainsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [prereqInput, setPrereqInput] = useState('');
  const [outcomesInput, setOutcomesInput] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // General States
  const [roadmapId, setRoadmapId] = useState<string | null>(null);
  const [isSavingRoadmap, setIsSavingRoadmap] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Curriculum Data (Fetched if editing)
  const { data: roadmap, refetch: refetchRoadmap, isLoading: isLoadRoadmapLoading } = useRoadmap(id || '', isEditingMode);

  // --- SECTION / MODULE STATES ---
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDesc, setSectionDesc] = useState('');
  const [sectionOrder, setSectionOrder] = useState(0);
  const [isSavingSection, setIsSavingSection] = useState(false);

  // --- STEP STATES ---
  const [addingStepToSectionId, setAddingStepToSectionId] = useState<string | null>(null);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [isSavingStep, setIsSavingStep] = useState(false);

  // Step Form Fields
  const [stepTitle, setStepTitle] = useState('');
  const [stepDesc, setStepDesc] = useState('');
  const [stepType, setStepType] = useState<'article' | 'video' | 'project' | 'assignment' | 'quiz' | 'session' | 'external resource'>('article');
  const [stepMins, setStepMins] = useState(20);
  const [stepDifficulty, setStepDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [stepOptional, setStepOptional] = useState(false);
  const [stepOrder, setStepOrder] = useState(0);
  const [resourcesList, setResourcesList] = useState<{ type: string; title: string; url: string }[]>([]);
  const [richNotes, setRichNotes] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [mentorTip, setMentorTip] = useState('');

  // Resource Creator Form Nested Inputs
  const [newResType, setNewResType] = useState('article');
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');

  // Modal visual tab controls
  const [activeStepTab, setActiveStepTab] = useState<'overview' | 'notes' | 'video' | 'resources' | 'tip'>('overview');
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

  // Populate metadata details if editing
  useEffect(() => {
    if (roadmap) {
      setRoadmapId(roadmap._id);
      setTitle(roadmap.title);
      setDescription(roadmap.description || '');
      setDifficulty(roadmap.difficulty);
      setEstimatedWeeks(roadmap.estimatedWeeks || 8);
      setDomainsInput(roadmap.domains?.join(', ') || '');
      setTagsInput(roadmap.tags?.join(', ') || '');
      setPrereqInput(roadmap.prerequisites?.join('\n') || '');
      setOutcomesInput(roadmap.learningOutcomes?.join('\n') || '');
      setIsPublished(roadmap.isPublished || false);
    }
  }, [roadmap]);

  // Auth Guard: Only Guides/Admins/Moderators can build roadmaps
  if (user?.role !== 'guide' && user?.role !== 'admin' && user?.role !== 'moderator') {
    return (
      <PageContainer size="default" className="py-10 text-center select-none">
        <Card className="max-w-md mx-auto border-destructive/20 bg-destructive/5 p-8 flex flex-col items-center gap-md rounded-3xl">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-body-md font-black text-foreground mb-xxs">Access Prohibited</h3>
            <p className="text-muted-foreground text-body-xs font-semibold leading-relaxed">
              Only verified Mentors, Guides, and Pathfinders possess catalog clearance to curate learning roadmaps.
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard')} className="font-bold rounded-xl">
            Back to Dashboard
          </Button>
        </Card>
      </PageContainer>
    );
  }

  // --- ACTIONS ---

  // 1. Save general Roadmap Specs
  const handleSaveRoadmap = async () => {
    if (!title.trim()) {
      setStatusMessage({ text: 'Roadmap title is required', isError: true });
      return;
    }

    setIsSavingRoadmap(true);
    setStatusMessage(null);

    const payload = {
      title,
      description,
      difficulty,
      estimatedWeeks: Number(estimatedWeeks),
      domains: domainsInput.split(',').map((d) => d.trim()).filter(Boolean),
      tags: tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
      prerequisites: prereqInput.split('\n').map((p) => p.trim()).filter(Boolean),
      learningOutcomes: outcomesInput.split('\n').map((o) => o.trim()).filter(Boolean),
      isPublished,
      visibility: 'public' as const,
    };

    try {
      if (roadmapId) {
        // Update
        await apiClient.patch(`/roadmaps/${roadmapId}`, payload);
        setStatusMessage({ text: 'Roadmap metadata saved successfully!', isError: false });
        if (isEditingMode) refetchRoadmap();
      } else {
        // Create
        const { data } = await apiClient.post('/roadmaps', payload);
        setStatusMessage({ text: 'Roadmap created successfully! Redirecting...', isError: false });
        // Redirect immediately to editing path to bind sections & steps canvas
        setTimeout(() => {
          navigate(`/roadmaps/builder/${data.data.roadmap._id}`, { replace: true });
        }, 1200);
      }
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.message || 'Failed to save roadmap details.', isError: true });
    } finally {
      setIsSavingRoadmap(false);
    }
  };

  // 2. Open / Close / Save Modules (Sections)
  const handleOpenAddSection = () => {
    setIsAddingSection(true);
    setEditingSectionId(null);
    setSectionTitle('');
    setSectionDesc('');
    // Auto-calculate order at the end of sections
    const maxOrder = roadmap?.sections?.reduce((max: number, s: any) => Math.max(max, s.order || 0), 0) || 0;
    setSectionOrder(maxOrder + 10);
  };

  const handleOpenEditSection = (section: any) => {
    setEditingSectionId(section._id);
    setIsAddingSection(false);
    setSectionTitle(section.title);
    setSectionDesc(section.description || '');
    setSectionOrder(section.order || 0);
  };

  const handleSaveSection = async () => {
    if (!sectionTitle.trim() || !roadmapId) return;

    setIsSavingSection(true);
    try {
      const payload = {
        title: sectionTitle,
        description: sectionDesc,
        order: Number(sectionOrder),
      };

      if (editingSectionId) {
        await apiClient.patch(`/sections/${editingSectionId}`, payload);
      } else {
        await apiClient.post(`/roadmaps/${roadmapId}/sections`, payload);
      }

      setIsAddingSection(false);
      setEditingSectionId(null);
      setSectionTitle('');
      setSectionDesc('');
      if (isEditingMode) refetchRoadmap();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this module section and all its associated steps?')) return;
    try {
      await apiClient.delete(`/sections/${sectionId}`);
      if (isEditingMode) refetchRoadmap();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Open / Close / Save Steps
  const handleOpenAddStep = (sectionId: string) => {
    setAddingStepToSectionId(sectionId);
    setEditingStepId(null);
    setStepTitle('');
    setStepDesc('');
    setStepType('article');
    setStepMins(20);
    setStepDifficulty('beginner');
    setStepOptional(false);
    
    // Auto-calculate step order
    const section = roadmap?.sections?.find((s: any) => s._id === sectionId);
    const maxOrder = section?.steps?.reduce((max: number, s: any) => Math.max(max, s.order || 0), 0) || 0;
    setStepOrder(maxOrder + 10);

    setResourcesList([]);
    setRichNotes('');
    setVideoUrl('');
    setMentorTip('');
    setActiveStepTab('overview');
    setShowMarkdownPreview(false);
  };

  const handleOpenEditStep = (step: any) => {
    setEditingStepId(step._id);
    setAddingStepToSectionId(null);
    setStepTitle(step.title);
    setStepDesc(step.description || '');
    setStepType(step.type || 'article');
    setStepMins(step.estimatedMinutes || 20);
    setStepDifficulty(step.difficulty || 'beginner');
    setStepOptional(step.isOptional || false);
    setStepOrder(step.order || 0);
    setResourcesList(step.resources || []);
    setRichNotes(step.richNotes || '');
    setVideoUrl(step.videoUrl || '');
    setMentorTip(step.mentorTip || '');
    setActiveStepTab('overview');
    setShowMarkdownPreview(false);
  };

  const handleCloseStepModal = () => {
    setAddingStepToSectionId(null);
    setEditingStepId(null);
    setResourcesList([]);
    setNewResTitle('');
    setNewResUrl('');
  };

  const handleSaveStep = async () => {
    if (!stepTitle.trim()) return;

    setIsSavingStep(true);
    const payload = {
      title: stepTitle,
      description: stepDesc,
      type: stepType,
      estimatedMinutes: Number(stepMins),
      difficulty: stepDifficulty,
      isOptional: stepOptional,
      order: Number(stepOrder),
      resources: resourcesList,
      richNotes: richNotes.trim(),
      videoUrl: videoUrl.trim(),
      mentorTip: mentorTip.trim(),
    };

    try {
      if (editingStepId) {
        await apiClient.patch(`/steps/${editingStepId}`, payload);
      } else if (addingStepToSectionId) {
        await apiClient.post(`/sections/${addingStepToSectionId}/steps`, payload);
      }
      handleCloseStepModal();
      if (isEditingMode) refetchRoadmap();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingStep(false);
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    if (!window.confirm('Are you sure you want to delete this curriculum step?')) return;
    try {
      await apiClient.delete(`/steps/${stepId}`);
      if (isEditingMode) refetchRoadmap();
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Nested Link Resource Helpers
  const handleAddResource = () => {
    if (!newResTitle.trim() || !newResUrl.trim()) return;
    setResourcesList([...resourcesList, { type: newResType, title: newResTitle.trim(), url: newResUrl.trim() }]);
    setNewResTitle('');
    setNewResUrl('');
  };

  const handleDeleteResource = (idx: number) => {
    setResourcesList(resourcesList.filter((_, i) => i !== idx));
  };

  // Helper to extract clean video iframe embed link
  const getVideoEmbedUrl = (url: string) => {
    if (!url) return '';
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/i);
    if (vimeoMatch && vimeoMatch[3]) {
      return `https://player.vimeo.com/video/${vimeoMatch[3]}`;
    }
    const loomMatch = url.match(/loom\.com\/share\/([^"&?\/\s]+)/i);
    if (loomMatch && loomMatch[1]) {
      return `https://www.loom.com/embed/${loomMatch[1]}`;
    }
    return url;
  };

  const videoEmbed = getVideoEmbedUrl(videoUrl);
  const isEmbeddable = videoEmbed.includes('youtube.com/embed') || videoEmbed.includes('vimeo.com/video') || videoEmbed.includes('loom.com/embed');

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-3.5 w-3.5 text-blue-500 fill-blue-500/10 shrink-0" />;
      case 'project':
        return <Code className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
      case 'assignment':
        return <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
      case 'quiz':
        return <HelpCircle className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
      case 'session':
        return <Users className="h-3.5 w-3.5 text-pink-500 shrink-0" />;
      case 'external resource':
        return <ExternalLink className="h-3.5 w-3.5 text-cyan-500 shrink-0" />;
      default:
        return <BookOpen className="h-3.5 w-3.5 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <PageContainer size="default" className="py-8 space-y-6 select-text relative">
      
      {/* ================= HEADER BAR ================= */}
      <div className="flex justify-between items-center select-none pb-4 border-b border-border/40">
        <div className="flex items-center gap-sm">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="h-8.5 px-sm text-body-xs font-black uppercase tracking-wider gap-xxs border border-border/80 bg-card shadow-sm cursor-pointer hover:bg-muted rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
          <h1 className="text-body-md sm:text-heading-md font-black tracking-tight text-foreground flex items-center gap-xs">
            <LayoutGrid className="h-5 w-5 text-primary shrink-0 animate-pulse" />
            <span>{isEditingMode ? 'Curriculum Authoring Studio' : 'Launch New Career Journey'}</span>
          </h1>
        </div>
        {isEditingMode && (
          <a
            href={`/roadmaps/${roadmapId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8.5 px-sm text-body-xs font-black uppercase tracking-wider gap-xxs border border-primary/20 bg-primary/5 text-primary shadow-subtle hover:bg-primary/10 rounded-xl transition flex items-center"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview Live View</span>
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ================= LEFT SIDE: ROADMAP METADATA PANEL ================= */}
        <div className="lg:col-span-1 space-y-6 select-none">
          <Card className="border border-border/80 shadow-subtle rounded-2xl overflow-hidden bg-card/60 backdrop-blur-xs">
            <div className="p-4 bg-muted/15 border-b border-border/40 select-none flex items-center justify-between">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-xxs">
                <Settings className="h-3.5 w-3.5 text-primary" />
                <span>Roadmap Specifications</span>
              </h3>
              {roadmapId && (
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/5 px-2 py-[2px] border border-emerald-500/10 rounded">
                  Saved
                </span>
              )}
            </div>
            
            <CardContent className="p-5 space-y-4">
              
              <div className="space-y-xxs">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. DevOps Engineer Path"
                  className="rounded-xl border border-border bg-card text-foreground"
                />
              </div>

              <div className="space-y-xxs">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Description Summary</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the target scope, path vision, and audience..."
                  className="w-full h-24 p-3 text-body-xs bg-card border border-border rounded-xl outline-none resize-none focus:ring-1 focus:ring-primary leading-normal font-semibold text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-xs">
                <div className="space-y-xxs">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl text-body-xs font-bold text-foreground px-sm py-xxs cursor-pointer outline-none focus:ring-1"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-xxs">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Est. Weeks</label>
                  <Input
                    type="number"
                    min={1}
                    value={estimatedWeeks}
                    onChange={(e) => setEstimatedWeeks(Number(e.target.value))}
                    className="rounded-xl border border-border bg-card text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-xxs">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Domains (comma-separated)</label>
                <Input
                  value={domainsInput}
                  onChange={(e) => setDomainsInput(e.target.value)}
                  placeholder="e.g. Backend, Infrastructure"
                  className="rounded-xl border bg-card text-foreground"
                />
              </div>

              <div className="space-y-xxs">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Tags (comma-separated)</label>
                <Input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. Docker, Linux, CI/CD"
                  className="rounded-xl border bg-card text-foreground"
                />
              </div>

              <div className="space-y-xxs">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Prerequisites (one per line)</label>
                <textarea
                  value={prereqInput}
                  onChange={(e) => setPrereqInput(e.target.value)}
                  placeholder="Basic Shell scripts..."
                  className="w-full h-20 p-3 text-body-xs bg-card border border-border rounded-xl outline-none resize-none focus:ring-1 focus:ring-primary leading-normal font-semibold text-foreground"
                />
              </div>

              <div className="space-y-xxs">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Learning Outcomes (one per line)</label>
                <textarea
                  value={outcomesInput}
                  onChange={(e) => setOutcomesInput(e.target.value)}
                  placeholder="Deploy secure multi-stage builds..."
                  className="w-full h-20 p-3 text-body-xs bg-card border border-border rounded-xl outline-none resize-none focus:ring-1 focus:ring-primary leading-normal font-semibold text-foreground"
                />
              </div>

              <div className="flex items-center gap-xs select-none py-xs border-t border-border/40">
                <input
                  type="checkbox"
                  id="published"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 text-primary bg-card border border-border rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="published" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground cursor-pointer flex items-center gap-1">
                  <span>Publish Template publicly</span>
                  {isPublished ? <CheckCircle2 className="h-3 w-3 text-emerald-500 fill-emerald-500/10" /> : <Lock className="h-3 w-3 text-muted-foreground/60" />}
                </label>
              </div>

              {statusMessage && (
                <div className={`p-3 rounded-xl border text-center text-body-xs font-bold leading-normal select-none ${
                  statusMessage.isError 
                    ? 'border-destructive/20 bg-destructive/5 text-destructive' 
                    : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600'
                }`}>
                  {statusMessage.text}
                </div>
              )}

              <Button
                onClick={handleSaveRoadmap}
                disabled={isSavingRoadmap}
                className="w-full h-10 bg-primary hover:bg-primary/95 text-white font-black rounded-xl uppercase tracking-wider text-body-xs flex items-center justify-center gap-xxs shadow-md transition"
              >
                {isSavingRoadmap ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>{roadmapId ? 'Update Specifications' : 'Initialize Roadmap'}</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ================= RIGHT SIDE: LIVE CURRICULUM SYLLABUS CANVAS ================= */}
        <div className="lg:col-span-2 space-y-6">
          
          {roadmapId ? (
            <div className="space-y-6">
              
              {/* Syllabus Header */}
              <div className="flex justify-between items-center select-none pb-2 border-b border-border/40">
                <div>
                  <h3 className="text-body-xs font-black text-foreground uppercase tracking-widest">Syllabus Curriculum Modules</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-0.5">
                    Structure lessons, add guides, video lectures, resource badges, and mentor advice.
                  </p>
                </div>
                <Button
                  onClick={handleOpenAddSection}
                  className="h-8.5 text-[9px] font-black uppercase tracking-wider gap-xxs px-sm bg-primary hover:bg-primary/95 text-white cursor-pointer select-none rounded-xl shadow-sm transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Module</span>
                </Button>
              </div>

              {/* Add / Edit Section Form Overlay Modal */}
              {(isAddingSection || editingSectionId) && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
                  <Card className="border border-border/80 shadow-2xl rounded-2xl w-full max-w-md bg-card overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-4 bg-muted/20 border-b border-border/40 flex justify-between items-center select-none">
                      <span className="text-body-xs font-black text-foreground">
                        {editingSectionId ? 'Edit Module properties' : 'Create Curriculum Module'}
                      </span>
                      <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl" onClick={handleCloseSectionModal}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-5 space-y-4">
                      <div className="space-y-xxs">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Module Title</label>
                        <Input
                          value={sectionTitle}
                          onChange={(e) => setSectionTitle(e.target.value)}
                          placeholder="e.g. Module 1: POSIX Basics"
                          className="rounded-xl border bg-card text-foreground"
                        />
                      </div>
                      <div className="space-y-xxs">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Module Description</label>
                        <textarea
                          value={sectionDesc}
                          onChange={(e) => setSectionDesc(e.target.value)}
                          placeholder="Brief summary of section learning goals..."
                          className="w-full h-16 p-2.5 text-body-xs bg-card border rounded-xl outline-none resize-none leading-normal font-semibold text-foreground"
                        />
                      </div>
                      <div className="space-y-xxs w-32">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Sorting Order</label>
                        <Input
                          type="number"
                          value={sectionOrder}
                          onChange={(e) => setSectionOrder(Number(e.target.value))}
                          className="rounded-xl border bg-card"
                        />
                      </div>
                      <div className="flex justify-end gap-xs pt-xs border-t border-border/40 select-none">
                        <Button variant="outline" onClick={handleCloseSectionModal} className="h-9.5 text-body-xs font-bold rounded-xl">
                          Cancel
                        </Button>
                        <Button onClick={handleSaveSection} disabled={isSavingSection} className="h-9.5 text-body-xs font-black uppercase tracking-wider rounded-xl">
                          {isSavingSection ? 'Saving...' : 'Save Module'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Renders visual connected curriculum timeline path */}
              {isLoadRoadmapLoading ? (
                <div className="space-y-sm">
                  <div className="h-20 w-full bg-muted/40 rounded-2xl animate-pulse" />
                  <div className="h-20 w-full bg-muted/40 rounded-2xl animate-pulse" />
                </div>
              ) : (
                <div className="relative pl-6 space-y-8 select-none">
                  
                  {/* Timeline track vertical line */}
                  <div className="absolute left-[17px] top-6 bottom-6 w-[2px] bg-border/60 pointer-events-none" />

                  {roadmap?.sections && roadmap.sections.length > 0 ? (
                    roadmap.sections.map((section: any, sIdx: number) => {
                      const sectionSteps = section.steps || [];

                      return (
                        <div key={section._id} className="space-y-4 relative group/module">
                          
                          {/* ================= MODULE HEADER TIMELINE NODE ================= */}
                          <div className="flex items-center gap-3.5 relative z-10">
                            
                            {/* Visual index node bullet */}
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary text-body-xs font-black shadow-subtle group-hover/module:bg-primary group-hover/module:text-white transition duration-200">
                              <span>{sIdx + 1}</span>
                            </div>

                            <div className="flex-1 bg-card border border-border/80 rounded-2xl p-4.5 flex justify-between items-start gap-sm shadow-subtle hover:border-border transition">
                              <div>
                                <h4 className="text-body-xs font-black text-foreground uppercase tracking-wider">{section.title}</h4>
                                {section.description && (
                                  <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-0.5 max-w-xl">
                                    {section.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-xs items-center opacity-70 group-hover/module:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditSection(section)}
                                  className="h-8 w-8 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted text-foreground flex items-center justify-center transition cursor-pointer"
                                  title="Edit Module metadata"
                                >
                                  <FileEdit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSection(section._id)}
                                  className="h-8 w-8 rounded-xl border border-destructive/10 bg-destructive/[0.03] hover:bg-destructive/10 text-destructive flex items-center justify-center transition cursor-pointer"
                                  title="Delete Module & steps"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* ================= STEPS TIMELINE SUB-NODES ================= */}
                          <div className="pl-9 space-y-4 relative">
                            {sectionSteps.map((step: any, stepIdx: number) => {
                              const hasNotes = !!step.richNotes;
                              const hasVideo = !!step.videoUrl;
                              const hasTip = !!step.mentorTip;
                              const resourcesCount = step.resources?.length || 0;

                              return (
                                <div key={step._id} className="relative flex gap-3.5 items-start group/step">
                                  
                                  {/* Connective node circle */}
                                  <div className="absolute left-[-23px] top-[18px] h-2.5 w-2.5 rounded-full border-2 border-border/80 bg-card z-10 group-hover/step:border-primary group-hover/step:bg-primary transition" />

                                  <div className="flex-1 bg-card/40 border border-border/60 hover:border-border/100 hover:bg-card rounded-2xl p-4 flex justify-between items-center gap-md shadow-inner-subtle transition">
                                    
                                    <div className="flex items-center gap-3 min-w-0">
                                      {/* Icon indicating type */}
                                      <div className="p-2 bg-card rounded-xl border border-border shrink-0">
                                        {getStepIcon(step.type)}
                                      </div>
                                      
                                      <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-xs flex-wrap">
                                          <span className="text-body-xs font-bold text-foreground truncate pr-xs">{step.title}</span>
                                          {step.isOptional && (
                                            <span className="px-1.5 py-[1px] bg-muted/60 text-[8px] font-extrabold uppercase tracking-widest text-muted-foreground rounded border border-border/80 select-none">
                                              Optional
                                            </span>
                                          )}
                                        </div>
                                        
                                        <div className="flex items-center gap-sm text-[9px] font-bold text-muted-foreground uppercase flex-wrap">
                                          <span>{step.estimatedMinutes || 20}m</span>
                                          <span>• {step.difficulty || 'beginner'}</span>
                                          
                                          {/* Configured Indicators */}
                                          {hasNotes && (
                                            <span className="text-indigo-600 bg-indigo-500/5 px-1 py-[0.5px] border border-indigo-500/10 rounded">
                                              Notes
                                            </span>
                                          )}
                                          {hasVideo && (
                                            <span className="text-blue-600 bg-blue-500/5 px-1 py-[0.5px] border border-blue-500/10 rounded">
                                              Video
                                            </span>
                                          )}
                                          {resourcesCount > 0 && (
                                            <span className="text-teal-600 bg-teal-500/5 px-1 py-[0.5px] border border-teal-500/10 rounded">
                                              {resourcesCount} Res
                                            </span>
                                          )}
                                          {hasTip && (
                                            <span className="text-amber-600 bg-amber-500/5 px-1 py-[0.5px] border border-amber-500/10 rounded">
                                              Tip
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex gap-xs items-center shrink-0 opacity-60 group-hover/step:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => handleOpenEditStep(step)}
                                        className="h-7 w-7 rounded-lg border border-border/60 bg-muted/10 hover:bg-muted text-foreground flex items-center justify-center transition cursor-pointer"
                                        title="Configure step tabs"
                                      >
                                        <FileEdit className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteStep(step._id)}
                                        className="h-7 w-7 rounded-lg border border-destructive/10 bg-destructive/[0.02] hover:bg-destructive/10 text-destructive flex items-center justify-center transition cursor-pointer"
                                        title="Delete step"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>

                                  </div>

                                </div>
                              );
                            })}

                            {/* Add Step In-Context Button */}
                            <div className="relative flex gap-3.5 items-center">
                              <div className="absolute left-[-23px] h-2.5 w-2.5 rounded-full border border-dashed border-border bg-card z-10" />
                              <button
                                onClick={() => handleOpenAddStep(section._id)}
                                className="w-full py-2 bg-card/10 hover:bg-card/40 border border-dashed border-border/80 hover:border-primary/20 text-muted-foreground hover:text-primary rounded-xl text-[10px] font-extrabold uppercase tracking-widest flex items-center justify-center gap-xxs transition cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add Curriculum Step</span>
                              </button>
                            </div>

                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 text-muted-foreground text-body-xs font-bold border-2 border-dashed border-border/60 rounded-2xl select-none flex flex-col items-center justify-center gap-xs">
                      <span>Syllabus map is empty. Build your initial learning module above to begin!</span>
                    </div>
                  )}

                </div>
              )}

            </div>
          ) : (
            <div className="bg-card border border-border/80 p-8 rounded-3xl text-center space-y-md text-muted-foreground text-body-xs font-bold select-none h-64 flex flex-col items-center justify-center bg-card/30 backdrop-blur-xs border-dashed">
              <Compass className="h-10 w-10 text-muted-foreground/60 animate-bounce" />
              <span>Initialize the roadmap template metadata details on the left to unlock your syllabus builder timeline!</span>
            </div>
          )}

        </div>

      </div>

      {/* ================= TABBED STEP AUTHORING MODAL ================= */}
      {(addingStepToSectionId || editingStepId) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <Card className="border border-border/80 shadow-2xl rounded-3xl w-full max-w-2xl bg-card overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="p-4.5 bg-muted/20 border-b border-border/40 flex justify-between items-center select-none">
              <div className="space-y-0.5">
                <span className="text-body-xs font-black text-foreground flex items-center gap-xxs">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  <span>{editingStepId ? 'Configure Curriculum Learning Unit' : 'Build Syllabus Step'}</span>
                </span>
                {stepTitle && (
                  <p className="text-[10px] text-muted-foreground font-bold truncate max-w-md">
                    Editing: {stepTitle}
                  </p>
                )}
              </div>
              <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl" onClick={handleCloseStepModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Tabs Selection */}
            <div className="bg-muted/15 border-b border-border/40 px-4 py-2 flex items-center gap-xs overflow-x-auto select-none shrink-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveStepTab('overview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer whitespace-nowrap border ${
                  activeStepTab === 'overview'
                    ? 'bg-card text-primary border-primary/25 shadow-sm font-black'
                    : 'text-muted-foreground border-transparent hover:bg-card/40'
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStepTab('notes')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer whitespace-nowrap border ${
                  activeStepTab === 'notes'
                    ? 'bg-card text-primary border-primary/25 shadow-sm font-black'
                    : 'text-muted-foreground border-transparent hover:bg-card/40'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Study Notes</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStepTab('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer whitespace-nowrap border ${
                  activeStepTab === 'video'
                    ? 'bg-card text-primary border-primary/25 shadow-sm font-black'
                    : 'text-muted-foreground border-transparent hover:bg-card/40'
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                <span>Video Lecture</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStepTab('resources')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer whitespace-nowrap border ${
                  activeStepTab === 'resources'
                    ? 'bg-card text-primary border-primary/25 shadow-sm font-black'
                    : 'text-muted-foreground border-transparent hover:bg-card/40'
                }`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Resources ({resourcesList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStepTab('tip')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer whitespace-nowrap border ${
                  activeStepTab === 'tip'
                    ? 'bg-card text-primary border-primary/25 shadow-sm font-black'
                    : 'text-muted-foreground border-transparent hover:bg-card/40'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Mentor Tip</span>
              </button>
            </div>

            {/* Modal Body Contents */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: OVERVIEW */}
              {activeStepTab === 'overview' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-xxs">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Step Title</label>
                    <Input
                      value={stepTitle}
                      onChange={(e) => setStepTitle(e.target.value)}
                      placeholder="e.g. Master Docker Compose syntax"
                      className="rounded-xl border bg-card text-foreground font-semibold"
                    />
                  </div>
                  <div className="space-y-xxs">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Brief Objective Description</label>
                    <textarea
                      value={stepDesc}
                      onChange={(e) => setStepDesc(e.target.value)}
                      placeholder="Explain what the learner will gain or perform..."
                      className="w-full h-20 p-2.5 text-body-xs bg-card border rounded-xl outline-none resize-none leading-normal font-semibold text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-sm">
                    <div className="space-y-xxs">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Step Type</label>
                      <select
                        value={stepType}
                        onChange={(e: any) => setStepType(e.target.value)}
                        className="w-full bg-card border rounded-xl text-body-xs font-bold text-foreground px-sm py-xxs outline-none cursor-pointer"
                      >
                        <option value="article">Article</option>
                        <option value="video">Video</option>
                        <option value="project">Project</option>
                        <option value="assignment">Assignment</option>
                        <option value="quiz">Quiz</option>
                        <option value="session">Session</option>
                        <option value="external resource">External Resource</option>
                      </select>
                    </div>
                    <div className="space-y-xxs">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Est. Mins</label>
                      <Input
                        type="number"
                        value={stepMins}
                        onChange={(e) => setStepMins(Number(e.target.value))}
                        className="rounded-xl border bg-card text-foreground"
                      />
                    </div>
                    <div className="space-y-xxs">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Difficulty</label>
                      <select
                        value={stepDifficulty}
                        onChange={(e: any) => setStepDifficulty(e.target.value)}
                        className="w-full bg-card border rounded-xl text-body-xs font-bold text-foreground px-sm py-xxs outline-none cursor-pointer"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="space-y-xxs">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Sorting Order</label>
                      <Input
                        type="number"
                        value={stepOrder}
                        onChange={(e) => setStepOrder(Number(e.target.value))}
                        className="rounded-xl border bg-card text-foreground"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-xs select-none py-xxs border-t border-border/40">
                    <input
                      type="checkbox"
                      id="optional"
                      checked={stepOptional}
                      onChange={(e) => setStepOptional(e.target.checked)}
                      className="h-4 w-4 text-primary bg-card border border-border rounded focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="optional" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground cursor-pointer flex items-center gap-1">
                      <span>Mark as Optional Step</span>
                      <span className="text-[8px] text-muted-foreground/80 font-bold tracking-normal">(Does not penalize learners' progress)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: STUDY NOTES (MARKDOWN WRITER) */}
              {activeStepTab === 'notes' && (
                <div className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Rich Markdown Guide notes</h4>
                      <p className="text-[9px] text-muted-foreground font-semibold">Write code snippets, concepts, bullet logs, and headings.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                      className={`h-7 px-sm text-[9px] font-extrabold uppercase tracking-widest rounded-xl transition border border-border cursor-pointer select-none flex items-center gap-xxs ${
                        showMarkdownPreview ? 'bg-primary text-white border-primary' : 'bg-muted/30 hover:bg-muted text-foreground'
                      }`}
                    >
                      {showMarkdownPreview ? <FileText className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span>{showMarkdownPreview ? 'Edit Notes' : 'Preview Notes'}</span>
                    </button>
                  </div>

                  {showMarkdownPreview ? (
                    <div className="border border-border/80 bg-card rounded-2xl p-5 overflow-y-auto max-h-[320px] select-text">
                      {richNotes.trim() ? (
                        <MarkdownRenderer content={richNotes} />
                      ) : (
                        <div className="text-center py-10 text-muted-foreground italic font-semibold text-body-xs">
                          No notes written yet. Start typing markdown in the editor tab to review!
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-xxs select-text">
                      <textarea
                        value={richNotes}
                        onChange={(e) => setRichNotes(e.target.value)}
                        placeholder="### Docker Volumes&#10;&#10;Docker containers are stateless by default. To persist data, attach a volume:&#10;&#10;- **Anonymous Volumes**: `docker run -v /app/data ...`&#10;- **Named Volumes**: `docker run -v db-data:/app/data ...`&#10;&#10;```bash&#10;# Create named volume manually&#10;docker volume create local-backup&#10;```"
                        className="w-full h-64 p-3 text-body-xs bg-card border rounded-2xl outline-none font-mono resize-none leading-relaxed text-foreground select-text focus:ring-1 focus:ring-primary"
                        maxLength={5000}
                      />
                      <div className="text-right text-[8px] font-bold text-muted-foreground select-none pr-xs">
                        {richNotes.length}/5000 characters
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: VIDEO LECTURE */}
              {activeStepTab === 'video' && (
                <div className="space-y-4 animate-in fade-in duration-200 select-text">
                  <div className="space-y-xxs">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Video Share Link</label>
                    <Input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ, Loom share, or Vimeo"
                      className="rounded-xl border bg-card text-foreground font-semibold select-text"
                    />
                    <span className="text-[8px] text-muted-foreground/80 font-bold block pt-xxs pl-xxs">
                      Supports direct YouTube urls, Vimeo links, and Loom shares. Embeds are rendered inline in the lesson.
                    </span>
                  </div>

                  {/* Video Live Preview Canvas */}
                  {videoUrl.trim() && (
                    <div className="space-y-2 select-none">
                      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest pl-xxs">Live Embedded Preview</span>
                      
                      {isEmbeddable ? (
                        <div className="aspect-video w-full rounded-2xl border border-border bg-slate-950 overflow-hidden shadow-inner flex items-center justify-center">
                          <iframe
                            src={videoEmbed}
                            title="Video lecture preview"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <div className="p-4 bg-muted/40 border border-border/80 rounded-2xl flex items-center gap-sm">
                          <ExternalLink className="h-5 w-5 text-cyan-500" />
                          <div className="text-body-xs font-semibold text-muted-foreground select-text">
                            <span>External video link configured: </span>
                            <a
                              href={videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline font-bold truncate block max-w-sm mt-0.5"
                            >
                              {videoUrl}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!videoUrl.trim() && (
                    <div className="p-8 border border-dashed border-border/80 rounded-2xl text-center text-muted-foreground text-[11px] font-bold select-none flex flex-col items-center justify-center gap-xs bg-muted/5">
                      <Play className="h-8 w-8 text-muted-foreground/55 shrink-0" />
                      <span>Paste a YouTube, Loom, or Vimeo video URL above to preview and embed the video lecture in this step.</span>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 4: RESOURCES GRID */}
              {activeStepTab === 'resources' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="border border-border/60 bg-muted/10 p-4.5 rounded-2xl space-y-sm select-none">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-foreground">Curate New Link Resource</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm items-end">
                      <div className="space-y-xxs">
                        <label className="text-[9px] font-bold text-muted-foreground">Type</label>
                        <select
                          value={newResType}
                          onChange={(e) => setNewResType(e.target.value)}
                          className="w-full bg-card border border-border rounded-xl text-body-xs font-bold px-sm py-xxs outline-none"
                        >
                          <option value="article">Article</option>
                          <option value="video">Video</option>
                          <option value="quiz">Quiz</option>
                          <option value="repository">Repo</option>
                          <option value="documentation">Docs</option>
                          <option value="external tutorial">Tutorial</option>
                        </select>
                      </div>
                      <div className="space-y-xxs">
                        <label className="text-[9px] font-bold text-muted-foreground">Title</label>
                        <Input
                          value={newResTitle}
                          onChange={(e) => setNewResTitle(e.target.value)}
                          placeholder="e.g. AWS VPC VPCDocs"
                          className="rounded-xl border bg-card text-foreground"
                        />
                      </div>
                      <div className="space-y-xxs">
                        <label className="text-[9px] font-bold text-muted-foreground">URL</label>
                        <Input
                          value={newResUrl}
                          onChange={(e) => setNewResUrl(e.target.value)}
                          placeholder="https://docs.aws.com/vpc"
                          className="rounded-xl border bg-card text-foreground"
                        />
                      </div>
                    </div>
                    
                    <Button type="button" onClick={handleAddResource} variant="secondary" className="h-8.5 text-[9px] font-bold uppercase select-none rounded-xl">
                      Add to Step Links
                    </Button>
                  </div>

                  <div className="space-y-2 select-text">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-xxs select-none">
                      Curated Resource Collections ({resourcesList.length})
                    </span>

                    {resourcesList.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-xs">
                        {resourcesList.map((res, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-muted/15 border border-border/40 rounded-xl text-body-xs font-semibold gap-xs">
                            <div className="flex items-center gap-xs truncate min-w-0">
                              <Bookmark className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                              <div className="truncate">
                                <p className="font-extrabold text-foreground truncate">{res.title}</p>
                                <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">{res.type}</span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              onClick={() => handleDeleteResource(idx)}
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground italic font-semibold text-body-xs border border-dashed border-border/80 rounded-2xl select-none bg-muted/5">
                        No resource reference badge curated yet. Add helpful repositories, articles, or documentation!
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 5: MENTOR TIP */}
              {activeStepTab === 'tip' && (
                <div className="space-y-4 animate-in fade-in duration-200 select-text">
                  <div className="space-y-xxs select-text">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Mentor Advice Callout</label>
                    <textarea
                      value={mentorTip}
                      onChange={(e) => setMentorTip(e.target.value)}
                      placeholder="e.g. Most learners get stuck on routing tables — focus on VPC networking fundamentals before jumping into K8s subnets."
                      className="w-full h-24 p-3 text-body-xs bg-card border rounded-2xl outline-none resize-none leading-normal font-semibold text-foreground select-text focus:ring-1 focus:ring-primary"
                      maxLength={1000}
                    />
                    <div className="text-right text-[8px] font-bold text-muted-foreground select-none pr-xs mt-xxs">
                      {mentorTip.length}/1000 characters
                    </div>
                  </div>

                  {/* Mentor Tip Card Real-time Preview */}
                  <div className="space-y-2 select-none">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest pl-xxs">Real-time Callout Preview</span>
                    <div className="p-4 border border-primary/10 bg-primary/5 rounded-2xl flex items-start gap-3 transition">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-extrabold uppercase text-primary tracking-widest leading-none">Mentor Tip & Advice</p>
                        <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
                          {mentorTip.trim() || '“Curate quick, high-impact guidance here. Focus learners on critical hurdles, warnings, or conceptual shifts to build learning confidence!”'}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Footer buttons */}
            <div className="p-4.5 bg-muted/15 border-t border-border/40 flex justify-end gap-sm select-none shrink-0">
              <Button variant="outline" onClick={handleCloseStepModal} className="h-9.5 text-body-xs font-bold rounded-xl shadow-sm cursor-pointer">
                Cancel
              </Button>
              <Button
                onClick={handleSaveStep}
                disabled={isSavingStep || !stepTitle.trim()}
                className="h-9.5 text-body-xs font-black uppercase tracking-wider rounded-xl shadow-md cursor-pointer flex items-center gap-xxs"
              >
                {isSavingStep ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving step...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Step to Module</span>
                  </>
                )}
              </Button>
            </div>

          </Card>
        </div>
      )}

    </PageContainer>
  );
};
