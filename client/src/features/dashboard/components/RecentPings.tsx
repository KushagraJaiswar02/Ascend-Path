import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Inbox, ArrowRight } from 'lucide-react';
import { EmptyStateCard } from './EmptyStateCard';

interface RecentPingsProps {
  pings: any[];
}

export const RecentPings: React.FC<RecentPingsProps> = ({ pings }) => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col h-full border border-border bg-card text-card-foreground shadow-subtle overflow-hidden transition-all duration-300 hover:border-border/80 rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-border/40 bg-muted/10 select-none">
        <div className="flex items-center gap-2">
          <CardTitle className="text-card-title font-bold text-foreground">
            Action Required
          </CardTitle>
          {pings.length > 0 && (
            <Badge variant="warning" className="text-[10px] font-extrabold px-2 py-0.5 select-none bg-warning/5 border border-warning/10 text-warning">
              {pings.length} pending
            </Badge>
          )}
        </div>
        <Link 
          to="/pings" 
          className="text-metadata font-bold text-primary hover:underline transition-colors focus-visible:underline"
        >
          View Inbox
        </Link>
      </CardHeader>
      
      <CardContent className="p-5 flex-grow flex flex-col justify-between">
        {pings.length === 0 ? (
          <EmptyStateCard
            icon={Inbox}
            title="All caught up!"
            description="You have no pending messages or pings requiring your immediate reply right now."
            className="border-none bg-transparent min-h-[200px] p-0 shadow-none hover:border-transparent"
            action={{
              label: "Check Sent Pings",
              onClick: () => navigate("/pings")
            }}
          />
        ) : (
          <ul className="flex flex-col gap-3.5 flex-grow">
            {pings.map((ping) => {
              const initials = ping.senderId?.name
                ? ping.senderId.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                : '?';
              return (
                <li 
                  key={ping._id} 
                  className="group relative flex flex-col justify-between p-4 border border-border/60 rounded-2xl bg-muted/10 transition-all duration-250 hover:bg-muted/15 hover:border-primary/10"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between select-none">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-6.5 w-6.5 border border-border">
                          <AvatarFallback className="text-[9px] font-extrabold bg-muted text-muted-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] font-bold text-foreground truncate">
                          {ping.senderId?.name || 'Explorer'}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        {new Date(ping.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-body-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
                      {ping.question}
                    </p>
                  </div>
                  <div className="mt-3.5 flex justify-end select-none">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild 
                      className="px-2.5 h-8 text-[11px] hover:bg-primary/5 hover:text-primary font-bold gap-1 rounded-xl transition-all duration-200 border border-border/40 hover:border-primary/10 bg-card cursor-pointer"
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



