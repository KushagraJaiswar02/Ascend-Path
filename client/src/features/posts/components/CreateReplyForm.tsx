import React, { useState } from 'react';
import { useReply } from '../hooks/useReply';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CreateReplyFormProps {
  postId: string;
}

export const CreateReplyForm: React.FC<CreateReplyFormProps> = ({ postId }) => {
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const replyMutation = useReply();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (content.trim().length < 10) {
      setErrorMsg('Reply must be at least 10 characters long');
      return;
    }

    replyMutation.mutate(
      { postId, content },
      {
        onSuccess: () => {
          setContent('');
          setErrorMsg('');
        },
        onError: (error: any) => {
          if (error.response?.data?.errors) {
            setErrorMsg(error.response.data.errors.map((e: any) => e.message).join(', '));
          } else {
            setErrorMsg(error.response?.data?.error || 'Failed to submit reply. Please try again.');
          }
        }
      }
    );
  };

  return (
    <Card className="border border-border bg-card mt-lg shadow-subtle">
      <CardContent className="p-md">
        <form onSubmit={handleSubmit} className="space-y-sm">
          <div className="flex flex-col gap-xs">
            <label className="text-body-xs font-semibold text-foreground">Post a Reply</label>
            {errorMsg && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 p-sm rounded-md text-body-xs leading-normal">
                {errorMsg}
              </div>
            )}
            <Textarea 
              placeholder="Share your insights, ask a question, or provide guidance..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              minLength={10}
              rows={4}
              className="w-full bg-background border-border text-foreground text-body-sm rounded-md focus-visible:ring-primary"
            />
          </div>
          <div className="flex justify-end pt-xs">
            <Button 
              type="submit" 
              variant="primary"
              size="md"
              disabled={replyMutation.isPending || !content.trim()}
              className="px-md"
            >
              {replyMutation.isPending ? 'Submitting...' : 'Post Reply'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

