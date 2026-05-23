import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  // Log error details for diagnostics
  console.error('Captured Route Error:', error);

  const errorMessage = error?.message || error?.statusText || 'An unexpected runtime error occurred.';

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center p-4 bg-background text-foreground select-none">
      <Card className="max-w-md w-full border-destructive/20 bg-destructive/[2%] shadow-elevated relative overflow-hidden group rounded-2xl">
        {/* Subtle warning color top bar */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-destructive/40 group-hover:bg-destructive/80 transition-colors duration-300" />
        
        <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center gap-6 mt-[3px]">
          {/* Animated/pulsating warning icon */}
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shadow-subtle shrink-0">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-section-title font-bold text-foreground tracking-tight">
              Section Loading Error
            </h3>
            <p className="text-metadata text-muted-foreground leading-relaxed max-w-sm">
              We encountered a problem rendering this page. This could be due to network fluctuations or temporary data synchronisation issues.
            </p>
          </div>

          {/* Collapsible/diagnostic details in fine print */}
          <div className="w-full text-left bg-muted/30 border border-border/40 rounded-xl p-3 select-text max-h-[100px] overflow-y-auto">
            <code className="text-[11px] text-muted-foreground font-mono break-all leading-normal">
              {errorMessage}
            </code>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full mt-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full gap-2 font-bold h-10 text-xs"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry Page</span>
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => {
                // Safely clear route error and navigate to landing or dashboard
                navigate('/dashboard');
                window.location.reload(); // Hard reload to clear dirty client state if any
              }}
              className="w-full gap-2 font-semibold h-10 text-xs bg-card hover:bg-muted border-border"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
