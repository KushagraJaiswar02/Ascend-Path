import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Star, MessageSquareQuote } from 'lucide-react';

interface ReviewPreviewProps {
  reviews: any[];
}

export const ReviewPreview: React.FC<ReviewPreviewProps> = ({ reviews }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-md">
      {reviews.length === 0 ? (
        <Card className="border border-border bg-card border-dashed p-xl text-center select-none shadow-subtle">
          <CardContent className="flex flex-col items-center gap-sm">
            <MessageSquareQuote className="h-10 w-10 text-muted-foreground/55 shrink-0" />
            <div>
              <h3 className="text-body-md font-bold text-foreground mb-xxs">No reviews yet</h3>
              <p className="text-muted-sm text-muted-foreground max-w-xs mx-auto">
                Completed study session reviews from learners will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        reviews.map((review) => {
          const client = review.clientId || { name: 'Anonymous Student', respectPoints: 0 };
          const clientInitials = client.name.charAt(0);

          return (
            <Card
              key={review._id}
              className="border border-border bg-card hover:border-border/80 hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-md sm:p-lg flex flex-col md:flex-row gap-sm md:gap-md items-start justify-between">
                {/* Client info & review content */}
                <div className="space-y-sm flex-grow">
                  {/* Rating Stars & Topic badge */}
                  <div className="flex flex-wrap items-center gap-sm select-none">
                    <div className="flex items-center gap-[2px]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= review.rating
                              ? 'fill-warning text-warning'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold px-sm py-[2px] bg-muted/60 border border-border/80 rounded-md text-muted-foreground uppercase tracking-widest">
                      Topic: {review.topic}
                    </span>
                  </div>

                  {/* Review Text */}
                  <p className="text-body-sm text-foreground/90 font-medium leading-relaxed italic select-text">
                    "{review.review || 'No written comments.'}"
                  </p>

                  {/* Client identity row */}
                  <div className="flex items-center gap-sm select-none pt-xxs">
                    <Avatar className="h-7 w-7 border border-border/60">
                      <AvatarImage src={client.avatar} alt={client.name} />
                      <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                        {clientInitials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-wrap items-center gap-x-sm text-body-xs font-semibold">
                      <span className="text-foreground">{client.name}</span>
                      <span className="text-muted-foreground/40 font-normal">|</span>
                      <div className="inline-flex items-center gap-[2px] text-muted-foreground">
                        <Award className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Respect:</span>
                        <span className="text-foreground font-bold">{client.respectPoints}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Date */}
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none shrink-0 self-start pt-[3px] bg-muted/30 px-sm py-[2px] border border-border/40 rounded-md">
                  {formatDate(review.updatedAt)}
                </span>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};
