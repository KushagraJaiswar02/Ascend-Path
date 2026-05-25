import { useMemo, useState } from 'react';
import { CalendarPlus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/useAuthStore';
import type { MentorshipConversation, MentorshipMessage, SessionEscalationRequest } from '../types';
import { useSendMentorshipMessage } from '../hooks';
import { MessageBubble } from './MessageBubble';
import { MentorPresenceIndicator } from './MentorPresenceIndicator';
import { PinnedAdvicePanel } from './PinnedAdvicePanel';
import { SessionContextCard } from './SessionContextCard';
import { EscalationRequestModal } from './EscalationRequestModal';

interface ConversationThreadProps {
  conversation: MentorshipConversation;
  messages: MentorshipMessage[];
  escalations: SessionEscalationRequest[];
}

export const ConversationThread = ({ conversation, messages, escalations }: ConversationThreadProps) => {
  const [draft, setDraft] = useState('');
  const [escalationOpen, setEscalationOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const sendMessage = useSendMentorshipMessage(conversation._id);
  const counterpart = conversation.mentorId._id === user?._id ? conversation.menteeId : conversation.mentorId;
  const pinnedAdvice = useMemo(() => conversation.participantStates?.find((state: any) => state.pinnedAdvice)?.pinnedAdvice, [conversation]);
  const pendingEscalation = escalations.find((item) => item.status === 'pending');

  const submit = async () => {
    if (draft.trim().length < 1) return;
    await sendMessage.mutateAsync(draft.trim());
    setDraft('');
  };

  return (
    <section className="flex h-[calc(100vh-160px)] min-h-[620px] flex-col overflow-hidden rounded-lg border border-border bg-background">
      <header className="border-b border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{counterpart?.name || 'Mentorship thread'}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <MentorPresenceIndicator />
              <span className="text-xs text-muted-foreground">Started from {conversation.startedFrom?.replace('-', ' ')}</span>
            </div>
          </div>
          {conversation.menteeId._id === user?._id && (
            <Button variant="outline" onClick={() => setEscalationOpen(true)}>
              <CalendarPlus className="h-4 w-4" />
              Request 1:1 Session
            </Button>
          )}
        </div>
      </header>

      <div className="space-y-3 border-b border-border bg-card/60 p-4">
        <SessionContextCard session={conversation.activeSessionId} />
        <PinnedAdvicePanel advice={pinnedAdvice} />
        {pendingEscalation && (
          <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-sm text-foreground">
            Pending session request: <span className="font-bold">{pendingEscalation.topic}</span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message) => (
          <MessageBubble key={message._id} message={message} isMine={message.senderId?._id === user?._id} />
        ))}
      </div>

      <footer className="border-t border-border bg-card p-4">
        <div className="flex gap-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask a follow-up, share context, or clarify your next step..."
            className="min-h-[52px]"
          />
          <Button className="h-[52px] px-5" onClick={submit} disabled={sendMessage.isPending || draft.trim().length < 1}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </footer>

      <EscalationRequestModal open={escalationOpen} onOpenChange={setEscalationOpen} conversationId={conversation._id} />
    </section>
  );
};
