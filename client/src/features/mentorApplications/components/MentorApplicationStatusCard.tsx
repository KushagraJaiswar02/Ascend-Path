import { Link } from 'react-router-dom';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { MentorApprovalBadge } from './MentorApprovalBadge';
import type { MentorApplication } from '../types';

export const MentorApplicationStatusCard = ({
  application,
  isLoading,
}: {
  application?: MentorApplication | null;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-9 w-36" />
        </CardContent>
      </Card>
    );
  }

  if (!application) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">Become a mentor</h3>
            <p className="text-sm text-muted-foreground">Apply for review to unlock mentor discovery, sessions, and roadmap ownership.</p>
          </div>
          <Button asChild>
            <Link to="/mentor/apply">
              Apply
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const editable = application.status === 'changes_requested' || application.status === 'rejected';

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">Mentor application</h3>
            <MentorApprovalBadge status={application.status} />
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {application.status === 'approved'
              ? 'Your mentor profile is live and eligible for discovery.'
              : application.changeRequest || application.rejectionReason || 'Your application is being processed by the moderation team.'}
          </p>
        </div>
        {editable && (
          <Button variant="outline" asChild>
            <Link to="/mentor/apply">
              <RefreshCw className="h-4 w-4" />
              Update
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
