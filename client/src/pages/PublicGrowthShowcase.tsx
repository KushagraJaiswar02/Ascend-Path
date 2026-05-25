import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  usePublicProfileByUsername,
  usePortfolioProjects,
  useAchievements,
  useEndorsements,
} from '../features/credibility/hooks/useCredibility';
import { PortfolioGrid } from '../features/credibility/components/PortfolioGrid';
import { AchievementTimeline } from '../features/credibility/components/AchievementTimeline';
import { EndorsementCard } from '../features/credibility/components/EndorsementCard';
import { CredibilityBadges } from '../features/credibility/components/CredibilityBadges';
import { MentorTrustPanel } from '../features/credibility/components/MentorTrustPanel';
import { VerifiedMilestoneStrip } from '../features/credibility/components/VerifiedMilestoneStrip';
import { ProfessionalProfile } from '../features/credibility/components/ProfessionalProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Globe,
  GitBranch,
  Network,
  ExternalLink,
  Briefcase,
  ArrowLeft,
  AlertCircle,
  Edit3,
} from 'lucide-react';

export const PublicGrowthShowcase: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: authUser } = useAuthStore();
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = usePublicProfileByUsername(username || '');

  const { data: projects = [], isLoading: projectsLoading } = usePortfolioProjects(profile?._id || '');
  const { data: achievements = [], isLoading: achievementsLoading } = useAchievements(profile?._id || '');
  const { data: endorsements = [], isLoading: endorsementsLoading } = useEndorsements(profile?._id || '');

  const isOwner = authUser?._id === profile?._id;
  const isLoading = profileLoading || projectsLoading || achievementsLoading || endorsementsLoading;

  if (profileError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <h1 className="text-xl font-black text-foreground mb-2">Profile Not Found</h1>
          <p className="text-sm text-muted-foreground mb-6">
            The profile <strong>@{username}</strong> doesn&apos;t exist or is not publicly visible.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to AscendPath
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero skeleton */}
        <div className="h-48 bg-gradient-to-b from-primary/10 to-background" />
        <div className="max-w-4xl mx-auto px-6 -mt-16 space-y-6 pb-16">
          <div className="flex items-end gap-4">
            <Skeleton className="h-24 w-24 rounded-3xl border-4 border-background" />
            <div className="flex-1 pb-2 space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const isMentor = ['guide', 'admin', 'super_admin'].includes(profile.role);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <div className="-mt-16 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="h-28 w-28 rounded-3xl border-4 border-background bg-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xl">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-primary">{profile.name?.[0]?.toUpperCase()}</span>
              )}
            </div>

            {/* Name & Identity */}
            <div className="flex-1 pt-2 sm:pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-foreground">{profile.name}</h1>
                {profile.username && (
                  <span className="text-sm font-bold text-muted-foreground">@{profile.username}</span>
                )}
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary">
                  {profile.role === 'guide' ? 'Mentor' : profile.role}
                </span>
              </div>

              {profile.headline && (
                <p className="text-sm font-semibold text-foreground/80 mb-1">{profile.headline}</p>
              )}

              {profile.specialization && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Briefcase className="h-3 w-3" /> {profile.specialization}
                </p>
              )}
            </div>

            {/* Social Links & Edit */}
            <div className="flex flex-wrap items-center gap-2 sm:pb-2">
              {isOwner && (
                <Button
                  onClick={() => setProfileEditorOpen(true)}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-bold gap-1 rounded-xl border-border/70 hover:bg-muted cursor-pointer shrink-0"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </Button>
              )}
              {profile.socialLinks?.github && (
                <a
                  href={profile.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <GitBranch className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
              {profile.socialLinks?.linkedin && (
                <a
                  href={profile.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <Network className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
              {profile.socialLinks?.website && (
                <a
                  href={profile.socialLinks.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-xl bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl">{profile.bio}</p>
          )}

          {/* Portfolio Links */}
          {profile.portfolioLinks && profile.portfolioLinks.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.portfolioLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Milestone Strip */}
        {achievements.length > 0 && (
          <div className="mb-6">
            <VerifiedMilestoneStrip achievements={achievements} />
          </div>
        )}

        {/* Credibility Badges */}
        <div className="mb-6">
          <CredibilityBadges
            achievements={achievements}
            projects={projects}
            endorsements={endorsements}
            totalSessions={profile.totalSessions}
            averageRating={profile.averageRating}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-16">
          {/* Left: Mentor Trust + Skills */}
          <div className="lg:col-span-1 space-y-4">
            {isMentor && profile.mentorProfile && (
              <MentorTrustPanel
                mentorProfile={profile.mentorProfile}
                totalSessions={profile.totalSessions}
                averageRating={profile.averageRating}
              />
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill.name}
                      className="text-xs font-bold px-2.5 py-1 bg-muted/60 border border-border/60 rounded-lg text-foreground"
                    >
                      {skill.name}
                      {skill.level && (
                        <span className="ml-1 text-muted-foreground font-normal">· {skill.level}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Domains */}
            {profile.domains && profile.domains.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Domains</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.domains.map((domain) => (
                    <span
                      key={domain}
                      className="text-xs font-bold px-2.5 py-1 bg-primary/10 border border-primary/25 rounded-lg text-primary/80"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Tabbed Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="w-full bg-muted/40 p-1 border border-border/60 rounded-xl mb-6">
                <TabsTrigger value="portfolio" className="flex-1 text-xs font-bold uppercase tracking-wider">
                  Portfolio ({projects.length})
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex-1 text-xs font-bold uppercase tracking-wider">
                  Credentials ({achievements.length})
                </TabsTrigger>
                <TabsTrigger value="endorsements" className="flex-1 text-xs font-bold uppercase tracking-wider">
                  Endorsements ({endorsements.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="focus-visible:outline-none">
                <PortfolioGrid projects={projects} isOwner={isOwner} />
              </TabsContent>

              <TabsContent value="achievements" className="focus-visible:outline-none">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <AchievementTimeline achievements={achievements} />
                </div>
              </TabsContent>

              <TabsContent value="endorsements" className="focus-visible:outline-none space-y-4">
                {endorsements.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/40 rounded-2xl">
                    <p className="text-sm font-bold text-foreground mb-1">No Endorsements Yet</p>
                    <p className="text-xs text-muted-foreground">
                      Mentor endorsements will appear here as they&apos;re issued.
                    </p>
                  </div>
                ) : (
                  endorsements.map((e) => <EndorsementCard key={e._id} endorsement={e} />)
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* AscendPath Footer Branding */}
        <div className="text-center pb-8 border-t border-border/30 pt-6">
          <p className="text-xs text-muted-foreground">
            Verified career credentials powered by{' '}
            <Link to="/" className="font-bold text-primary hover:underline">
              AscendPath
            </Link>
          </p>
        </div>
      </div>

      {isOwner && (
        <ProfessionalProfile
          profile={profile}
          isOpen={profileEditorOpen}
          onClose={() => setProfileEditorOpen(false)}
          onSuccess={() => refetchProfile()}
        />
      )}
    </div>
  );
};
