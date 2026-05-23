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
  LayoutGrid
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useRoadmap } from '../features/roadmaps/hooks/useRoadmapProgress';
import { apiClient } from '../services/apiClient';

export const RoadmapBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Existing roadmap slug or ID if editing
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEditingMode = !!id;

  // Roadmap Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [estimatedWeeks, setEstimatedWeeks] = useState(8);
  const [domainsInput, setDomainsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [prereqInput, setPrereqInput] = useState('');
  const [outcomesInput, setOutcomesInput] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  // States
  const [roadmapId, setRoadmapId] = useState<string | null>(null);
  const [isSavingRoadmap, setIsSavingRoadmap] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Curriculum Data (Fetched if editing)
  const { data: roadmap, refetch: refetchRoadmap, isLoading: isLoadRoadmapLoading } = useRoadmap(id || '', isEditingMode);

  // UI state for adding sections/steps
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDesc, setSectionDesc] = useState('');
  const [sectionOrder, setSectionOrder] = useState(0);

  // UI state for adding steps
  const [addingStepToSectionId, setAddingStepToSectionId] = useState<string | null>(null);
  const [stepTitle, setStepTitle] = useState('');
  const [stepDesc, setStepDesc] = useState('');
  const [stepType, setStepType] = useState<'article' | 'video' | 'project' | 'assignment' | 'quiz' | 'session' | 'external resource'>('article');
  const [stepMins, setStepMins] = useState(20);
  const [stepDifficulty, setStepDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [stepOptional, setStepOptional] = useState(false);
  const [stepOrder, setStepOrder] = useState(0);
  const [resourcesList, setResourcesList] = useState<{ type: string; title: string; url: string }[]>([]);
  const [newResType, setNewResType] = useState('article');
  const [newResTitle, setNewResTitle] = useState('');
  const [newResUrl, setNewResUrl] = useState('');

  // 1. Populate form if editing
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

  // Auth Guard: Only Guides or Pathfinders can build roadmaps
  if (user?.role !== 'guide' && user?.role !== 'admin' && user?.role !== 'moderator') {
    return (
      <PageContainer size="default" className="py-10 text-center select-none">
        <Card className="max-w-md mx-auto border-destructive/20 bg-destructive/5 p-8 flex flex-col items-center gap-md">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-body-md font-black text-foreground mb-xxs">Access Prohibited</h3>
            <p className="text-muted-foreground text-body-xs font-semibold">
              Only verified Mentors, Guides, and Pathfinders possess catalog clearance to curate learning roadmaps.
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard')} className="font-bold">
            Back to Dashboard
          </Button>
        </Card>
      </PageContainer>
    );
  }

  // 2. Save Roadmap Details
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
        setRoadmapId(data.data.roadmap._id);
        setStatusMessage({ text: 'Roadmap created! Now build your curriculum syllabus below.', isError: false });
      }
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.message || 'Failed to save roadmap details.', isError: true });
    } finally {
      setIsSavingRoadmap(false);
    }
  };

  // 3. Add Section
  const handleAddSection = async () => {
    if (!sectionTitle.trim() || !roadmapId) return;

    try {
      await apiClient.post(`/roadmaps/${roadmapId}/sections`, {
        title: sectionTitle,
        description: sectionDesc,
        order: Number(sectionOrder),
      });
      setSectionTitle('');
      setSectionDesc('');
      setSectionOrder(prev => prev + 1);
      setIsAddingSection(false);
      if (isEditingMode) refetchRoadmap();
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Delete Section
  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section and all its steps?')) return;
    try {
      await apiClient.delete(`/sections/${sectionId}`);
      if (isEditingMode) refetchRoadmap();
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Add Resource Helper
  const handleAddResource = () => {
    if (!newResTitle.trim() || !newResUrl.trim()) return;
    setResourcesList([...resourcesList, { type: newResType, title: newResTitle, url: newResUrl }]);
    setNewResTitle('');
    setNewResUrl('');
  };

  // 6. Delete Resource Helper
  const handleDeleteResource = (idx: number) => {
    setResourcesList(resourcesList.filter((_, i) => i !== idx));
  };

  // 7. Add Step to Section
  const handleAddStep = async () => {
    if (!stepTitle.trim() || !addingStepToSectionId) return;

    try {
      await apiClient.post(`/sections/${addingStepToSectionId}/steps`, {
        title: stepTitle,
        description: stepDesc,
        type: stepType,
        estimatedMinutes: Number(stepMins),
        difficulty: stepDifficulty,
        isOptional: stepOptional,
        order: Number(stepOrder),
        resources: resourcesList,
      });
      
      // Reset step form
      setStepTitle('');
      setStepDesc('');
      setStepType('article');
      setStepMins(20);
      setStepDifficulty('beginner');
      setStepOptional(false);
      setStepOrder(prev => prev + 1);
      setResourcesList([]);
      setAddingStepToSectionId(null);
      
      if (isEditingMode) refetchRoadmap();
    } catch (err) {
      console.error(err);
    }
  };

  // 8. Delete Step
  const handleDeleteStep = async (stepId: string) => {
    if (!window.confirm('Delete this curriculum step?')) return;
    try {
      await apiClient.delete(`/steps/${stepId}`);
      if (isEditingMode) refetchRoadmap();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageContainer size="default" className="py-10 space-y-lg select-text">
      {/* Header and Back Link */}
      <div className="flex justify-between items-center select-none pb-sm border-b border-border/60">
        <div className="flex items-center gap-sm">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="h-8.5 px-sm text-body-xs font-black uppercase tracking-wider gap-xxs border border-border/80 bg-card shadow-sm cursor-pointer hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </Button>
          <h1 className="text-body-md sm:text-heading-md font-black tracking-tight text-foreground flex items-center gap-xxs">
            <LayoutGrid className="h-5 w-5 text-primary shrink-0" />
            <span>{isEditingMode ? 'Curriculum Syllabus Designer' : 'Create New Career Roadmap'}</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
        {/* Left Side: General Template Metadata Form */}
        <div className="lg:col-span-1 space-y-md select-none">
          <Card className="border border-border shadow-subtle rounded-2xl">
            <div className="p-md bg-muted/15 border-b border-border/40 select-none">
              <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-xxs">
                <Plus className="h-4 w-4" />
                <span>Roadmap Details</span>
              </h3>
            </div>
            <CardContent className="p-5 space-y-sm">
              <div className="space-y-xxs">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend Masterclass" className="rounded-xl border border-border bg-card text-foreground" />
              </div>

              <div className="space-y-xxs">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the scope of the study path..."
                  className="w-full h-24 p-3 text-body-xs bg-card border border-border rounded-xl outline-none resize-none focus:ring-1 focus:ring-primary leading-normal"
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
                  <Input type="number" min={1} value={estimatedWeeks} onChange={(e) => setEstimatedWeeks(Number(e.target.value))} className="rounded-xl border bg-card text-foreground" />
                </div>
              </div>

              <div className="space-y-xxs">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Expert Domains (comma-separated)</label>
                <Input value={domainsInput} onChange={(e) => setDomainsInput(e.target.value)} placeholder="Frontend Development, Node.js" className="rounded-xl border bg-card text-foreground" />
              </div>

              <div className="space-y-xxs">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Tags (comma-separated)</label>
                <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="React, TypeScript, CSS" className="rounded-xl border bg-card" />
              </div>

              <div className="space-y-xxs">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Prerequisites (one per line)</label>
                <textarea
                  value={prereqInput}
                  onChange={(e) => setPrereqInput(e.target.value)}
                  placeholder="Basic JS scripting..."
                  className="w-full h-20 p-3 text-body-xs bg-card border border-border rounded-xl outline-none resize-none focus:ring-1 focus:ring-primary leading-normal"
                />
              </div>

              <div className="space-y-xxs">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Learning Outcomes (one per line)</label>
                <textarea
                  value={outcomesInput}
                  onChange={(e) => setOutcomesInput(e.target.value)}
                  placeholder="Deploy SPA to Vercel..."
                  className="w-full h-20 p-3 text-body-xs bg-card border border-border rounded-xl outline-none resize-none focus:ring-1 focus:ring-primary leading-normal"
                />
              </div>

              <div className="flex items-center gap-xs select-none py-xs">
                <input
                  type="checkbox"
                  id="published"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 text-primary bg-card border border-border rounded focus:ring-primary"
                />
                <label htmlFor="published" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground cursor-pointer">
                  Publish Template publicly
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
                className="w-full h-10 bg-primary hover:bg-primary/95 text-white font-black rounded-xl uppercase tracking-wider text-body-xs flex items-center justify-center gap-xxs"
              >
                {isSavingRoadmap ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving details...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Roadmap Specs</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Visual Section and Step Curriculum Syllabus Builder */}
        <div className="lg:col-span-2 space-y-md">
          {roadmapId ? (
            <div className="space-y-md">
              <div className="flex justify-between items-center select-none pb-sm border-b border-border/40">
                <h3 className="text-body-xs font-black text-foreground">Syllabus Curriculum Modules</h3>
                <Button
                  onClick={() => setIsAddingSection(true)}
                  className="h-8.5 text-[9px] font-black uppercase tracking-wider gap-xxs px-xs bg-primary hover:bg-primary/95 text-white cursor-pointer select-none rounded-xl"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Module Section</span>
                </Button>
              </div>

              {/* Add Section Form Dialog panel overlay */}
              {isAddingSection && (
                <Card className="border border-border/80 shadow-md rounded-2xl select-none">
                  <div className="p-4 bg-muted/20 border-b border-border/40 flex justify-between items-center">
                    <span className="text-body-xs font-black text-foreground">Add New Curriculum Section</span>
                    <Button variant="ghost" className="h-7 text-body-xs font-bold" onClick={() => setIsAddingSection(false)}>Cancel</Button>
                  </div>
                  <CardContent className="p-5 space-y-sm">
                    <div className="space-y-xxs">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Section Title</label>
                      <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="e.g. Module 1: POSIX Basics" className="rounded-xl border bg-card text-foreground" />
                    </div>
                    <div className="space-y-xxs">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Section Description</label>
                      <Input value={sectionDesc} onChange={(e) => setSectionDesc(e.target.value)} placeholder="Brief summary of section learning goals..." className="rounded-xl border bg-card text-foreground" />
                    </div>
                    <div className="space-y-xxs w-32">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Sorting Order</label>
                      <Input type="number" value={sectionOrder} onChange={(e) => setSectionOrder(Number(e.target.value))} className="rounded-xl border bg-card" />
                    </div>
                    <Button onClick={handleAddSection} className="h-9.5 text-body-xs font-black uppercase tracking-wider rounded-xl">
                      Save Section
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Add Step Dialog panel overlay */}
              {addingStepToSectionId && (
                <Card className="border border-border/80 shadow-md rounded-2xl select-none">
                  <div className="p-4 bg-muted/20 border-b border-border/40 flex justify-between items-center">
                    <span className="text-body-xs font-black text-foreground">Add Step to Section</span>
                    <Button variant="ghost" className="h-7 text-body-xs font-bold" onClick={() => setAddingStepToSectionId(null)}>Cancel</Button>
                  </div>
                  <CardContent className="p-5 space-y-sm">
                    <div className="space-y-xxs">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Step Title</label>
                      <Input value={stepTitle} onChange={(e) => setStepTitle(e.target.value)} placeholder="e.g. Masterclass Shell redirection" className="rounded-xl border bg-card text-foreground" />
                    </div>
                    <div className="space-y-xxs">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Step Description</label>
                      <textarea value={stepDesc} onChange={(e) => setStepDesc(e.target.value)} placeholder="What will they learn in this task..." className="w-full h-16 p-3 text-body-xs bg-card border rounded-xl outline-none resize-none leading-normal" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-sm">
                      <div className="space-y-xxs">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Type</label>
                        <select value={stepType} onChange={(e: any) => setStepType(e.target.value)} className="w-full bg-card border rounded-xl text-body-xs font-bold text-foreground px-sm py-xxs outline-none cursor-pointer">
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
                        <Input type="number" value={stepMins} onChange={(e) => setStepMins(Number(e.target.value))} className="rounded-xl border bg-card text-foreground" />
                      </div>
                      <div className="space-y-xxs">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Difficulty</label>
                        <select value={stepDifficulty} onChange={(e: any) => setStepDifficulty(e.target.value)} className="w-full bg-card border rounded-xl text-body-xs font-bold text-foreground px-sm py-xxs outline-none cursor-pointer">
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div className="space-y-xxs">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Order</label>
                        <Input type="number" value={stepOrder} onChange={(e) => setStepOrder(Number(e.target.value))} className="rounded-xl border bg-card text-foreground" />
                      </div>
                    </div>

                    <div className="flex items-center gap-xs select-none py-xxs">
                      <input type="checkbox" id="optional" checked={stepOptional} onChange={(e) => setStepOptional(e.target.checked)} className="h-4 w-4 text-primary bg-card border border-border rounded focus:ring-primary" />
                      <label htmlFor="optional" className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground cursor-pointer">
                        Mark as Optional Step (Does not penalize Progress % calculation)
                      </label>
                    </div>

                    {/* Resources Form nested in adding step */}
                    <div className="border-t border-border/40 pt-sm space-y-xs">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">Resources / Reference Links</label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-xs items-end">
                        <div className="space-y-xxs">
                          <label className="text-[9px] font-bold text-muted-foreground">Res Type</label>
                          <select value={newResType} onChange={(e) => setNewResType(e.target.value)} className="w-full bg-card border rounded-xl text-body-xs font-bold px-sm py-xxs outline-none">
                            <option value="article">Article</option>
                            <option value="video">Video</option>
                            <option value="quiz">Quiz</option>
                            <option value="repository">Repo</option>
                            <option value="documentation">Docs</option>
                          </select>
                        </div>
                        <div className="space-y-xxs">
                          <label className="text-[9px] font-bold text-muted-foreground">Title</label>
                          <Input value={newResTitle} onChange={(e) => setNewResTitle(e.target.value)} placeholder="e.g. AWS Network VPC VPCDocs" className="rounded-xl border bg-card text-foreground" />
                        </div>
                        <div className="space-y-xxs">
                          <label className="text-[9px] font-bold text-muted-foreground">URL</label>
                          <Input value={newResUrl} onChange={(e) => setNewResUrl(e.target.value)} placeholder="https://docs.aws.com/vpc" className="rounded-xl border bg-card text-foreground" />
                        </div>
                      </div>
                      
                      <Button type="button" onClick={handleAddResource} variant="secondary" className="h-8 text-[9px] font-bold uppercase select-none rounded-xl">
                        Add Link Resource
                      </Button>

                      {resourcesList.length > 0 && (
                        <div className="space-y-xs pt-xs">
                          {resourcesList.map((res, i) => (
                            <div key={i} className="flex justify-between items-center p-2.5 bg-muted/30 border border-border/40 rounded-xl text-body-xs font-bold">
                              <span className="truncate pr-xs">{res.title} ({res.type})</span>
                              <Button type="button" onClick={() => handleDeleteResource(i)} variant="ghost" className="h-6 w-6 p-0 text-destructive rounded-full hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button onClick={handleAddStep} className="h-9.5 text-body-xs font-black uppercase tracking-wider rounded-xl w-full">
                      Save step to Curriculum
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Renders list of sections and steps saved in database */}
              {isLoadRoadmapLoading ? (
                <div className="h-20 w-full bg-muted rounded-2xl animate-pulse" />
              ) : (
                <div className="space-y-sm">
                  {roadmap?.sections && roadmap.sections.length > 0 ? (
                    roadmap.sections.map((section: any) => (
                      <div key={section._id} className="bg-card border border-border/80 rounded-2xl overflow-hidden p-5 space-y-sm">
                        <div className="flex justify-between items-start gap-sm select-none border-b border-border/20 pb-sm">
                          <div>
                            <h4 className="text-body-xs font-black text-foreground">{section.title}</h4>
                            {section.description && <p className="text-[10px] text-muted-foreground leading-normal font-semibold mt-xxs">{section.description}</p>}
                          </div>
                          <div className="flex gap-xs shrink-0 select-none">
                            <Button
                              onClick={() => setAddingStepToSectionId(section._id)}
                              className="h-8 text-[9px] font-black uppercase tracking-wider bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 select-none rounded-xl"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add Step</span>
                            </Button>
                            <Button
                              onClick={() => handleDeleteSection(section._id)}
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 rounded-xl border border-border"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Step list for this section */}
                        <div className="space-y-xs pt-xs select-text">
                          {section.steps && section.steps.length > 0 ? (
                            section.steps.map((step: any) => (
                              <div key={step._id} className="flex items-center justify-between p-3.5 bg-muted/15 border border-border/40 hover:border-border rounded-xl transition gap-sm">
                                <div className="flex items-center gap-xs">
                                  <div className="p-2 bg-card rounded-lg border border-border">
                                    {step.type === 'video' ? <Play className="h-3.5 w-3.5 text-blue-500" /> : <BookOpen className="h-3.5 w-3.5 text-indigo-500" />}
                                  </div>
                                  <div>
                                    <span className="text-body-xs font-bold text-foreground">{step.title}</span>
                                    {step.isOptional && <span className="ml-xs text-[8px] font-extrabold uppercase text-muted-foreground tracking-widest bg-muted border px-xxs py-[2px] rounded">Optional</span>}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleDeleteStep(step._id)}
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 rounded-lg shrink-0 border border-border"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-5 text-muted-foreground text-[11px] font-bold border border-dashed border-border/60 rounded-xl select-none">
                              No steps in this module. Add steps to outline the syllabus!
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-muted-foreground text-body-xs font-bold border-2 border-dashed border-border/60 rounded-2xl select-none flex flex-col items-center gap-xs">
                      <span>No module sections added yet. Click "Add Module Section" to start planning!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border/80 p-8 rounded-3xl text-center space-y-md text-muted-foreground text-body-xs font-bold select-none h-64 flex flex-col items-center justify-center">
              <span>Save the main roadmap template specifications first to unlock the section and step syllabus builder!</span>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
