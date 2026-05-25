import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRequestEscalation } from '../hooks';

interface EscalationRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId?: string;
}

export const EscalationRequestModal = ({ open, onOpenChange, conversationId }: EscalationRequestModalProps) => {
  const [topic, setTopic] = useState('');
  const [objective, setObjective] = useState('');
  const [roadmapArea, setRoadmapArea] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'normal' | 'high'>('normal');
  const [expectedHelpType, setExpectedHelpType] = useState('roadmap_clarification');
  const [preferredSlots, setPreferredSlots] = useState('');
  const requestEscalation = useRequestEscalation(conversationId);

  const submit = async () => {
    await requestEscalation.mutateAsync({
      topic,
      objective,
      roadmapArea,
      urgency,
      expectedHelpType,
      preferredSlots: preferredSlots.split(',').map((slot) => slot.trim()).filter(Boolean),
    });
    setTopic('');
    setObjective('');
    setRoadmapArea('');
    setPreferredSlots('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Request a 1:1 session</DialogTitle>
          <DialogDescription>
            Use this when async guidance needs deeper context. The mentor will inherit this thread before approving a live session.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="Topic, e.g. Portfolio review" />
          <Textarea value={objective} onChange={(event) => setObjective(event.target.value)} placeholder="What should this session help you decide or unblock?" />
          <Input value={roadmapArea} onChange={(event) => setRoadmapArea(event.target.value)} placeholder="Roadmap area or milestone, optional" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={expectedHelpType} onChange={(event) => setExpectedHelpType(event.target.value)}>
              <option value="code_review">Code review</option>
              <option value="mock_interview">Mock interview</option>
              <option value="roadmap_clarification">Roadmap clarification</option>
              <option value="portfolio_review">Portfolio review</option>
              <option value="career_confusion">Career confusion</option>
              <option value="debugging_help">Debugging help</option>
              <option value="other">Other</option>
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={urgency} onChange={(event) => setUrgency(event.target.value as any)}>
              <option value="low">Low urgency</option>
              <option value="normal">Normal</option>
              <option value="high">High urgency</option>
            </select>
          </div>
          <Input value={preferredSlots} onChange={(event) => setPreferredSlots(event.target.value)} placeholder="Preferred slots, comma separated" />
          <Button className="w-full" onClick={submit} disabled={topic.length < 2 || objective.length < 10 || requestEscalation.isPending}>
            Send session request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
