import { MessageCircle, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { MentorshipConversation } from '../types';

interface ConversationSidebarProps {
  conversations: MentorshipConversation[];
  selectedId?: string;
  currentUserId?: string;
  onSelect: (id: string) => void;
}

export const ConversationSidebar = ({ conversations, selectedId, currentUserId, onSelect }: ConversationSidebarProps) => {
  return (
    <aside className="h-full overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-bold text-foreground">Mentorship</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Ongoing guidance, replies, and session escalations.</p>
      </div>
      <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-2">
        {conversations.map((conversation) => {
          const isSelected = conversation._id === selectedId;
          const counterpart = conversation.mentorId._id === currentUserId ? conversation.menteeId : conversation.mentorId;
          const unread = currentUserId ? Number((conversation.unreadCounts as any)?.[currentUserId] || 0) : 0;
          const hasPinned = conversation.participantStates?.some((state) => state.pinnedAdvice);
          return (
            <button
              key={conversation._id}
              onClick={() => onSelect(conversation._id)}
              className={cn(
                'mb-2 w-full rounded-lg border p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5',
                isSelected ? 'border-primary bg-primary/8' : 'border-transparent'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">{counterpart?.name || 'Mentor'}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {conversation.lastMessagePreview || 'Start the guidance thread.'}
                  </p>
                </div>
                {unread > 0 ? <Badge className="shrink-0 text-[10px]">{unread}</Badge> : <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>{conversation.startedFrom?.replace('-', ' ') || 'mentor profile'}</span>
                {hasPinned && <Pin className="h-3 w-3 text-primary" />}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};
