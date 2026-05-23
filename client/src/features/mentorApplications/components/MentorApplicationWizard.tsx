import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, Save, Send } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { useToast } from '../../../components/ui/toast';
import { MentorApplicationProgress } from './MentorApplicationProgress';
import { useSubmitMentorApplication, useUpdateMentorApplication } from '../hooks/useMentorApplications';
import type { MentorApplication, MentorApplicationPayload } from '../types';

const csvToArray = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
const arrayToCsv = (value?: string[]) => value?.join(', ') || '';

const applicationSchema = z.object({
  bio: z.string().min(80, 'Bio must be at least 80 characters'),
  domains: z.string().min(2, 'Add at least one domain'),
  skills: z.string().min(8, 'Add at least three skills'),
  experienceYears: z.number().int().min(0).max(60),
  currentRole: z.string().optional(),
  company: z.string().optional(),
  linkedinUrl: z.string().url('Enter a valid LinkedIn URL').or(z.literal('')).optional(),
  githubUrl: z.string().url('Enter a valid GitHub URL').or(z.literal('')).optional(),
  portfolioUrl: z.string().url('Enter a valid portfolio URL').or(z.literal('')).optional(),
  resumeUrl: z.string().url('Enter a valid resume URL').or(z.literal('')).optional(),
  motivation: z.string().min(80, 'Motivation must be at least 80 characters'),
  expertiseSummary: z.string().min(80, 'Expertise summary must be at least 80 characters'),
  availabilityText: z.string().min(10, 'Describe your availability'),
  hoursPerWeek: z.number().int().min(1).max(80).optional(),
  timezone: z.string().optional(),
});

type FormValues = z.infer<typeof applicationSchema>;

const storageKey = 'mentor-application-draft';

const defaultValues: FormValues = {
  bio: '',
  domains: '',
  skills: '',
  experienceYears: 0,
  currentRole: '',
  company: '',
  linkedinUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  resumeUrl: '',
  motivation: '',
  expertiseSummary: '',
  availabilityText: '',
  hoursPerWeek: 4,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
};

const toPayload = (values: FormValues): MentorApplicationPayload => ({
  bio: values.bio,
  domains: csvToArray(values.domains),
  skills: csvToArray(values.skills),
  experienceYears: values.experienceYears,
  currentRole: values.currentRole || undefined,
  company: values.company || undefined,
  linkedinUrl: values.linkedinUrl || undefined,
  githubUrl: values.githubUrl || undefined,
  portfolioUrl: values.portfolioUrl || undefined,
  resumeUrl: values.resumeUrl || undefined,
  motivation: values.motivation,
  expertiseSummary: values.expertiseSummary,
  availability: {
    text: values.availabilityText,
    hoursPerWeek: values.hoursPerWeek,
    timezone: values.timezone || undefined,
    schedule: [],
  },
});

const fromApplication = (application?: MentorApplication | null): FormValues => {
  if (!application) return defaultValues;
  return {
    bio: application.bio || '',
    domains: arrayToCsv(application.domains),
    skills: arrayToCsv(application.skills),
    experienceYears: application.experienceYears || 0,
    currentRole: application.currentRole || '',
    company: application.company || '',
    linkedinUrl: application.linkedinUrl || '',
    githubUrl: application.githubUrl || '',
    portfolioUrl: application.portfolioUrl || '',
    resumeUrl: application.resumeUrl || '',
    motivation: application.motivation || '',
    expertiseSummary: application.expertiseSummary || '',
    availabilityText: application.availability?.text || '',
    hoursPerWeek: application.availability?.hoursPerWeek || 4,
    timezone: application.availability?.timezone || defaultValues.timezone,
  };
};

export const MentorApplicationWizard = ({ application }: { application?: MentorApplication | null }) => {
  const [step, setStep] = useState(0);
  const { toast } = useToast();
  const submitApplication = useSubmitMentorApplication();
  const updateApplication = useUpdateMentorApplication();
  const initialValues = useMemo(() => {
    const draft = window.localStorage.getItem(storageKey);
    return draft ? JSON.parse(draft) as FormValues : fromApplication(application);
  }, [application]);

  const form = useForm<FormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: initialValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    const handle = window.setInterval(() => {
      window.localStorage.setItem(storageKey, JSON.stringify(form.getValues()));
    }, 1000);
    return () => window.clearInterval(handle);
  }, [form]);

  const onSubmit = form.handleSubmit(async (formValues) => {
    const payload = toPayload(formValues);
    if (payload.skills.length < 3) {
      form.setError('skills', { message: 'Add at least three comma-separated skills' });
      return;
    }

    try {
      if (application && ['changes_requested', 'rejected'].includes(application.status)) {
        await updateApplication.mutateAsync(payload);
      } else {
        await submitApplication.mutateAsync(payload);
      }
      window.localStorage.removeItem(storageKey);
      toast({ type: 'success', title: 'Application submitted', description: 'Your mentor application is now ready for review.' });
    } catch (error: unknown) {
      const description = error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
        : undefined;
      toast({ type: 'error', title: 'Submission failed', description: description || 'Please check the form and try again.' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <MentorApplicationProgress currentStep={step} />

      <Card>
        <CardHeader>
          <CardTitle>{['Professional profile', 'Expertise', 'Trust signals', 'Availability'][step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <>
              <Textarea rows={7} placeholder="Professional bio" {...form.register('bio')} />
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="Current role" {...form.register('currentRole')} />
                <Input placeholder="Company" {...form.register('company')} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Input placeholder="Domains, comma separated" {...form.register('domains')} />
              <Input placeholder="Skills, comma separated" {...form.register('skills')} />
              <Input type="number" min={0} max={60} placeholder="Years of experience" {...form.register('experienceYears', { valueAsNumber: true })} />
              <Textarea rows={6} placeholder="Expertise summary" {...form.register('expertiseSummary')} />
            </>
          )}

          {step === 2 && (
            <>
              <Input placeholder="LinkedIn URL" {...form.register('linkedinUrl')} />
              <Input placeholder="GitHub URL" {...form.register('githubUrl')} />
              <Input placeholder="Portfolio URL" {...form.register('portfolioUrl')} />
              <Input placeholder="Resume URL or signed upload URL" {...form.register('resumeUrl')} />
              <Textarea rows={6} placeholder="Why do you want to mentor on AscendPath?" {...form.register('motivation')} />
            </>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <Textarea rows={5} placeholder="Availability and preferred mentoring format" {...form.register('availabilityText')} />
              <div className="grid gap-3 md:grid-cols-2">
                <Input type="number" min={1} max={80} placeholder="Hours per week" {...form.register('hoursPerWeek', { valueAsNumber: true })} />
                <Input placeholder="Timezone" {...form.register('timezone')} />
              </div>
            </div>
          )}

          <div className="min-h-5 text-sm text-destructive">
            {Object.values(form.formState.errors)[0]?.message}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => window.localStorage.setItem(storageKey, JSON.stringify(form.getValues()))}>
            <Save className="h-4 w-4" />
            Save draft
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={() => setStep((value) => value + 1)}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={submitApplication.isPending || updateApplication.isPending}>
              <Send className="h-4 w-4" />
              Submit
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};
