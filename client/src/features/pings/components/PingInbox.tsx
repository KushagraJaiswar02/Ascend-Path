import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePingsInbox } from '../hooks/usePingsInbox';
import { PingCard } from './PingCard';
import { EmptyState } from '@/components/layout/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Inbox, AlertCircle, RefreshCw } from 'lucide-react';

export const PingInbox: React.FC = () => {
  const navigate = useNavigate();
  const { data: pings, isLoading, isError, refetch } = usePingsInbox();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <Card key={n} className="border border-border bg-card animate-pulse select-none">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-4 w-28 rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-5/6 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-destructive/20 bg-destructive/[2%] text-center p-6 my-4 rounded-xl">
        <CardContent className="flex flex-col items-center gap-4 py-4 select-none">
          <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-body-p font-bold text-foreground">Failed to load pings</h4>
            <p className="text-metadata text-muted-foreground leading-normal max-w-xs">
              We encountered a network issue synchronising your inbox. Let's try requesting the data again.
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            className="gap-1.5 bg-card hover:bg-muted text-foreground border-border"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Refetch</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!pings || pings.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Your direct inbox is empty"
        description="Direct pings allow you to answer career questions or receive guidance from learners in the mentorship ecosystem."
        className="min-h-[280px]"
        action={{
          label: "Discover Roadmaps",
          onClick: () => navigate("/explore")
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {pings.map((ping) => (
        <PingCard key={ping._id} ping={ping} type="inbox" />
      ))}
    </div>
  );
};
