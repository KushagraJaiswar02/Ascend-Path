import React, { useState, useEffect } from 'react';
import { useCreatePortfolioProject, useUpdatePortfolioProject } from '../hooks/useCredibility';
import { useToast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, Code2, Sparkles, BookOpen, GitBranch, ExternalLink } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import type { PortfolioProject } from '../api/credibility.api';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: PortfolioProject;
  onSuccess?: () => void;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSuccess,
}) => {
  const { toast } = useToast();
  const createMutation = useCreatePortfolioProject();
  const updateMutation = useUpdatePortfolioProject();

  const isEdit = !!project;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [domains, setDomains] = useState('');
  const [roadmapId, setRoadmapId] = useState('');
  const [projectReflections, setProjectReflections] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>([]);
  const [userRoadmaps, setUserRoadmaps] = useState<{ _id: string; title: string }[]>([]);

  // Load user roadmaps for linking
  useEffect(() => {
    const loadRoadmaps = async () => {
      try {
        const response = await apiClient.get('/me/roadmaps');
        // Extract array from response safely
        const roadmapData = response.data?.data?.activeRoadmaps || response.data?.data || [];
        // Extract the actual roadmap object if nested (e.g. from progress trackers)
        const mapped = roadmapData.map((item: any) => item.roadmapId || item);
        setUserRoadmaps(mapped.filter((item: any) => item && item._id && item.title));
      } catch (err) {
        console.error('Failed to load user roadmaps:', err);
      }
    };

    if (isOpen) {
      loadRoadmaps();
    }
  }, [isOpen]);

  // Set form fields if editing
  useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description);
      setGithubLink(project.githubLink || '');
      setDemoLink(project.demoLink || '');
      setTechnologies(project.technologies.join(', '));
      setDomains(project.domains.join(', '));
      setRoadmapId(project.roadmapId || '');
      setProjectReflections(project.projectReflections);
      setLearningOutcomes(project.learningOutcomes || []);
    } else {
      setTitle('');
      setDescription('');
      setGithubLink('');
      setDemoLink('');
      setTechnologies('');
      setDomains('');
      setRoadmapId('');
      setProjectReflections('');
      setLearningOutcomes([]);
    }
  }, [project, isOpen]);

  const handleAddOutcome = () => {
    setLearningOutcomes([...learningOutcomes, '']);
  };

  const handleRemoveOutcome = (index: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, i) => i !== index));
  };

  const handleOutcomeChange = (index: number, value: string) => {
    const updated = [...learningOutcomes];
    updated[index] = value;
    setLearningOutcomes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !projectReflections.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please complete all required fields.',
        type: 'error',
      });
      return;
    }

    const techArray = technologies
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const domainArray = domains
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    const outcomeArray = learningOutcomes.map((o) => o.trim()).filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      githubLink: githubLink.trim() || undefined,
      demoLink: demoLink.trim() || undefined,
      technologies: techArray,
      domains: domainArray,
      roadmapId: roadmapId || undefined,
      projectReflections: projectReflections.trim(),
      learningOutcomes: outcomeArray,
    };

    try {
      if (isEdit && project) {
        await updateMutation.mutateAsync({ id: project._id, data: payload });
        toast({
          title: 'Project Updated',
          description: 'Your portfolio project details were successfully updated.',
        });
      } else {
        await createMutation.mutateAsync(payload);
        toast({
          title: 'Project Added',
          description: 'Your new portfolio project has been posted to your credibility showcase.',
        });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Submission Failed',
        description: err?.response?.data?.message || 'Failed to submit portfolio project.',
        type: 'error',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-lg select-text p-6">
        <DialogHeader className="pb-3 border-b border-border/40">
          <DialogTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>{isEdit ? 'Refine Portfolio Project' : 'Showcase New Project'}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-semibold">
            Post outcomes, code links, and reflections to provide robust proof of your domain capabilities.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                Project Title *
              </label>
              <Input
                required
                placeholder="e.g. Distributed Consensus Engine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9.5 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                Link to Roadmap Curriculum
              </label>
              <select
                value={roadmapId}
                onChange={(e) => setRoadmapId(e.target.value)}
                className="w-full text-xs font-bold border border-border/60 bg-muted/20 hover:bg-muted/40 rounded-xl px-3 py-2 h-9.5 outline-none text-foreground"
              >
                <option value="">No linked roadmap</option>
                {userRoadmaps.map((rm) => (
                  <option key={rm._id} value={rm._id}>
                    {rm.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
              Project Description *
            </label>
            <Textarea
              required
              placeholder="What is this project, and what problem does it solve? Be precise and detailed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[90px] text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="relative">
                <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="GitHub Code Link"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  className="pl-9 h-9.5 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Live Demo Link"
                  value={demoLink}
                  onChange={(e) => setDemoLink(e.target.value)}
                  className="pl-9 h-9.5 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider flex items-center gap-1">
                <Code2 className="h-3 w-3" />
                <span>Technologies Used (Comma separated)</span>
              </label>
              <Input
                placeholder="React, TypeScript, Node.js, Docker"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                className="h-9.5 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                Relevant Domains (Comma separated)
              </label>
              <Input
                placeholder="Systems, Frontend, Security, Cloud"
                value={domains}
                onChange={(e) => setDomains(e.target.value)}
                className="h-9.5 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
              Project Engineering Reflections *
            </label>
            <Textarea
              required
              placeholder="What structural or scaling bottlenecks did you hit, and how did you resolve them? What did you learn?"
              value={projectReflections}
              onChange={(e) => setProjectReflections(e.target.value)}
              className="min-h-[90px] text-xs"
            />
          </div>

          {/* Learning Outcomes */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span>Quantifiable Outcomes & Learnings</span>
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOutcome}
                className="h-7 text-[10px] font-bold gap-1 rounded-lg border-border/70 hover:bg-muted"
              >
                <Plus className="h-3 w-3" />
                <span>Add Outcome</span>
              </Button>
            </div>

            <div className="space-y-2 max-h-[140px] overflow-y-auto">
              {learningOutcomes.map((outcome, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="e.g. Optimized database queries reducing latency by 40%"
                    value={outcome}
                    onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                    className="h-9.5 text-xs rounded-xl flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOutcome(idx)}
                    className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 rounded-xl"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {learningOutcomes.length === 0 && (
                <p className="text-[11px] text-muted-foreground font-semibold italic text-center py-2">
                  No learning outcomes listed. Add bullet points highlighting what you achieved.
                </p>
              )}
            </div>
          </div>

          {/* Form actions */}
          <div className="flex justify-end gap-2 border-t border-border/40 pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 text-xs font-bold px-4 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="h-10 text-xs font-bold px-5 rounded-xl bg-primary text-white hover:bg-primary/95 cursor-pointer"
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Submitting...'
                : isEdit
                ? 'Save Changes'
                : 'Publish Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
