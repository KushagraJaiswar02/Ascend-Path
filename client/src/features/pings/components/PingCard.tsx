import React, { useState } from 'react';
import type { Ping } from '../types';
import { PingResponseForm } from './PingResponseForm';
import { useRatePing } from '../hooks/useRatePing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MessageSquare, Star, ArrowRight, UserMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PingCardProps {
  ping: Ping;
  type: 'inbox' | 'sent';
}

const statusColors = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  answered: 'bg-success/10 text-success border-success/20',
  closed: 'bg-muted text-muted-foreground border-border/80',
  expired: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const PingCard: React.FC<PingCardProps> = ({ ping, type }) => {
  const [rating, setRating] = useState<number>(5);
  const rateMutation = useRatePing();

  const handleRate = (e: React.FormEvent) => {
    e.preventDefault();
    rateMutation.mutate({ pingId: ping._id, rating });
  };

  // Safely guard all nested user references with fallbacks
  const sender = ping.senderId || { _id: 'deleted-user', name: 'Deleted User', avatar: '', role: 'unknown' };
  const receiver = ping.receiverId || { _id: 'deleted-user', name: 'Deleted User', avatar: '', role: 'unknown' };
  
  const targetUser = type === 'inbox' ? sender : receiver;
  const isDeleted = targetUser._id === 'deleted-user';

  const userInitials = targetUser.name
    ? targetUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <Card 
      className={cn(
        "border border-border bg-card text-card-foreground shadow-subtle rounded-2xl overflow-hidden transition-all duration-300 relative group",
        "hover:shadow-medium hover:border-border/80"
      )}
    >
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 h-[2px] bg-transparent transition-colors duration-300",
          ping.status === 'pending' && "group-hover:bg-warning/30",
          ping.status === 'answered' && "group-hover:bg-success/30",
          ping.status === 'closed' && "group-hover:bg-primary/25"
        )} 
      />

      <CardContent className="p-5 space-y-4 mt-[2px]">
        {/* Card Header: User details + Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4 select-none">
          <div className="flex items-center gap-3">
            <Avatar className={cn("h-9 w-9 ring-1 ring-border/50", isDeleted && "opacity-60")}>
              <AvatarFallback className={cn("text-xs font-bold", isDeleted ? "bg-destructive/5 text-destructive" : "bg-muted")}>
                {isDeleted ? <UserMinus className="h-4 w-4" /> : userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-1">
                {type === 'inbox' ? 'Incoming From' : 'Outgoing To'}
              </p>
              <h4 className={cn("text-metadata font-bold text-foreground truncate", isDeleted && "text-muted-foreground italic")}>
                {targetUser.name}
                {!isDeleted && targetUser.role && (
                  <span className="text-[10px] ml-1.5 px-1.5 py-0.2 bg-muted/60 text-muted-foreground rounded capitalize border border-border/40">
                    {targetUser.role}
                  </span>
                )}
              </h4>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:self-center self-end">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(ping.createdAt).toLocaleDateString()}</span>
            </span>
            <Badge 
              variant="outline" 
              className={cn("capitalize tracking-wider text-[10px] font-bold px-2 py-0.5 select-none", statusColors[ping.status] || statusColors.closed)}
            >
              {ping.status}
            </Badge>
          </div>
        </div>

        {/* Card Body: Question Context */}
        <div className="space-y-2">
          <div className="flex items-start gap-1.5">
            <MessageSquare className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <h5 className="text-metadata font-bold text-foreground select-none">Question</h5>
          </div>
          <p className="text-body-p text-foreground/90 leading-relaxed whitespace-pre-wrap pl-5.5">
            {ping.question}
          </p>
          {ping.context && (
            <div className="text-metadata text-muted-foreground italic bg-muted/20 border border-border/50 p-3 rounded-xl pl-4 pl-5.5">
              <span className="font-bold not-italic text-foreground/80 block mb-0.5 select-none">Contextual details:</span>
              {ping.context}
            </div>
          )}
        </div>

        {/* Receiver Input Form (Inbox pending) */}
        {type === 'inbox' && ping.status === 'pending' && (
          <div className="pt-2 border-t border-border/30">
            <PingResponseForm pingId={ping._id} />
          </div>
        )}

        {/* Answered State (Inbox & Sent views) */}
        {(ping.status === 'answered' || ping.status === 'closed') && ping.response && (
          <div className="mt-4 pt-4 border-t border-border bg-primary/[1.5%] dark:bg-primary/[3%] -mx-5 -mb-5 p-5 rounded-b-2xl">
            <div className="space-y-2">
              <h5 className="text-metadata font-bold text-primary select-none flex items-center gap-1.5">
                <Star className="h-4 w-4 text-primary shrink-0" />
                <span>Response received</span>
              </h5>
              <p className="text-body-p text-foreground/90 leading-relaxed whitespace-pre-wrap pl-5.5">
                {ping.response}
              </p>
            </div>
            
            {/* Feedback / Rating actions for the sender */}
            {type === 'sent' && ping.status === 'answered' && !ping.rating && (
              <form onSubmit={handleRate} className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-primary/10 select-none">
                <label className="text-metadata font-bold text-muted-foreground uppercase tracking-wider">Rate Response Quality:</label>
                <div className="flex items-center gap-2">
                  <select 
                    value={rating} 
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="bg-background border border-border rounded-xl text-metadata font-bold text-foreground focus:ring-1 focus:ring-primary px-3 py-1 outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                  <Button 
                    type="submit"
                    size="sm"
                    disabled={rateMutation.isPending}
                    className="font-bold gap-1 text-xs"
                  >
                    <span>{rateMutation.isPending ? 'Rating...' : 'Submit Rating'}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </form>
            )}

            {/* Final Rating display */}
            {ping.rating && (
              <div className="mt-3 pt-3 border-t border-primary/10 text-metadata font-bold text-warning flex items-center gap-1 pl-5.5 select-none">
                <Star className="h-4 w-4 fill-warning text-warning shrink-0" />
                <span>Quality Score: {ping.rating} / 5 Stars</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
