import React from 'react';
import { usePosts } from '../features/posts/hooks/usePosts';
import { PostCard } from '../features/posts/components/PostCard';
import { CreatePostForm } from '../features/posts/components/CreatePostForm';
import { useAuthStore } from '../store/useAuthStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const Forum: React.FC = () => {
  const { data, isLoading, isError } = usePosts();
  const { isAuthenticated } = useAuthStore();

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
          <h2 className="text-body-md font-bold text-foreground">Recent Discussions</h2>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {data?.posts?.length || 0} posts
          </span>
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
            title="No discussions yet"
            description="The community forum is currently empty. Be the first to start a conversation and share with the network!"
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
          <div className="space-y-sm">
            {data.posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

