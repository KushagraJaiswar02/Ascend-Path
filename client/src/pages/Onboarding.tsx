import { PageContainer } from '../components/layout/PageContainer';
import { OnboardingWizard } from '../features/onboarding/components/OnboardingWizard';

export const Onboarding = () => {
  return (
    <PageContainer size="default" className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Set Your Direction</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Tell AscendPath what you are trying to achieve so your dashboard, mentors, roadmaps, and community prompts start with momentum.
        </p>
      </div>
      <OnboardingWizard />
    </PageContainer>
  );
};
