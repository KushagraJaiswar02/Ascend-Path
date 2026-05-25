import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { useAuthStore } from '@/store/useAuthStore';
import { useTaxonomyExplorer } from '../../taxonomy/hooks/useTaxonomy';
import { useSubmitOnboarding } from '../hooks/useOnboarding';
import type { OnboardingPayload } from '../types';
import { ConversationalQuestionStep } from './ConversationalQuestionStep';
import { OnboardingExperienceShell } from './OnboardingExperienceShell';
import { PersonalizationGenerationScreen } from './PersonalizationGenerationScreen';

const defaults: OnboardingPayload = {
  careerStage: 'college_student',
  careerGoals: [],
  interestedDomains: [],
  careerDomains: [],
  targetRole: '',
  preferredLearningStyle: 'mixed',
  mentorshipPreference: 'occasional_checkins',
  directionClarity: 'exploring',
  weeklyCommitment: '4_7_hours',
  budgetRange: 'flexible',
  preferredLanguages: ['English'],
};

const stages = [
  { value: 'school_student', label: 'School student', description: 'I am still exploring subjects and broad possibilities.' },
  { value: 'college_student', label: 'College student', description: 'I want direction, projects, internships, or exam clarity.' },
  { value: 'graduate', label: 'Graduate', description: 'I am looking for a strong next step after graduation.' },
  { value: 'working_professional', label: 'Working professional', description: 'I want to grow, specialize, or move forward at work.' },
  { value: 'career_switcher', label: 'Career switcher', description: 'I am considering a new direction and need a bridge.' },
  { value: 'exam_aspirant', label: 'Exam aspirant', description: 'I am preparing for a competitive or professional exam.' },
  { value: 'freelancer', label: 'Freelancer', description: 'I want independent projects, clients, and portfolio growth.' },
  { value: 'vocational_learner', label: 'Vocational learner', description: 'I want practical skills connected to employable work.' },
];

const goalOptions = [
  { value: 'get_internship', label: 'Get an internship', description: 'Find a practical path toward early experience.' },
  { value: 'crack_exam', label: 'Crack an exam', description: 'Make preparation more structured and realistic.' },
  { value: 'switch_career', label: 'Switch careers', description: 'Build a transition plan without guesswork.' },
  { value: 'freelancing', label: 'Start freelancing', description: 'Turn skills into paid work gradually.' },
  { value: 'build_portfolio', label: 'Build a portfolio', description: 'Create proof of ability with guided projects.' },
  { value: 'improve_confidence', label: 'Improve confidence', description: 'Get clarity, mentoring, and smaller next steps.' },
  { value: 'explore_options', label: 'Explore options', description: 'Keep the path open while learning what fits.' },
];

