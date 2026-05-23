import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { EmptyState } from '@/components/layout/EmptyState';


interface RecentPostsProps {
  posts: any[];
}

export const RecentPosts: React.FC<RecentPostsProps> = ({ posts }) => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground shadow-subtle overflow-hidden transition-all duration-300 hover:border-border/80">
      <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-border/50 bg-muted/10">
        <CardTitle className="text-card-title font-bold text-foreground">
          Recent Discussions
        </CardTitle>
        <Link 
          to="/forum" 
          className="text-metadata font-semibold text-primary hover:underline transition-colors focus-visible:underline"
        >
          View All
        </Link>
      </CardHeader>
      
      <CardContent className="p-5 flex-grow flex flex-col justify-between">
        {posts.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No topics yet"
            description="No recent discussions have been posted. Start the conversation inside the forum!"
            className="border-none bg-transparent min-h-[220px] p-0 shadow-none"
            action={{
              label: "Start a Topic",
              onClick: () => navigate("/forum")
            }}
          />
        ) : (
          <ul className="flex flex-col gap-3 flex-grow">
            {posts.map((post) => (
              <li 
                key={post._id} 
                className="group relative flex flex-col justify-between p-4 border border-border/60 rounded-xl bg-card hover:bg-muted/20 hover:border-primary/20 transition-all duration-200"
              >
                <Link to={`/forum/${post._id}`} className="block focus:outline-none">
                  <h3 className="text-body-p font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-metadata text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {post.content ? post.content.replace(/<[^>]*>/g, '') : 'No description available.'}
                  </p>
                  
                  {/* Clean, typographic metadata area */}
                  <div className="flex items-center gap-3 mt-3 text-metadata text-muted-foreground select-none">
                    <Badge variant="outline" className="text-[10px] font-bold px-2 py-0 bg-background/50 border-border/60">
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>{post.upvotes || 0}</span>
                    </div>
                    {post.replies !== undefined && (
                      <div className="flex items-center gap-1">
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


