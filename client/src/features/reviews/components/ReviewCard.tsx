import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useEditReviewMutation, useDeleteReviewMutation } from '../hooks/useReviews';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { Star, AlertTriangle, ShieldCheck, Trash2, Pencil, Clock } from 'lucide-react';

interface ReviewCardProps {
  review: {
    _id: string;
    reviewerId: {
      _id: string;
      name: string;
      avatar?: string;
      respectPoints?: number;
    };
    guideId: string;
    sessionId: string;
    rating: number;
    reviewText: string;
    tags: string[];
    sentiment?: string;
    isVerified: boolean;
    moderationStatus: string;
    createdAt: string;
  };
  onReportClick: (reviewId: string) => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onReportClick }) => {
  const { user: currentUser } = useAuthStore();
  const { toast } = useToast();

  const editMutation = useEditReviewMutation();
  const deleteMutation = useDeleteReviewMutation();

  const isAuthor = currentUser?._id === review.reviewerId._id;
  const isAdmin = currentUser?.role === 'sentinel' || currentUser?.role === 'architect';

  // Inline Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editText, setEditText] = useState(review.reviewText);

  // Countdown timer for 15-minute edit lock
  const [minutesLeft, setMinutesLeft] = useState<number>(0);
  const [timeLeftString, setTimeLeftString] = useState<string>('');

  useEffect(() => {
    const createdTime = new Date(review.createdAt).getTime();
    const lockTime = createdTime + 15 * 60 * 1000; // 15 mins lock

    const updateTimer = () => {
      const remaining = lockTime - Date.now();
      if (remaining <= 0) {
        setMinutesLeft(0);
        setTimeLeftString('');
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setMinutesLeft(mins + secs / 60);
        setTimeLeftString(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [review.createdAt]);

  const canEdit = isAuthor && minutesLeft > 0;

  const handleEditSubmit = () => {
    if (editText.trim().length < 10) {
      toast({
        title: 'Error',
        description: 'Review must be at least 10 characters long',
        type: 'error',
      });
      return;
    }

    editMutation.mutate(
      {
        reviewId: review._id,
        payload: {
          rating: editRating,
          reviewText: editText.trim(),
        },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Review Updated',
            description: 'Your feedback has been successfully modified.',
            type: 'success',
          });
          setIsEditing(false);
        },
        onError: (err: any) => {
          toast({
            title: 'Update Failed',
            description: err.response?.data?.message || 'Failed to edit review.',
            type: 'error',
          });
        },
      }
    );
  };

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;

    deleteMutation.mutate(review._id, {
      onSuccess: () => {
        toast({
          title: 'Review Deleted',
          description: 'The review has been removed successfully.',
          type: 'success',
        });
      },
      onError: (err: any) => {
        toast({
          title: 'Delete Failed',
          description: err.response?.data?.message || 'Failed to delete review.',
          type: 'error',
        });
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-md sm:p-lg hover:border-border/80 hover:shadow-subtle transition-all duration-200 space-y-sm flex flex-col justify-between">
      
      {/* 1. Header info: Client Avatar, name & Verified Badge */}
      <div className="flex items-center justify-between gap-sm flex-wrap">
        <div className="flex items-center gap-sm select-none">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarImage src={review.reviewerId.avatar} alt={review.reviewerId.name} />
            <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
              {review.reviewerId.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h4 className="text-body-xs font-bold text-foreground leading-tight">
              {review.reviewerId.name}
            </h4>
            <span className="text-[9px] text-muted-foreground block">
              Respect Points: {review.reviewerId.respectPoints || 0}
            </span>
          </div>
        </div>

        {/* Verified Purchase Badge */}
        <div className="flex items-center gap-xs select-none">
          {review.isVerified && (
            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-500/20 text-[9px] font-bold py-0.5 rounded-full flex items-center gap-xxs">
              <ShieldCheck className="h-3 w-3 fill-emerald-600/10 shrink-0" />
              <span>Verified Session</span>
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground/60 font-semibold uppercase">
            {formatDate(review.createdAt)}
          </span>
        </div>
      </div>

      {/* 2. Rating & Interactive Inline Form */}
      {isEditing ? (
        <div className="space-y-sm border border-border/80 bg-muted/10 p-sm rounded-xl mt-xxs">
          <div className="flex items-center gap-xs">
            <span className="text-body-xs font-bold text-foreground select-none">Edit Star:</span>
            <div className="flex items-center gap-[2px] select-none">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEditRating(star)}
                  className="hover:scale-110 active:scale-95 transition-all text-warning"
                >
                  <Star className={`h-4.5 w-4.5 ${star <= editRating ? 'fill-warning' : 'text-muted-foreground/30'}`} />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="text-body-sm resize-none bg-background border border-border"
          />

          <div className="flex justify-end gap-xs select-none">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
              className="border-border text-foreground hover:bg-muted font-bold py-1 px-sm h-auto text-[11px]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleEditSubmit}
              disabled={editMutation.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/95 font-bold py-1 px-sm h-auto text-[11px]"
            >
              {editMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-xs select-text">
          {/* Star row */}
          <div className="flex items-center gap-[2px] select-none">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3.5 w-3.5 ${
                  star <= review.rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          {/* Review text */}
          <p className="text-body-sm text-foreground/90 font-medium leading-relaxed italic">
            "{review.reviewText}"
          </p>
        </div>
      )}

      {/* 3. Trait tags displayed on review card */}
      {!isEditing && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-xxs pt-xxs select-none">
          {review.tags.map((tag, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-[9px] font-bold px-[6px] py-[1.5px] border border-border/50 bg-muted/40 text-muted-foreground/80 hover:bg-muted transition-all"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* 4. Action Row: edit window timer, edit icon, delete, reported action */}
      <div className="flex items-center justify-between border-t border-border/40 pt-xs mt-xs text-body-xs font-semibold text-muted-foreground select-none">
        
        {/* Lock Countdown */}
        {canEdit && !isEditing ? (
          <div className="inline-flex items-center gap-xxs text-primary text-[10px] font-bold bg-primary/5 px-sm py-[2px] rounded-md border border-primary/10">
            <Clock className="h-3 w-3 animate-pulse shrink-0" />
            <span>Edit locks in: {timeLeftString}</span>
          </div>
        ) : (
          <div className="w-1" />
        )}

        {/* Action Triggers */}
        <div className="flex items-center gap-sm">
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-xxs text-muted-foreground hover:text-primary transition-colors text-[10px]"
              title="Edit Review"
            >
              <Pencil className="h-3.5 w-3.5 shrink-0" />
              <span>Edit</span>
            </button>
          )}

          {(isAuthor || isAdmin) && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="inline-flex items-center gap-xxs text-muted-foreground hover:text-destructive transition-colors text-[10px]"
              title="Delete Review"
            >
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              <span>Delete</span>
            </button>
          )}

          {!isAuthor && (
            <button
              onClick={() => onReportClick(review._id)}
              className="inline-flex items-center gap-xxs text-muted-foreground hover:text-destructive transition-colors text-[10px]"
              title="Flag Review"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Flag</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
