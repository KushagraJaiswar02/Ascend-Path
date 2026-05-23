import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Inbox, ArrowRight } from 'lucide-react';
import { EmptyState } from '@/components/layout/EmptyState';

interface RecentPingsProps {
  pings: any[];
}

export const RecentPings: React.FC<RecentPingsProps> = ({ pings }) => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground shadow-subtle overflow-hidden transition-all duration-300 hover:border-border/80">
      <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-border/50 bg-muted/10">
        <div className="flex items-center gap-2">
          <CardTitle className="text-card-title font-bold text-foreground">
            Action Required
          </CardTitle>
          {pings.length > 0 && (
            <Badge variant="warning" className="text-[10px] font-bold px-2 py-0.5 select-none animate-pulse">
              {pings.length} pending
            </Badge>
          )}
        </div>
        <Link 
          to="/pings" 
          className="text-metadata font-semibold text-primary hover:underline transition-colors focus-visible:underline"
        >
          View Inbox
        </Link>
      </CardHeader>
      
      <CardContent className="p-5 flex-grow flex flex-col justify-between">
        {pings.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="All caught up!"
            description="You have no pending pings requiring your immediate feedback right now."
            className="border-none bg-transparent min-h-[220px] p-0 shadow-none"
            action={{
              label: "Check Sent Pings",
              onClick: () => navigate("/pings")
            }}
          />
        ) : (
          <ul className="flex flex-col gap-3 flex-grow">
            {pings.map((ping) => {
              const initials = ping.senderId?.name
                ? ping.senderId.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                : '?';
              return (
                <li 
                  key={ping._id} 
                  className="group relative flex flex-col justify-between p-4 border border-border/60 rounded-xl bg-muted/20 transition-all duration-200 hover:bg-muted/40 hover:border-primary/20"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[9px] font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-metadata font-bold text-foreground">
                          {ping.senderId?.name || 'User'}
                        </span>
                      </div>
                      <span className="text-metadata text-muted-foreground select-none">
                        {new Date(ping.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-body-p text-foreground/90 line-clamp-2 leading-relaxed">
                      {ping.question}
                    </p>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild 
                      className="px-2 h-8 text-primary hover:bg-transparent hover:underline font-semibold gap-1"
                    >
                      <Link to="/pings">
                        <span>Respond now</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};


