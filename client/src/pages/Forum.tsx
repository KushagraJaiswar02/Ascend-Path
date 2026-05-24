import React, { useState } from 'react';
import { usePosts, type PostScopeFilter, type ResolutionFilter } from '../features/posts/hooks/usePosts';
import { PostCard } from '../features/posts/components/PostCard';
import { CreatePostForm } from '../features/posts/components/CreatePostForm';
import { useAuthStore } from '../store/useAuthStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Lock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const Forum: React.FC = () => {
  const [page, setPage] = useState(1);
  const [resolution, setResolution] = useState<ResolutionFilter>('all');
  const [scope, setScope] = useState<PostScopeFilter>('all');
  const { isAuthenticated } = useAuthStore();
  const effectiveScope = isAuthenticated ? scope : 'all';
  const pageSize = 10;
  const { data, isLoading, isError } = usePosts(page, pageSize, undefined, resolution, effectiveScope);
  const totalPosts = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  const handleResolutionChange = (value: ResolutionFilter) => {
    setResolution(value);
    setPage(1);
  };

  const handleScopeChange = (value: PostScopeFilter) => {
    setScope(value);
    setPage(1);
  };

  return (
    <PageContainer size="tight" className="py-lg">
      <PageHeader 
        title="Community Forum" 
        description="Share ideas, ask questions, collaborate with peers, and receive guidance from experienced guides."
        actions={
          !isAuthenticated && (
            <Link to="/auth/login">
              <Button variant="outline" size="sm" className="flex items-center gap-xs">
                <Lock className="h-3 w-3" />
                Sign in to Post
              </Button>
            </Link>
          )
        }
      />
      
      {isAuthenticated ? (
        <div className="mb-lg">
          <CreatePostForm />
        </div>
      ) : (
        <div className="bg-muted/40 border border-border p-md rounded-lg mb-lg flex flex-col sm:flex-row items-center justify-between gap-sm text-center sm:text-left">
          <div className="space-y-0.5">
            <h4 className="text-body-sm font-bold text-foreground">Join the Discussion</h4>
            <p className="text-body-xs text-muted-foreground">Sign in to ask questions, vote, and share your perspectives with others.</p>
          </div>
          <Link to="/auth/login" className="shrink-0">
            <Button variant="primary" size="sm">Log In</Button>
          </Link>
        </div>
      )}

      <div className="space-y-md">
        <div className="flex items-center justify-between pb-xs border-b border-border/65">
          <h2 className="text-body-md font-bold text-foreground">
            {effectiveScope === 'mine' ? 'Your Discussions' : 'Recent Discussions'}
          </h2>
          <div className="flex flex-wrap items-center justify-end gap-xs">
            {isAuthenticated && (
              <div className="flex items-center rounded-md border border-border bg-card p-0.5">
                {(['all', 'mine'] as PostScopeFilter[]).map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant={scope === value ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => handleScopeChange(value)}
                    className="h-6 px-2 text-[10px]"
                  >
                    {value === 'all' ? 'All posts' : 'My posts'}
                  </Button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-xs">
              {(['all', 'resolved', 'unresolved'] as ResolutionFilter[]).map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={resolution === value ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleResolutionChange(value)}
                  className="h-7 px-2 text-[10px] capitalize"
                >
                  {value === 'all' ? 'All' : value === 'resolved' ? 'Solved' : 'Open'}
                </Button>
              ))}
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {totalPosts} posts
            </span>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-sm">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-border rounded-lg p-md bg-card space-y-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex items-center justify-between pt-xs">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-md rounded-lg text-center text-body-sm">
            Failed to load posts. Please refresh the page or try again later.
          </div>
        )}
        
        {!isLoading && !isError && (!data?.posts || data.posts.length === 0) && (
          <EmptyState 
            icon={MessageSquare}
            title={effectiveScope === 'mine' ? 'No posts from you yet' : 'No discussions yet'}
            description={
              effectiveScope === 'mine'
                ? 'Your forum posts will appear here once you start a discussion.'
                : 'The community forum is currently empty. Be the first to start a conversation and share with the network!'
            }
            action={
              isAuthenticated 
                ? undefined 
                : {
                    label: "Sign in to post",
                    onClick: () => window.location.href = '/auth/login'
                  }
            }
          />
        )}

        {!isLoading && !isError && data?.posts && data.posts.length > 0 && (
          <div className="space-y-md">
            <div className="space-y-sm">
              {data.posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-sm border-t border-border/60 pt-md">
                <p className="text-body-xs text-muted-foreground font-medium">
                  Page {data.page} of {totalPages}
                </p>
                <div className="flex items-center gap-xs">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1 || isLoading}
                    className="gap-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages || isLoading}
                    className="gap-xs"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
