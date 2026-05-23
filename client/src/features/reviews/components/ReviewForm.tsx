import React, { useState } from 'react';
import { useSubmitReviewMutation } from '../hooks/useReviews';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { Star, Check } from 'lucide-react';

interface ReviewFormProps {
  sessionId: string;
  guideName: string;
  onSuccess: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  sessionId,
  guideName,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState('');

  const { toast } = useToast();
  const submitMutation = useSubmitReviewMutation();

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      if (prev.length >= 3) {
        toast({
          title: 'Tag limit reached',
          description: 'You can select up to 3 trait tags.',
          type: 'warning',
        });
        return prev;
      }
      return [...prev, tag];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (reviewText.trim().length < 10) {
      setError('Review description must be at least 10 characters long');
      return;
    }

    submitMutation.mutate(
      {
        sessionId,
        rating,
        reviewText: reviewText.trim(),
        tags: selectedTags,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Feedback Submitted!',
            description: `Thank you! Your verified review for ${guideName} has been logged.`,
            type: 'success',
          });
          onSuccess();
        },
        onError: (err: any) => {
          toast({
            title: 'Submission Failed',
            description: err.response?.data?.message || 'Failed to submit review.',
            type: 'error',
          });
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-md border border-border p-md sm:p-lg bg-card rounded-2xl shadow-subtle select-none">
      
      {/* 1. Star Rating Selection with Hover glows */}
      <div className="space-y-xs text-center flex flex-col items-center">
        <label className="text-body-xs font-bold text-foreground">
          Rate your experience with {guideName} <span className="text-destructive">*</span>
        </label>
        <div className="flex items-center gap-xs pt-xxs">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => setRating(star)}
              className="hover:scale-125 active:scale-90 transition-all text-warning shrink-0"
            >
              <Star
                className={`h-7 w-7 ${
                  star <= (hoverRating ?? rating)
                    ? 'fill-warning text-warning filter drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]'
                    : 'text-muted-foreground/30'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 2. Trait Pills selection (max 3) */}
      <div className="space-y-xs pt-xxs">
        <label className="text-body-xs font-bold text-foreground block">
          Select Mentor Strengths (Optional, max 3)
        </label>
        <div className="flex flex-wrap gap-xs pt-xxs">
          {['Helpful', 'Practical', 'Beginner Friendly', 'Deep Technical Knowledge', 'Good Communication'].map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => handleTagToggle(tag)}
                className={`cursor-pointer text-body-xs font-semibold px-sm py-[4px] border border-border/80 rounded-full transition-all duration-200 select-none shadow-sm flex items-center gap-[2px] ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-primary/5 hover:text-primary hover:border-primary/40'
                }`}
              >
                {isSelected && <Check className="h-3 w-3 shrink-0" />}
                <span>{tag}</span>
              </Badge>
            );
          })}
        </div>
      </div>

      {/* 3. Written Review Text Area */}
      <div className="space-y-xs">
        <label htmlFor="reviewText" className="text-body-xs font-bold text-foreground block">
          Write your feedback <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="reviewText"
          placeholder="What did you learn? How was their communication? What can they improve?"
          value={reviewText}
          onChange={(e) => {
            setReviewText(e.target.value);
            if (error) setError('');
          }}
          rows={4}
          required
          className="text-body-sm resize-none border border-border focus-visible:ring-1 focus-visible:ring-ring"
        />
        {error && (
          <p className="text-destructive text-[11px] font-semibold mt-xs select-none">
            {error}
          </p>
        )}
      </div>

      {/* 4. Action CTA */}
      <div className="flex justify-end pt-xs">
        <Button
          type="submit"
          disabled={submitMutation.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/95 font-bold shadow-md w-full sm:w-auto px-md py-xs rounded-xl"
        >
          {submitMutation.isPending ? 'Submitting...' : 'Submit Verified Review'}
        </Button>
      </div>

    </form>
  );
};
