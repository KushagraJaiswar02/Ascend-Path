import { PageContainer } from '../components/layout/PageContainer';
import { CareerDirectionWizard } from '../features/onboarding/components/CareerDirectionWizard';

export const Onboarding = () => {
  return (
    <PageContainer size="default">
      <CareerDirectionWizard />
    </PageContainer>
  );
};
