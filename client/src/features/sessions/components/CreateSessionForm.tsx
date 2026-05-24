import React, { useState } from 'react';
import { useCreateSession } from '../hooks/useCreateSession';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { SessionTypeSelector, type SessionTypeChoice } from './SessionTypeSelector';

export const CreateSessionForm: React.FC = () => {
  const [sessionType, setSessionType] = useState<SessionTypeChoice>('private_mentorship');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(0);
  const [capacity, setCapacity] = useState(50);
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [sessionCategory, setSessionCategory] = useState<'workshop' | 'ama' | 'roadmap_walkthrough' | 'study_event' | 'community_teaching'>('workshop');
  const [domainsInput, setDomainsInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [fieldError, setFieldError] = useState('');

  const createMutation = useCreateSession();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError('');

    createMutation.mutate(
      {
        sessionType,
        title: topic,
        topic,
        description,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: duration,
        price: sessionType === 'public_workshop' ? 0 : price,
        ...(sessionType === 'public_workshop' && {
          capacity,
          difficulty,
          sessionCategory,
          domains: domainsInput.split(',').map((domain) => domain.trim()).filter(Boolean),
          tags: tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean),
          bannerImage: bannerImage.trim() || undefined,
          registrationMode: 'open' as const,
        }),
      },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            title: sessionType === 'public_workshop' ? 'Workshop published' : 'Session slot created',
            description: sessionType === 'public_workshop'
              ? `"${topic}" is open for community registration.`
              : `"${topic}" is now open for bookings.`,
          });
          setTopic('');
          setDescription('');
          setScheduledAt('');
          setDuration(30);
          setPrice(0);
          setCapacity(50);
          setDifficulty('beginner');
          setSessionCategory('workshop');
          setDomainsInput('');
          setTagsInput('');
          setBannerImage('');
        },
        onError: (error: any) => {
          const msg =
            error?.response?.data?.errors
              ?.map((err: any) => err.message)
              .join(', ') ||
            error?.response?.data?.error ||
            'Failed to create session slot.';
          setFieldError(msg);
          toast({
            type: 'error',
            title: 'Could not create slot',
            description: msg,
          });
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>Create a Session</CardTitle>
        <CardDescription>
          Publish private mentorship availability or a community workshop from the same scheduling system.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-md">
        {fieldError && (
          <div className="mb-md text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-md px-3 py-2.5">
            {fieldError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md">
          <SessionTypeSelector value={sessionType} onChange={setSessionType} />

          {/* Topic */}
          <div className="space-y-xs">
            <label
              htmlFor="session-topic"
              className="text-body-sm font-semibold text-foreground"
            >
              Topic
            </label>
            <Input
              id="session-topic"
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={sessionType === 'public_workshop' ? 'e.g. Backend Roadmap Walkthrough' : 'e.g. React Architecture Review'}
            />
          </div>

          {/* Description */}
          <div className="space-y-xs">
            <label
              htmlFor="session-description"
              className="text-body-sm font-semibold text-foreground"
            >
              Description
            </label>
            <Textarea
              id="session-description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder={sessionType === 'public_workshop' ? 'What will attendees learn or build together?' : 'What will you cover in this session?'}
            />
          </div>

          {/* Date / Duration / Price row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm">
            <div className="space-y-xs">
              <label
                htmlFor="session-datetime"
                className="text-body-sm font-semibold text-foreground"
              >
                Date &amp; Time
              </label>
              <Input
                id="session-datetime"
                type="datetime-local"
                required
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>

            <div className="space-y-xs">
              <label
                htmlFor="session-duration"
                className="text-body-sm font-semibold text-foreground"
              >
                Duration
              </label>
              <select
                id="session-duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value={15}>15 mins</option>
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins</option>
              </select>
            </div>

            {sessionType === 'private_mentorship' && (
              <div className="space-y-xs">
              <label
                htmlFor="session-price"
                className="text-body-sm font-semibold text-foreground"
              >
                Price (USD)
              </label>
              <Input
                id="session-price"
                type="number"
                min={0}
                step={1}
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="0 for free"
              />
              </div>
            )}
            {sessionType === 'public_workshop' && (
              <div className="space-y-xs">
                <label htmlFor="session-capacity" className="text-body-sm font-semibold text-foreground">
                  Capacity
                </label>
                <Input
                  id="session-capacity"
                  type="number"
                  min={1}
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          {sessionType === 'public_workshop' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
              <div className="space-y-xs">
                <label htmlFor="session-difficulty" className="text-body-sm font-semibold text-foreground">
                  Difficulty
                </label>
                <select
                  id="session-difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-xs">
                <label htmlFor="session-category" className="text-body-sm font-semibold text-foreground">
                  Event category
                </label>
                <select
                  id="session-category"
                  value={sessionCategory}
                  onChange={(e) => setSessionCategory(e.target.value as typeof sessionCategory)}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="workshop">Workshop</option>
                  <option value="ama">AMA</option>
                  <option value="roadmap_walkthrough">Roadmap walkthrough</option>
                  <option value="study_event">Study event</option>
                  <option value="community_teaching">Community teaching</option>
                </select>
              </div>
              <div className="space-y-xs">
                <label htmlFor="session-domains" className="text-body-sm font-semibold text-foreground">
                  Domains
                </label>
                <Input
                  id="session-domains"
                  value={domainsInput}
                  onChange={(e) => setDomainsInput(e.target.value)}
                  placeholder="Frontend, DevOps, Data"
                />
              </div>
              <div className="space-y-xs">
                <label htmlFor="session-tags" className="text-body-sm font-semibold text-foreground">
                  Tags
                </label>
                <Input
                  id="session-tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="portfolio, roadmap, interview"
                />
              </div>
              <div className="space-y-xs sm:col-span-2">
                <label htmlFor="session-banner" className="text-body-sm font-semibold text-foreground">
                  Banner image URL
                </label>
                <Input
                  id="session-banner"
                  type="url"
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-xs"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Creating…
              </>
            ) : (
              sessionType === 'public_workshop' ? 'Publish Workshop' : 'Create Open Slot'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
