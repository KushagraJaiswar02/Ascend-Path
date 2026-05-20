import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp } from 'lucide-react';

interface RecentPostsProps {
  posts: any[];
}

export const RecentPosts: React.FC<RecentPostsProps> = ({ posts }) => {
  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground shadow-subtle overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-md border-b border-border/50 bg-muted/20">
        <CardTitle className="text-body-lg font-bold text-foreground">
          Recent Discussions
        </CardTitle>
        <Link 
          to="/forum" 
          className="text-body-sm font-semibold text-primary hover:text-primary/80 transition-colors focus-visible:underline"
        >
          View All
        </Link>
      </CardHeader>
      <CardContent className="p-md sm:p-lg flex-grow flex flex-col justify-between">
        {posts.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-xl">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-md">
              <MessageSquare className="h-5 w-5" />
            </div>
            <h3 className="text-body-md font-bold text-foreground mb-xs">No topics yet</h3>
            <p className="text-muted-xs text-muted-foreground max-w-[240px] mb-md leading-normal">
              No recent discussions have been posted. Start the conversation!
            </p>
            <Button size="sm" asChild>
              <Link to="/forum">Start a Topic</Link>
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-md flex-grow">
            {posts.map((post) => (
              <li 
                key={post._id} 
                className="group relative flex flex-col justify-between p-md border border-border/50 rounded-lg bg-card hover:bg-muted/10 transition-all duration-200"
              >
                <Link to={`/forum/${post._id}`} className="block focus:outline-none">
                  <h3 className="text-body-md font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-muted-xs text-muted-foreground mt-xs line-clamp-2 leading-relaxed">
                    {post.content ? post.content.replace(/<[^>]*>/g, '') : 'No description available.'}
                  </p>
                  
                  {/* Clean, typographic metadata area */}
                  <div className="flex items-center gap-md mt-md text-muted-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0">
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-xs">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{post.upvotes || 0}</span>
                    </div>
                    {post.replies !== undefined && (
                      <div className="flex items-center gap-xs">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{post.replies} replies</span>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

