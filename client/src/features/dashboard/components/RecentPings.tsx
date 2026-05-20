import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Inbox, ArrowRight } from 'lucide-react';

interface RecentPingsProps {
  pings: any[];
}

export const RecentPings: React.FC<RecentPingsProps> = ({ pings }) => {
  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground shadow-subtle overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-md border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-xs">
          <CardTitle className="text-body-lg font-bold text-foreground">
            Action Required
          </CardTitle>
          {pings.length > 0 && (
            <Badge variant="warning" className="text-muted-xs font-semibold px-2 py-0.5">
              {pings.length} pending
            </Badge>
          )}
        </div>
        <Link 
          to="/pings" 
          className="text-body-sm font-semibold text-primary hover:text-primary/80 transition-colors focus-visible:underline"
        >
          View Inbox
        </Link>
      </CardHeader>
      <CardContent className="p-md sm:p-lg flex-grow flex flex-col justify-between">
        {pings.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-xl">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-md">
              <Inbox className="h-5 w-5" />
            </div>
            <h3 className="text-body-md font-bold text-foreground mb-xs">All caught up!</h3>
            <p className="text-muted-xs text-muted-foreground max-w-[240px] mb-md leading-normal">
              You have no pending pings that require your response right now.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/pings">Check Sent Pings</Link>
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-md flex-grow">
            {pings.map((ping) => {
              const initials = ping.senderId?.name
                ? ping.senderId.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)
                : '?';
              return (
                <li 
                  key={ping._id} 
                  className="group relative flex flex-col justify-between p-md border border-border/50 rounded-lg bg-muted/30 transition-all duration-200 hover:bg-muted/50"
                >
                  <div>
                    <div className="flex items-center justify-between mb-sm">
                      <div className="flex items-center gap-sm">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-body-sm font-bold text-foreground">
                          {ping.senderId?.name || 'User'}
                        </span>
                      </div>
                      <span className="text-muted-xs text-muted-foreground">
                        {new Date(ping.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-muted-sm text-foreground line-clamp-2 leading-relaxed">
                      {ping.question}
                    </p>
                  </div>
                  <div className="mt-md flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild 
                      className="px-sm h-8 text-primary hover:bg-muted font-semibold gap-xs"
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

