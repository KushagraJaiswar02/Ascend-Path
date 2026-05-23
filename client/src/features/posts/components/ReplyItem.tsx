import React from 'react';
import { ThumbsUp } from 'lucide-react';
import type { Reply } from '../hooks/usePost';
import { useAcceptAnswer, useUnacceptAnswer } from '../hooks/usePost';
import { useVote } from '../hooks/useVote';
import { useAuthStore } from '../../../store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { AcceptedAnswerBadge } from './AcceptedAnswerBadge';
import { ResolvePostButton } from './ResolvePostButton';
import { TopAnswerHighlight } from './TopAnswerHighlight';

interface ReplyItemProps {
  reply: Reply;
  postId: string;
  postAuthorId?: string;
}

export const ReplyItem: React.FC<ReplyItemProps> = ({ reply, postId, postAuthorId }) => {
  const { user, isAuthenticated } = useAuthStore();
  const voteMutation = useVote(postId);
  const acceptMutation = useAcceptAnswer(postId);
  const unacceptMutation = useUnacceptAnswer(postId);

  const voteCount = reply.upvotes - reply.downvotes;
  const isPostAuthor = isAuthenticated && user?._id === postAuthorId;
  const isReplyAuthor = user?._id === reply.authorId?._id;
  const isAccepted = reply.isAccepted || reply.isSolution;

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) return alert("You must be logged in to vote.");
    voteMutation.mutate({ targetId: reply._id, targetType: 'reply', voteType });
  };

  return (
    <TopAnswerHighlight active={isAccepted}>
      <Card 
        className={`transition-all duration-200 ${
          isAccepted 
            ? 'border-success/40 bg-transparent shadow-none' 
            : 'border-border bg-card'
        }`}
      >
        <CardContent className="p-md space-y-sm">
        {/* Reply Header */}
        <div className="flex items-center justify-between gap-sm">
          <div className="flex items-center gap-xs">
            <Avatar className="h-6 w-6 border border-border">
              <AvatarFallback className="text-[10px] font-bold bg-muted text-muted-foreground">
                {reply.authorId?.name ? reply.authorId.name.slice(0, 2).toUpperCase() : 'US'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-xs leading-none">
              <span className="text-body-xs font-bold text-foreground">{reply.authorId?.name}</span>
              <span className="text-[10px] text-muted-foreground capitalize">({reply.authorId?.role})</span>
            </div>
            <span className="text-muted-foreground/60 text-xs hidden sm:inline">•</span>
            <span className="text-[10px] text-muted-foreground">{formatRelativeTime(reply.createdAt)}</span>
          </div>

          <div className="flex items-center gap-xs">
            {isAccepted && <AcceptedAnswerBadge />}

            {isPostAuthor && (
              <ResolvePostButton
                accepted={isAccepted}
                disabled={acceptMutation.isPending || unacceptMutation.isPending}
                onAccept={() => acceptMutation.mutate(reply._id)}
                onUnaccept={() => unacceptMutation.mutate()}
              />
            )}
          </div>
        </div>

        {/* Reply Body */}
        <p className="text-body-xs text-foreground whitespace-pre-wrap leading-relaxed pl-1 pt-xs">
          {reply.content}
        </p>

        {/* Reply Footer / Actions */}
        <div className="flex items-center justify-between border-t border-border/40 pt-sm mt-sm">
          <div className="flex items-center gap-xs">
            <Button
              onClick={() => handleVote('upvote')} 
              disabled={voteMutation.isPending}
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${voteCount > 0 ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-muted'}`}
              title="Upvote reply"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            <span className={`text-xs font-extrabold px-xs ${voteCount > 0 ? 'text-primary' : voteCount < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {voteCount}
            </span>
          </div>
          
          {isReplyAuthor && (
            <span className="text-[10px] text-muted-foreground/80 bg-muted/30 px-xs py-0.5 rounded border border-border/40">
              Author
            </span>
          )}
        </div>
        </CardContent>
      </Card>
    </TopAnswerHighlight>
  );
};
