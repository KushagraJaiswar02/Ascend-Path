import React, { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubmitMentorFollowup } from '../hooks/useSessionReflection';
import type { SessionReflection } from '../types';

interface MentorFollowupPanelProps {
  sessionId: string;
  reflection?: SessionReflection | null;
}

const idFromValue = (value: any) => (typeof value === 'string' ? value : value?._id);

export const MentorFollowupPanel: React.FC<MentorFollowupPanelProps> = ({ sessionId, reflection }) => {
  const mutation = useSubmitMentorFollowup(sessionId);
  const [mentorNotes, setMentorNotes] = useState(reflection?.mentorFollowup?.mentorNotes || '');
  const [nextSessionSuggestion, setNextSessionSuggestion] = useState(reflection?.mentorFollowup?.nextSessionSuggestion || '');
  const [stepTitle, setStepTitle] = useState('');
  const [stepReason, setStepReason] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [recommendedRoadmapSteps, setRecommendedRoadmapSteps] = useState(
    reflection?.mentorFollowup?.recommendedRoadmapSteps || []
  );
  const [recommendedResources, setRecommendedResources] = useState(reflection?.mentorFollowup?.recommendedResources || []);
  const [recommendedProjects, setRecommendedProjects] = useState(reflection?.mentorFollowup?.recommendedProjects || []);

  const addStep = () => {
    if (!stepTitle.trim()) return;
    setRecommendedRoadmapSteps((current) => [...current, { title: stepTitle.trim(), reason: stepReason.trim() || undefined }]);
    setStepTitle('');
    setStepReason('');
  };

  const addResource = () => {
    if (!resourceTitle.trim() || !resourceUrl.trim()) return;
    setRecommendedResources((current) => [...current, { title: resourceTitle.trim(), url: resourceUrl.trim(), type: 'other' }]);
    setResourceTitle('');
    setResourceUrl('');
  };

  const addProject = () => {
    if (!projectTitle.trim()) return;
    setRecommendedProjects((current) => [...current, { title: projectTitle.trim(), description: projectDescription.trim() || undefined }]);
    setProjectTitle('');
    setProjectDescription('');
  };

  const hasContent =
    mentorNotes.trim() ||
    nextSessionSuggestion.trim() ||
    recommendedRoadmapSteps.length ||
    recommendedResources.length ||
    recommendedProjects.length;

  const handleSubmit = () => {
    if (!hasContent) return;
    mutation.mutate({
      mentorNotes: mentorNotes.trim() || undefined,
      nextSessionSuggestion: nextSessionSuggestion.trim() || undefined,
      recommendedRoadmapSteps: recommendedRoadmapSteps.map((step) => ({
        title: step.title,
        reason: step.reason,
        roadmapId: idFromValue(step.roadmapId),
        stepId: idFromValue(step.stepId),
      })),
      recommendedResources,
      recommendedProjects,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-sm">
        <CardTitle>Mentor Follow-Up</CardTitle>
      </CardHeader>
      <CardContent className="space-y-md">
        <div className="space-y-xs">
          <label className="text-body-xs font-bold text-foreground">Mentor notes</label>
          <Textarea value={mentorNotes} onChange={(event) => setMentorNotes(event.target.value)} rows={3} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-xs">
          <Input placeholder="Roadmap step or milestone" value={stepTitle} onChange={(event) => setStepTitle(event.target.value)} />
          <Input placeholder="Why this next" value={stepReason} onChange={(event) => setStepReason(event.target.value)} />
          <Button type="button" variant="outline" size="sm" onClick={addStep}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-xs">
          <Input placeholder="Resource title" value={resourceTitle} onChange={(event) => setResourceTitle(event.target.value)} />
          <Input placeholder="https://..." value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} />
          <Button type="button" variant="outline" size="sm" onClick={addResource}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-xs">
          <Input placeholder="Practice project" value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} />
          <Input placeholder="Scope or outcome" value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} />
          <Button type="button" variant="outline" size="sm" onClick={addProject}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-xs">
          {[...recommendedRoadmapSteps.map((item, index) => ({ label: item.title, type: 'step', index })),
            ...recommendedResources.map((item, index) => ({ label: item.title, type: 'resource', index })),
            ...recommendedProjects.map((item, index) => ({ label: item.title, type: 'project', index }))].map((item) => (
            <button
              key={`${item.type}-${item.index}-${item.label}`}
              type="button"
              className="inline-flex items-center gap-xs rounded-md border border-border bg-muted/30 px-2 py-1 text-[11px] font-semibold"
              onClick={() => {
                if (item.type === 'step') setRecommendedRoadmapSteps((current) => current.filter((_, index) => index !== item.index));
                if (item.type === 'resource') setRecommendedResources((current) => current.filter((_, index) => index !== item.index));
                if (item.type === 'project') setRecommendedProjects((current) => current.filter((_, index) => index !== item.index));
              }}
            >
              {item.label}
              <X className="h-3 w-3" />
            </button>
          ))}
        </div>

        <div className="space-y-xs">
          <label className="text-body-xs font-bold text-foreground">Next mentorship focus</label>
          <Input value={nextSessionSuggestion} onChange={(event) => setNextSessionSuggestion(event.target.value)} />
        </div>

        {mutation.isError && <p className="text-[11px] font-semibold text-destructive">Could not save follow-up. Check resource URLs and retry.</p>}

        <Button variant="primary" size="sm" disabled={!hasContent || mutation.isPending} onClick={handleSubmit}>
          {mutation.isPending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          Save follow-up
        </Button>
      </CardContent>
    </Card>
  );
};
