import { PageContainer } from '../components/layout/PageContainer';
import { MentorApplicationStatusCard } from '../features/mentorApplications/components/MentorApplicationStatusCard';
import { MentorApplicationWizard } from '../features/mentorApplications/components/MentorApplicationWizard';
import { useMyMentorApplication } from '../features/mentorApplications/hooks/useMentorApplications';

export const MentorApplication = () => {
  const { data, isLoading } = useMyMentorApplication();
  const canEdit = !data || data.status === 'changes_requested' || data.status === 'rejected';

  return (
    <PageContainer size="default" className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Mentor Application</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Apply for a reviewed mentor profile. Approval unlocks discovery, public mentor profile capabilities, sessions, and roadmap ownership.
        </p>
      </div>
      <MentorApplicationStatusCard application={data} isLoading={isLoading} />
      {canEdit && <MentorApplicationWizard application={data} />}
    </PageContainer>
  );
};
