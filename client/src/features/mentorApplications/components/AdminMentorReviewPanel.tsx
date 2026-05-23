import { useState } from 'react';
import { CheckCircle2, FileWarning, Search, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Skeleton } from '../../../components/ui/skeleton';
import { MentorApprovalBadge } from './MentorApprovalBadge';
import { useAdminMentorApplications, useMentorApplicationReviewActions } from '../hooks/useMentorApplications';
import type { MentorApplication, MentorApplicationStatus } from '../types';

export const AdminMentorReviewPanel = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MentorApplicationStatus | undefined>('pending');
  const [selected, setSelected] = useState<MentorApplication | null>(null);
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const { data, isLoading, isError, refetch } = useAdminMentorApplications({ search, status, limit: 25 });
  const review = useMentorApplicationReviewActions();

  const applications: MentorApplication[] = data?.applications || [];
  const active = selected || applications[0] || null;
  const applicant = active && typeof active.userId !== 'string' ? active.userId : null;

  const submitStatus = (nextStatus: MentorApplicationStatus) => {
    if (!active) return;
    review.mutate({
      id: active._id,
      payload: {
        status: nextStatus,
        rejectionReason: nextStatus === 'rejected' ? reason : undefined,
        changeRequest: nextStatus === 'changes_requested' ? reason : undefined,
        internalNotes: notes,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Mentor Applications</h1>
        <p className="text-sm text-muted-foreground">Review expertise, trust signals, and onboarding readiness before mentor capabilities unlock.</p>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_220px]">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search applicant, domain, company, or skill" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={status || ''}
            onChange={(event) => setStatus((event.target.value || undefined) as MentorApplicationStatus | undefined)}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under review</option>
            <option value="changes_requested">Changes requested</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </CardContent>
      </Card>

      {isError && (
        <Card className="border-destructive/20">
          <CardContent className="flex items-center justify-between p-4">
            <p className="text-sm text-destructive">Unable to load mentor applications.</p>
            <Button variant="outline" onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Review Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading && [1, 2, 3].map((item) => <Skeleton key={item} className="h-20 w-full" />)}
            {!isLoading && applications.length === 0 && <p className="text-sm text-muted-foreground">No applications match this queue.</p>}
            {applications.map((application) => {
              const user = typeof application.userId !== 'string' ? application.userId : null;
              return (
                <button
                  key={application._id}
                  type="button"
                  onClick={() => setSelected(application)}
                  className="w-full rounded-md border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium">{user?.name || 'Applicant'}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                    <MentorApprovalBadge status={application.status} />
                  </div>
                  <div className="mt-2 line-clamp-1 text-xs text-muted-foreground">{application.domains.join(', ')}</div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {!active && <p className="text-sm text-muted-foreground">Select an application to review.</p>}
            {active && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{applicant?.name || 'Applicant'}</h2>
                    <p className="text-sm text-muted-foreground">{active.currentRole || 'Role not provided'}{active.company ? ` at ${active.company}` : ''}</p>
                  </div>
                  <MentorApprovalBadge status={active.status} />
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <Metric label="Experience" value={`${active.experienceYears} yrs`} />
                  <Metric label="Domains" value={active.domains.slice(0, 3).join(', ')} />
                  <Metric label="Availability" value={active.availability?.hoursPerWeek ? `${active.availability.hoursPerWeek} hrs/wk` : 'Provided'} />
                </div>

                <Section title="Professional Bio" body={active.bio} />
                <Section title="Expertise Summary" body={active.expertiseSummary} />
                <Section title="Motivation" body={active.motivation} />

                <div className="grid gap-3 md:grid-cols-2">
                  <LinkField label="LinkedIn" value={active.linkedinUrl} />
                  <LinkField label="GitHub" value={active.githubUrl} />
                  <LinkField label="Portfolio" value={active.portfolioUrl} />
                  <LinkField label="Resume" value={active.resumeUrl} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Internal moderation notes</label>
                  <Textarea rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Private notes for future trust and quality analysis" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Applicant-facing reason or requested changes</label>
                  <Textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Required when rejecting or requesting changes" />
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => submitStatus('under_review')} disabled={review.isPending}>
                    <ShieldCheck className="h-4 w-4" />
                    Review
                  </Button>
                  <Button type="button" variant="outline" onClick={() => submitStatus('changes_requested')} disabled={review.isPending}>
                    <FileWarning className="h-4 w-4" />
                    Request changes
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => submitStatus('rejected')} disabled={review.isPending}>
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button type="button" onClick={() => submitStatus('approved')} disabled={review.isPending}>
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-border bg-muted/30 p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="mt-1 text-sm font-semibold">{value || 'Not provided'}</div>
  </div>
);

const Section = ({ title, body }: { title: string; body?: string }) => (
  <section className="space-y-1">
    <h3 className="text-sm font-semibold">{title}</h3>
    <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{body}</p>
  </section>
);

const LinkField = ({ label, value }: { label: string; value?: string }) => (
  <div className="rounded-md border border-border p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    {value ? (
      <a className="mt-1 block truncate text-sm font-medium text-primary" href={value} target="_blank" rel="noreferrer">{value}</a>
    ) : (
      <div className="mt-1 text-sm text-muted-foreground">Not provided</div>
    )}
  </div>
);
