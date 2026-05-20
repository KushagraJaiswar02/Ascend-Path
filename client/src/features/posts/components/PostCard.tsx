import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Eye, CheckCircle2 } from 'lucide-react';
import type { Post } from '../hooks/usePosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatRelativeTime } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = memo(({ post }) => {
  const voteCount = post.upvotes - post.downvotes;
  
  // Category styles dictionary
  const categoryStyles: Record<string, { label: string; variant: "secondary" | "success" | "warning" | "destructive" | "default" | "outline" }> = {
    general: { label: 'General', variant: 'outline' },
    career: { label: 'Career Advice', variant: 'default' },
    skills: { label: 'Skills', variant: 'secondary' },
    education: { label: 'Education', variant: 'warning' },
    technical: { label: 'Technical Question', variant: 'destructive' },
  };

  const currentCategory = categoryStyles[post.category] || { label: post.category, variant: 'outline' };

  return (
    <Card className="hover:border-primary/30 hover:shadow-medium transition-all duration-200">
      <CardHeader className="p-md pb-xs">
        <div className="flex items-start justify-between gap-sm">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-xs">
              <Badge variant={currentCategory.variant} className="capitalize text-[10px] px-2 py-0.5 font-bold tracking-wider">
                {currentCategory.label}
              </Badge>
              {post.isSolved && (
                <Badge variant="success" className="text-[10px] px-2 py-0.5 font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="h-3 w-3 shrink-0" />
                  Solved
                </Badge>
              )}
            </div>
            
            <CardTitle className="text-body-md font-bold leading-snug tracking-tight text-foreground hover:text-primary transition-colors mt-xs truncate">
              <Link to={`/forum/${post._id}`} className="block">
                {post.title}
              </Link>
            </CardTitle>
          </div>

          <div className="flex items-center gap-xs bg-muted/40 border border-border px-sm py-1 rounded-md shrink-0 select-none">
            <ThumbsUp className={`h-3.5 w-3.5 shrink-0 ${voteCount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-xs font-extrabold text-foreground">{voteCount}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-md pt-xs space-y-md">
        <p className="text-body-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {post.content}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-xs">
            {post.tags.map((tag) => (
              <span key={tag} className="text-[10px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/40 select-none">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border/40 pt-sm mt-sm text-muted-foreground text-[11px] font-medium">
          {/* Author info */}
          <div className="flex items-center gap-xs">
            <Avatar className="h-5 w-5 border border-border/80">
              <AvatarFallback className="text-[9px] font-bold bg-muted text-muted-foreground">
                {post.authorId?.name ? post.authorId.name.slice(0, 2).toUpperCase() : 'US'}
              </AvatarFallback>
            </Avatar>
            <span className="font-bold text-foreground truncate max-w-[120px]">{post.authorId?.name}</span>
            <span className="text-muted-foreground/60">•</span>
            <span>{formatRelativeTime(post.createdAt)}</span>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-sm shrink-0">
            <div className="flex items-center gap-xs" title="Replies count">
              <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-bold text-foreground">{post.replyCount || 0}</span>
            </div>
            <div className="flex items-center gap-xs" title="Views">
              <Eye className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="font-semibold">{post.viewCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PostCard.displayName = 'PostCard';
