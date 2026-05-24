import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePost, useRegisterPostView } from '../features/posts/hooks/usePost';
import { useVote } from '../features/posts/hooks/useVote';
import { ReplyItem } from '../features/posts/components/ReplyItem';
import { CreateReplyForm } from '../features/posts/components/CreateReplyForm';
import { useAuthStore } from '../store/useAuthStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, ThumbsUp, ThumbsDown, Eye, MessageSquare, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { SolvedThreadIndicator } from '@/features/posts/components/SolvedThreadIndicator';
import { ReportModal } from '@/features/moderation/components/ReportModal';

export const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [reportOpen, setReportOpen] = useState(false);
  const { data, isLoading, isError } = usePost(id || '');
  const viewMutation = useRegisterPostView(id || '');
  const registeredViewFor = useRef<string | null>(null);
  const voteMutation = useVote(id);
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!id || isLoading || isError || registeredViewFor.current === id) return;
    registeredViewFor.current = id;
    viewMutation.mutate();
  }, [id, isLoading, isError, viewMutation]);

  const categoryStyles: Record<string, { label: string; variant: "secondary" | "success" | "warning" | "destructive" | "default" | "outline" }> = {
    general: { label: 'General', variant: 'outline' },
    career: { label: 'Career Advice', variant: 'default' },
    skills: { label: 'Skills', variant: 'secondary' },
    education: { label: 'Education', variant: 'warning' },
    technical: { label: 'Technical Question', variant: 'destructive' },
  };

  if (isLoading) {
    return (
      <PageContainer size="tight" className="py-lg space-y-md">
        <Skeleton className="h-8 w-28" />
        <Card className="border border-border p-md bg-card space-y-md">
          <div className="space-y-sm">
            <Skeleton className="h-8 w-3/4" />
            <div className="flex items-center gap-xs">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          </div>
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-8 w-40" />
        </Card>
        <div className="space-y-sm pt-md">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer size="tight" className="py-lg text-center space-y-md">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-md rounded-lg text-body-sm">
          Post not found or failed to load the requested discussion.
        </div>
        <Link to="/forum">
          <Button variant="outline" size="sm">
            Back to Forum
          </Button>
        </Link>
      </PageContainer>
    );
  }

  const { post, replies } = data;
  const currentCategory = categoryStyles[post.category] || { label: post.category, variant: 'outline' };
  const voteCount = post.upvotes - post.downvotes;
  const isPostAuthor = isAuthenticated && user?._id === post.authorId?._id;
  const solved = post.isResolved || post.isSolved;

  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (!isAuthenticated) return alert("You must be logged in to vote.");
    voteMutation.mutate({ targetId: post._id, targetType: 'post', voteType });
  };

  return (
    <PageContainer size="tight" className="py-lg">
      {/* Back Button */}
      <div className="mb-md">
        <Link to="/forum">
          <Button variant="ghost" size="sm" className="flex items-center gap-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Forum
          </Button>
        </Link>
      </div>

      {/* Main Post Card */}
      <Card className="border border-border bg-card shadow-subtle mb-lg">
        <CardContent className="p-md space-y-md">
          <div className="space-y-xs">
            <div className="flex flex-wrap items-center gap-xs">
              <Badge variant={currentCategory.variant} className="capitalize text-[10px] px-2 py-0.5 font-bold tracking-wider">
                {currentCategory.label}
              </Badge>
              <SolvedThreadIndicator solved={solved} />
            </div>
            
            <h1 className="text-heading-sm sm:text-heading-md font-bold tracking-tight text-foreground leading-snug mt-xs">
              {post.title}
            </h1>
            
            {/* Meta Bar */}
            <div className="flex flex-wrap items-center gap-xs text-muted-foreground text-[11px] pt-xs border-b border-border/40 pb-sm select-none">
              <div className="flex items-center gap-xs">
                <Avatar className="h-5 w-5 border border-border">
                  <AvatarFallback className="text-[9px] font-bold bg-muted text-muted-foreground">
                    {post.authorId?.name ? post.authorId.name.slice(0, 2).toUpperCase() : 'US'}
                  </AvatarFallback>
                </Avatar>
                <span className="font-bold text-foreground">{post.authorId?.name}</span>
                <span className="text-[10px] font-medium capitalize">({post.authorId?.role})</span>
              </div>
              <span className="text-muted-foreground/60">•</span>
              <div className="flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                <span>{formatRelativeTime(post.createdAt)}</span>
              </div>
              <span className="text-muted-foreground/60">•</span>
              <div className="flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                <span>{post.viewCount} views</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="text-body-sm text-foreground whitespace-pre-wrap leading-relaxed py-xs">
            {post.content}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border/40 pt-sm">
            <div className="flex items-center gap-xs">
              <Button
                onClick={() => handleVote('upvote')}
                disabled={voteMutation.isPending}
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${voteCount > 0 ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:bg-muted'}`}
                title="Upvote discussion"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <span className={`text-xs font-extrabold px-xs ${voteCount > 0 ? 'text-primary' : voteCount < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {voteCount}
              </span>
              <Button
                onClick={() => handleVote('downvote')}
                disabled={voteMutation.isPending}
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${voteCount < 0 ? 'text-destructive bg-destructive/5' : 'text-muted-foreground hover:bg-muted'}`}
                title="Downvote discussion"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>

            {isPostAuthor ? (
              <span className="text-[10px] text-muted-foreground/80 bg-muted/30 px-xs py-0.5 rounded border border-border/40">
                Post Author
              </span>
            ) : (
              isAuthenticated && (
                <Button
                  onClick={() => setReportOpen(true)}
                  variant="ghost"
                  className="text-xs font-semibold text-muted-foreground hover:text-red-400 flex items-center gap-1 h-7 px-2"
                >
                  Report
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetType="post"
        targetId={post._id}
        targetName={post.title}
      />

      {/* Replies Timeline Section */}
      <div className="space-y-md">
        <div className="flex items-center justify-between pb-xs border-b border-border/65">
          <h2 className="text-body-md font-bold text-foreground flex items-center gap-xs">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Replies
          </h2>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {replies.length} replies
          </span>
        </div>

        {replies.length > 0 ? (
          <div className="space-y-sm">
            {replies.map((reply) => (
              <ReplyItem key={reply._id} reply={reply} postId={post._id} postAuthorId={post.authorId?._id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-lg bg-muted/20 border border-dashed border-border rounded-lg text-body-xs text-muted-foreground">
            No replies yet. Be the first to share your input!
          </div>
        )}

        {/* Reply Submission */}
        {isAuthenticated ? (
          <CreateReplyForm postId={post._id} />
        ) : (
          <div className="bg-muted/40 border border-border p-md rounded-lg flex flex-col sm:flex-row items-center justify-between gap-sm text-center sm:text-left mt-lg">
            <div className="space-y-0.5">
              <h4 className="text-body-xs font-bold text-foreground">Want to share your expertise?</h4>
              <p className="text-[11px] text-muted-foreground">Log in to post a reply and assist your peers in their learning journey.</p>
            </div>
            <Link to="/auth/login" className="shrink-0">
              <Button variant="primary" size="sm">Log In to Reply</Button>
            </Link>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
