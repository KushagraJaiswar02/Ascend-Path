import React, { useState } from 'react';
import { useCreatePost } from '../hooks/useCreatePost';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Briefcase, GraduationCap, Compass } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export const CreatePostForm: React.FC = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [errorMsg, setErrorMsg] = useState('');
  const createPostMutation = useCreatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (content.trim().length < 10) {
      setErrorMsg('Content must be at least 10 characters long');
      return;
    }

    createPostMutation.mutate(
      { title, content, category },
      {
        onSuccess: () => {
          toast({
            title: 'Posted',
            description: 'Your forum post is live.',
            type: 'success',
          });
          setTitle('');
          setContent('');
          setCategory('general');
          setErrorMsg('');
        },
        onError: (error: any) => {
          if (error.response?.data?.errors) {
            setErrorMsg(error.response.data.errors.map((e: any) => e.message).join(', '));
          } else {
            setErrorMsg(error.response?.data?.error || 'Failed to create post. Please try again.');
          }
        }
      }
    );
  };

  const categories = [
    { value: 'general', label: 'General', icon: Compass, color: 'border-border hover:bg-muted/50' },
    { value: 'career', label: 'Career Advice', icon: Briefcase, color: 'hover:border-primary/50' },
    { value: 'skills', label: 'Skills Development', icon: Sparkles, color: 'hover:border-secondary/50' },
    { value: 'education', label: 'Education', icon: GraduationCap, color: 'hover:border-warning/50' },
  ];

  return (
    <Card className="shadow-subtle border-border">
      <CardHeader className="p-md pb-xs">
        <CardTitle className="text-body-lg font-bold text-foreground">Start a Discussion</CardTitle>
      </CardHeader>
      
      <CardContent className="p-md pt-xs space-y-md">
        {errorMsg && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 p-sm rounded-md text-body-xs leading-normal">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md">
          {/* Title Input */}
          <div className="space-y-xs">
            <label className="text-body-xs font-semibold text-foreground">Discussion Title</label>
            <Input 
              type="text" 
              placeholder="What are we talking about today?" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full"
            />
          </div>

          {/* Visual Category Selection UI */}
          <div className="space-y-xs">
            <label className="text-body-xs font-semibold text-foreground">Select Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-xs">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex flex-col items-center justify-center p-sm rounded-lg border text-center transition-all select-none cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                        : 'border-border bg-card text-muted-foreground ' + cat.color
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 mb-xs shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-[10px] font-bold tracking-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Textarea */}
          <div className="space-y-xs">
            <label className="text-body-xs font-semibold text-foreground">Body Content</label>
            <Textarea 
              placeholder="Provide context, ask questions, or share your thoughts here..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              minLength={10}
              rows={5}
              className="w-full resize-none leading-relaxed"
            />
            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
              <span>Must be at least 10 characters</span>
              <span>{content.length} characters</span>
            </div>
          </div>

          <div className="flex justify-end pt-xs">
            <Button 
              type="submit" 
              variant="primary"
              size="md"
              disabled={createPostMutation.isPending}
              className="px-lg"
            >
              {createPostMutation.isPending ? 'Posting...' : 'Publish Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