const fallbackDomainOptions = [
  { value: 'fallback_software_development', label: 'Software development', description: 'Apps, websites, backend systems, and engineering foundations.' },
  { value: 'fallback_data_ai', label: 'Data, AI, and machine learning', description: 'Analytics, models, automation, and intelligent products.' },
  { value: 'fallback_cybersecurity', label: 'Cybersecurity', description: 'Security analysis, ethical hacking, risk, and defense.' },
  { value: 'fallback_cloud_devops', label: 'Cloud and DevOps', description: 'Cloud platforms, deployment, infrastructure, and reliability.' },
  { value: 'fallback_ui_ux_design', label: 'UI/UX and product design', description: 'Research, interfaces, product thinking, and user experience.' },
  { value: 'fallback_product_management', label: 'Product management', description: 'Strategy, roadmaps, execution, and customer problem solving.' },
  { value: 'fallback_digital_marketing', label: 'Digital marketing', description: 'SEO, content, paid growth, analytics, and brand building.' },
  { value: 'fallback_business_finance', label: 'Business and finance', description: 'Finance, consulting, operations, markets, and business analysis.' },
  { value: 'fallback_entrepreneurship', label: 'Entrepreneurship', description: 'Startups, freelancing, validation, sales, and business models.' },
  { value: 'fallback_healthcare', label: 'Healthcare and medicine', description: 'Medical careers, allied health, public health, and care systems.' },
  { value: 'fallback_law_policy', label: 'Law, policy, and governance', description: 'Legal careers, civil services, public policy, and administration.' },
  { value: 'fallback_education', label: 'Education and teaching', description: 'Teaching, tutoring, learning design, and academic careers.' },
  { value: 'fallback_creative_media', label: 'Creative media', description: 'Writing, video, animation, design, music, and storytelling.' },
  { value: 'fallback_core_engineering', label: 'Core engineering', description: 'Mechanical, electrical, civil, manufacturing, and applied engineering.' },
  { value: 'fallback_research_academia', label: 'Research and academia', description: 'Higher studies, research projects, papers, and academic pathways.' },
  { value: 'fallback_government_exams', label: 'Government and exams', description: 'UPSC, SSC, banking, railways, defense, and state exams.' },
  { value: 'fallback_sports_fitness', label: 'Sports and fitness', description: 'Coaching, athletics, wellness, training, and performance careers.' },
  { value: 'fallback_hospitality_tourism', label: 'Hospitality and tourism', description: 'Travel, hotels, guest experience, events, and service careers.' },
];

const isObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

