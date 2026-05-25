import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/useAuthStore';
import { useMentorshipConversation, useMentorshipConversations } from '@/features/mentorship/hooks';
import { ConversationSidebar } from '@/features/mentorship/components/ConversationSidebar';
import { ConversationThread } from '@/features/mentorship/components/ConversationThread';
import { EmptyGuidanceState } from '@/features/mentorship/components/EmptyGuidanceState';

export const MentorshipInboxPage = () => {
  const [params, setParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState(params.get('conversation') || '');
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const conversations = useMentorshipConversations();

  const firstConversationId = conversations.data?.[0]?._id;
  useEffect(() => {
    if (!selectedId && firstConversationId) setSelectedId(firstConversationId);
  }, [firstConversationId, selectedId]);

  const selectedConversationId = selectedId || firstConversationId;
  const conversation = useMentorshipConversation(selectedConversationId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setParams({ conversation: id });
  };

  const hasConversations = Boolean(conversations.data?.length);
  const sortedConversations = useMemo(() => conversations.data || [], [conversations.data]);

  return (
    <PageContainer size="wide" className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Private mentorship starts as lightweight guidance and only escalates into live sessions when the conversation has enough context.
        </p>
      </div>

      {conversations.isLoading ? (
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <Skeleton className="h-[620px] rounded-lg" />
          <Skeleton className="h-[620px] rounded-lg" />
        </div>
      ) : !hasConversations ? (
        <EmptyGuidanceState onExplore={() => navigate('/explore')} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <ConversationSidebar
            conversations={sortedConversations}
            selectedId={selectedConversationId}
            currentUserId={user?._id}
            onSelect={handleSelect}
          />
          {conversation.data ? (
            <ConversationThread
              conversation={conversation.data.conversation}
              messages={conversation.data.messages}
              escalations={conversation.data.escalations}
            />
          ) : (
            <Skeleton className="h-[620px] rounded-lg" />
          )}
        </div>
      )}
    </PageContainer>
  );
};
