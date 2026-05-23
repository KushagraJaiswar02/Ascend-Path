import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { useToast } from '../../../components/ui/toast';
import { DomainSelector } from './DomainSelector';
import { ExperienceSelector } from './ExperienceSelector';
import { GoalSelectionCard } from './GoalSelectionCard';
import { RecommendationPreview } from './RecommendationPreview';
import { useSubmitOnboarding } from '../hooks/useOnboarding';
import { goalOptions } from '../options';
import type { ExperienceLevel, OnboardingPayload, PrimaryGoal, RecommendationResponse } from '../types';

const schema = z.object({
  primaryGoal: z.enum(goalOptions as [PrimaryGoal, ...PrimaryGoal[]]),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  interestedDomains: z.array(z.string()).min(1).max(6),
  targetRole: z.string().min(2).max(120),
  preferredLearningStyle: z.enum(['roadmaps', 'mentor_sessions', 'projects', 'forum_discussion', 'mixed']).optional(),
  weeklyCommitmentHours: z.number().int().min(1).max(80).optional(),
});

const storageKey = 'guided-onboarding-draft';

const defaults: OnboardingPayload = {
  primaryGoal: 'land_first_job',
  experienceLevel: 'beginner',
  interestedDomains: [],
  targetRole: '',
  preferredLearningStyle: 'mixed',
  weeklyCommitmentHours: 5,
};

export const OnboardingWizard = () => {
  const [step, setStep] = useState(0);
  const [recommendations, setRecommendations] = useState<RecommendationResponse>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const submitOnboarding = useSubmitOnboarding();
  const initialValues = useMemo(() => {
    const draft = window.localStorage.getItem(storageKey);
    return draft ? JSON.parse(draft) as OnboardingPayload : defaults;
  }, []);
  const [selectedValues, setSelectedValues] = useState<OnboardingPayload>(initialValues);

  const form = useForm<OnboardingPayload>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
    mode: 'onChange',
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(form.getValues()));
    }, 800);
    return () => window.clearInterval(interval);
  }, [form]);

  const progress = Math.round(((step + 1) / 5) * 100);

  const updateValue = <K extends keyof OnboardingPayload>(key: K, value: OnboardingPayload[K]) => {
    setSelectedValues((current) => ({ ...current, [key]: value }));
    form.setValue(key as never, value as never, { shouldDirty: true, shouldValidate: true });
  };

  const submit = form.handleSubmit(async (payload) => {
    try {
      const result = await submitOnboarding.mutateAsync(payload);
      window.localStorage.removeItem(storageKey);
      setRecommendations(result.recommendations);
      setStep(4);
      toast({ type: 'success', title: 'Your path is ready', description: 'Dashboard and recommendations are now personalized.' });
    } catch (error: unknown) {
      const description = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast({ type: 'error', title: 'Onboarding failed', description: description || 'Please review your answers and try again.' });
    }
  });

  return (
    <div className="space-y-4">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{['What are you trying to achieve?', 'What is your current level?', 'Which domains interest you?', 'What role are you targeting?', 'Recommended next steps'][step]}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="min-h-[300px]"
            >
              {step === 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {goalOptions.map((goal) => (
                    <GoalSelectionCard
                      key={goal}
                      goal={goal}
                      selected={selectedValues.primaryGoal === goal}
                      onSelect={(nextGoal) => updateValue('primaryGoal', nextGoal)}
                    />
                  ))}
                </div>
              )}

              {step === 1 && (
                <ExperienceSelector
                  value={selectedValues.experienceLevel as ExperienceLevel}
                  onChange={(level) => updateValue('experienceLevel', level)}
                />
              )}

              {step === 2 && (
                <DomainSelector
                  value={selectedValues.interestedDomains}
                  onChange={(domains) => updateValue('interestedDomains', domains)}
                />
              )}

              {step === 3 && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold">Target role</label>
                    <Input placeholder="Frontend Developer" {...form.register('targetRole')} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Weekly commitment</label>
                    <Input type="number" min={1} max={80} {...form.register('weeklyCommitmentHours', { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Preferred learning style</label>
                    <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('preferredLearningStyle')}>
                      <option value="mixed">Mixed</option>
                      <option value="roadmaps">Roadmaps</option>
                      <option value="mentor_sessions">Mentor sessions</option>
                      <option value="projects">Projects</option>
                      <option value="forum_discussion">Forum discussion</option>
                    </select>
                  </div>
                </div>
              )}

              {step === 4 && <RecommendationPreview recommendations={recommendations} />}
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 min-h-5 text-sm text-destructive">
            {Object.values(form.formState.errors)[0]?.message}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" disabled={step === 0 || step === 4} onClick={() => setStep((value) => value - 1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        {step < 3 && (
          <Button type="button" onClick={() => setStep((value) => value + 1)}>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
        {step === 3 && (
          <Button type="button" onClick={submit} disabled={submitOnboarding.isPending}>
            <CheckCircle2 className="h-4 w-4" />
            Build my path
          </Button>
        )}
        {step === 4 && (
          <Button type="button" onClick={() => navigate('/dashboard')}>
            Go to dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