const compactOptionalText = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const CareerDirectionWizard = () => {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<OnboardingPayload>(defaults);
  const [isGenerating, setIsGenerating] = useState(false);
  const taxonomy = useTaxonomyExplorer();
  const submitOnboarding = useSubmitOnboarding();
  const updateUser = useAuthStore((state) => state.updateUser);
  const navigate = useNavigate();
  const { toast } = useToast();

  const domainOptions = useMemo(() => {
    const taxonomyOptions = taxonomy.data?.clusters.flatMap((cluster) =>
      (cluster.domains || []).map((domain) => ({
        value: domain.id,
        label: domain.name,
        description: cluster.name,
      }))
    ) || [];

    const seen = new Set<string>();
    return [...taxonomyOptions, ...fallbackDomainOptions].filter((option) => {
      const key = option.label.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [taxonomy.data]);

  const canContinue = [
    true,
    Boolean(values.careerStage),
    values.careerDomains.length > 0,
    values.careerGoals.length > 0,
    Boolean(values.weeklyCommitment && values.budgetRange && values.preferredLanguages.length),
    Boolean(values.directionClarity),
  ][step];

  const setValue = <K extends keyof OnboardingPayload>(key: K, value: OnboardingPayload[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const submit = async () => {
    try {
      setIsGenerating(true);
      const selectedDomains = taxonomy.data?.clusters
        .flatMap((cluster) => cluster.domains || [])
        .filter((domain) => values.careerDomains.includes(domain.id))
        .map((domain) => domain.name) || [];
      const fallbackDomains = fallbackDomainOptions
        .filter((domain) => values.careerDomains.includes(domain.value))
        .map((domain) => domain.label);
      const result = await submitOnboarding.mutateAsync({
        ...values,
        primaryGoal: values.careerGoals[0],
        careerGoals: [],
        careerDomains: values.careerDomains.filter(isObjectId),
        interestedDomains: [...selectedDomains, ...fallbackDomains],
        targetRole: compactOptionalText(values.targetRole),
      });
      updateUser(result.user as any);
      window.setTimeout(() => navigate('/dashboard'), 1600);
    } catch (error: any) {
      setIsGenerating(false);
      toast({ type: 'error', title: 'Onboarding failed', description: error.response?.data?.error || 'Please review your answers and try again.' });
    }
  };

  if (isGenerating) return <PersonalizationGenerationScreen />;

  return (
    <OnboardingExperienceShell
      step={step}
      totalSteps={6}
      canContinue={Boolean(canContinue)}
      isSubmitting={submitOnboarding.isPending}
      onBack={() => setStep((current) => Math.max(0, current - 1))}
      onNext={() => (step === 5 ? submit() : setStep((current) => current + 1))}
    >
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.2 }}>
          {step === 0 && (
            <ConversationalQuestionStep
              eyebrow="Welcome"
              title="Let's shape your direction."
              description="We will start lightly: understand where you are, what you are curious about, and then build a first dashboard with roadmaps, mentors, opportunities, and guidance in the right order."
            />
          )}
          {step === 1 && (
            <ConversationalQuestionStep eyebrow="Career stage" title="Where are you right now?" description="This helps AscendPath choose the right amount of structure and avoid showing advanced systems too early." options={stages} value={values.careerStage} onChange={(value) => setValue('careerStage', value as OnboardingPayload['careerStage'])} />
          )}
          {step === 2 && (
            <ConversationalQuestionStep eyebrow="Interest exploration" title="Which areas feel worth exploring?" description="Choose more than one if you are unsure. Exploration is allowed here." options={domainOptions} value={values.careerDomains} multi onChange={(value) => setValue('careerDomains', value as string[])} />
          )}
          {step === 3 && (
            <ConversationalQuestionStep eyebrow="Goal mapping" title="What would make the next few months meaningful?" description="Your goals shape the starter roadmap, mentor suggestions, opportunities, and dashboard hierarchy." options={goalOptions} value={values.careerGoals} multi onChange={(value) => setValue('careerGoals', value as string[])} />
          )}
          {step === 4 && (
            <ConversationalQuestionStep
              eyebrow="Support style"
              title="What kind of pace and support fits your life?"
              description="These are constraints, not judgments. They help the platform suggest realistic next actions."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={values.weeklyCommitment} onChange={(event) => setValue('weeklyCommitment', event.target.value as any)}>
                  <option value="0_3_hours">0-3 hours weekly</option>
                  <option value="4_7_hours">4-7 hours weekly</option>
                  <option value="8_15_hours">8-15 hours weekly</option>
                  <option value="16_plus_hours">16+ hours weekly</option>
                </select>
                <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={values.budgetRange} onChange={(event) => setValue('budgetRange', event.target.value as any)}>
                  <option value="free_only">Free only</option>
                  <option value="low_cost">Low cost</option>
                  <option value="moderate">Moderate</option>
                  <option value="premium">Premium</option>
                  <option value="flexible">Flexible</option>
                </select>
                <select className="h-11 rounded-md border border-input bg-background px-3 text-sm" value={values.mentorshipPreference} onChange={(event) => setValue('mentorshipPreference', event.target.value as any)}>
                  <option value="mentor_guided">Mentor-guided</option>
                  <option value="occasional_checkins">Occasional check-ins</option>
                  <option value="peer_community">Peer community</option>
                  <option value="self_paced">Mostly self-paced</option>
                </select>
                <Input value={values.preferredLanguages.join(', ')} onChange={(event) => setValue('preferredLanguages', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} placeholder="English, Hindi" />
              </div>
            </ConversationalQuestionStep>
          )}
          {step === 5 && (
            <ConversationalQuestionStep
              eyebrow="Clarity"
              title="How clear do you currently feel about your direction?"
              description="This controls dashboard complexity. If things feel unclear, AscendPath will stay simpler and more guided."
              options={[
                { value: 'unsure', label: 'Completely unsure', description: 'I need gentle exploration and very small next steps.' },
                { value: 'exploring', label: 'Exploring', description: 'I have interests, but I am not ready to specialize.' },
                { value: 'somewhat_clear', label: 'Somewhat clear', description: 'I know the general direction and want structure.' },
                { value: 'highly_focused', label: 'Highly focused', description: 'I know what I want and can handle deeper tools.' },
              ]}
              value={values.directionClarity}
              onChange={(value) => setValue('directionClarity', value as any)}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </OnboardingExperienceShell>
  );
};
