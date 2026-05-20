import React from 'react';
import { ThumbsUp, CheckCircle2 } from 'lucide-react';
import type { Reply } from '../hooks/usePost';
import { useVote } from '../hooks/useVote';
import { useAuthStore } from '../../../store/useAuthStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';

interface ReplyItemProps {
  reply: Reply;
  postId: string;
  postAuthorId?: string;
}

export const ReplyItem: React.FC<ReplyItemProps> = ({ reply, postId, postAuthorId }) => {
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const voteMutation = useVote(postId);

  const voteCount = reply.upvotes - reply.downvotes;
  const isPostAuthor = isAuthenticated && user?._id === postAuthorId;
  const isReplyAuthor = user?._id === reply.authorId?._id;

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) return alert("You must be logged in to vote.");
    voteMutation.mutate({ targetId: reply._id, targetType: 'reply', voteType });
  };

  const solveMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/posts/${postId}/solve`, { replyId: reply._id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || "Failed to mark solution.");
    }
  });

  return (
    <Card 
      className={`transition-all duration-200 ${
        reply.isSolution 
          ? 'border-success/40 bg-success/5 shadow-subtle border-l-4 border-l-success' 
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
            {reply.isSolution && (
              <Badge variant="success" className="text-[10px] px-2 py-0.5 font-extrabold flex items-center gap-0.5 shadow-subtle">
                <CheckCircle2 className="h-3 w-3 shrink-0" />
                Accepted Solution
              </Badge>
            )}

            {isPostAuthor && !reply.isSolution && (
              <Button
                variant="outline"
                size="sm"
                disabled={solveMutation.isPending}
                onClick={() => solveMutation.mutate()}
                className="text-[10px] h-6 px-2 border-success/30 text-success hover:bg-success/10 hover:text-success"
              >
                Mark as Solution
              </Button>
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
  );
};
