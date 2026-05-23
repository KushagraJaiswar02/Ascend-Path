import React, { useState } from 'react';
import { useCreateSession } from '../hooks/useCreateSession';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export const CreateSessionForm: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(0);
  const [fieldError, setFieldError] = useState('');

  const createMutation = useCreateSession();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError('');

    createMutation.mutate(
      {
        title: topic,
        topic,
        description,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: duration,
        price,
      },
      {
        onSuccess: () => {
          toast({
            type: 'success',
            title: 'Session slot created',
            description: `"${topic}" is now open for bookings.`,
          });
          setTopic('');
          setDescription('');
          setScheduledAt('');
          setDuration(30);
          setPrice(0);
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
        <CardTitle>Create a Session Slot</CardTitle>
        <CardDescription>
          Open a new mentorship slot for explorers to discover and book.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-md">
        {fieldError && (
          <div className="mb-md text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-md px-3 py-2.5">
            {fieldError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-md">
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
              placeholder="e.g. React Architecture Review"
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
              placeholder="What will you cover in this session?"
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
          </div>

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
              'Create Open Slot'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
