import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGuideProfile } from '../features/guides/hooks/useGuideProfile';
import { useGuideReviews } from '../features/reviews/hooks/useReviews';
import { ProfileHeader } from '../features/guides/components/ProfileHeader';
import { GuideStats } from '../features/guides/components/GuideStats';
import { FameScoreCard } from '../features/guides/components/FameScoreCard';
import { SkillTags } from '../features/guides/components/SkillTags';
import { AvailabilityCard } from '../features/guides/components/AvailabilityCard';
import { RatingBreakdown } from '../features/reviews/components/RatingBreakdown';
import { ReviewCard } from '../features/reviews/components/ReviewCard';
import { ReviewReportDialog } from '../features/reviews/components/ReviewReportDialog';
import { RoadmapPreview } from '../features/guides/components/RoadmapPreview';
import { PingGuideDialog } from '../features/guides/components/PingGuideDialog';
import { ProfileCredibilityPanel } from '../features/credibility/components/ProfileCredibilityPanel';
import { BookSessionDialog } from '../features/guides/components/BookSessionDialog';
import { useAuthStore } from '../store/useAuthStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowLeft, RefreshCw, ChevronLeft, ChevronRight, MessageSquareQuote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ReportModal } from '@/features/moderation/components/ReportModal';

export const ProfileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [reportOpen, setReportOpen] = useState(false);
  const guideId = id || '';

  // Core guide profile aggregates
  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError, refetch: refetchProfile } = useGuideProfile(guideId);

  // Paginated reviews feed
  const [reviewPage, setReviewPage] = useState(1);
  const { data: reviewsData, isLoading: isReviewsLoading, isError: isReviewsError, refetch: refetchReviews } = useGuideReviews(guideId, reviewPage, 5);

  // Dialog Visibility states
  const [isPingOpen, setIsPingOpen] = useState(false);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);

  const handleRetry = () => {
    refetchProfile();
    refetchReviews();
  };

  // ─── Loading Skeleton Layout ──────────────────────────────────────────────
  if (isProfileLoading || isReviewsLoading) {
    return (
      <PageContainer size="default" className="space-y-lg py-10 animate-pulse">
        {/* Back Link skeleton */}
        <div className="h-5 w-28 bg-muted rounded-md mb-xs" />

        {/* ProfileHeader skeleton */}
        <Card className="p-md sm:p-lg border border-border">
          <div className="flex flex-col md:flex-row gap-md sm:gap-lg items-center md:items-start">
            <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-full shrink-0" />
            <div className="flex-grow space-y-sm text-center md:text-left w-full">
              <div className="flex flex-col sm:flex-row gap-sm justify-center md:justify-start">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32" />
              <div className="space-y-xs pt-xxs">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
            <div className="space-y-xs shrink-0 w-full sm:w-48 md:w-56">
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </Card>

        {/* Stats Grid skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="p-md text-center flex flex-col items-center">
              <Skeleton className="h-8 w-8 rounded-xl mb-xs" />
              <Skeleton className="h-3 w-16 mb-xxs" />
              <Skeleton className="h-5 w-8" />
            </Card>
          ))}
        </div>

        {/* Split Details skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="space-y-md lg:col-span-1">
            <Card className="h-48 border border-border"><CardContent className="p-md"><Skeleton className="h-full w-full" /></CardContent></Card>
            <Card className="h-48 border border-border"><CardContent className="p-md"><Skeleton className="h-full w-full" /></CardContent></Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="h-96 border border-border"><CardContent className="p-md"><Skeleton className="h-full w-full" /></CardContent></Card>
          </div>
        </div>
      </PageContainer>
    );
  }

  // ─── Error / Retry State ──────────────────────────────────────────────────
  if (isProfileError || isReviewsError || !profileData || !reviewsData) {
    return (
      <PageContainer size="default" className="flex items-center justify-center min-h-[60vh] py-10">
        <Card className="max-w-md w-full border-destructive/20 bg-destructive/5 text-center">
          <CardContent className="p-lg flex flex-col items-center gap-md">
            <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-body-lg font-bold text-foreground mb-xs">
                Profile Unavailable
              </h3>
              <p className="text-muted-sm text-muted-foreground leading-normal">
                There was a problem loading this guide's profile or verified reviews.
              </p>
            </div>
            <div className="flex gap-sm select-none">
              <Link to="/explore">
                <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                  Back to Explore
                </Button>
              </Link>
              <Button onClick={handleRetry} className="gap-xs bg-primary text-primary-foreground hover:bg-primary/95">
                <RefreshCw className="h-4 w-4" />
                <span>Retry Load</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  const { guide, roadmaps, openSessions, roadmapCount } = profileData;

  return (
    <PageContainer size="default" className="space-y-lg py-10 select-text">
      {/* Back to Discovery Link & Report */}
      <div className="select-none mb-xs flex justify-between items-center">
        <Link
          to="/explore"
          className="inline-flex items-center gap-xxs text-body-xs font-bold text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span>Back to Explore Guides</span>
        </Link>

        {user && user._id !== guide?._id && (
          <Button
            onClick={() => setReportOpen(true)}
            variant="ghost"
            className="text-xs font-semibold text-muted-foreground hover:text-red-400 h-8 px-2"
          >
            Report User
          </Button>
        )}
      </div>

      {/* 1. Main Header */}
      <ProfileHeader
        guide={guide}
        onOpenPing={() => setIsPingOpen(true)}
        onOpenBook={() => setIsBookOpen(true)}
      />

      {/* 2. Numeric Statistics Bar */}
      <GuideStats
        totalSessions={guide.totalSessions}
        averageRating={guide.averageRating}
        roadmapCount={roadmapCount}
        respectPoints={guide.respectPoints}
      />

      {/* 3. Split Layout: Authority + Breakdown + Schedule (Left) / Roadmaps + Reviews (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
        {/* Left Column: Stats & Schedule */}
        <div className="space-y-md lg:col-span-1 flex flex-col gap-md">
          <FameScoreCard fameScore={guide.fameScore} guideRank={guide.guideRank} />
          <RatingBreakdown breakdown={reviewsData.breakdown} />
          <SkillTags skills={guide.skills} />
          <AvailabilityCard availability={guide.availability} />
        </div>

        {/* Right Column: Tabbed Content */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-md sm:p-lg shadow-subtle min-h-[450px]">
          <Tabs defaultValue="roadmaps" className="w-full space-y-md">
            <div className="flex border-b border-border/50 pb-sm select-none justify-between items-center flex-wrap gap-xs">
              <TabsList className="bg-muted/40 p-xxs border border-border/60 rounded-xl">
                <TabsTrigger
                  value="roadmaps"
                  className="px-md py-xs font-bold uppercase tracking-wider text-[11px] rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                >
                  Curriculum Roadmaps ({roadmapCount})
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="px-md py-xs font-bold uppercase tracking-wider text-[11px] rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                >
                  Verified Reviews ({reviewsData.total})
                </TabsTrigger>
                <TabsTrigger
                  value="credibility"
                  className="px-md py-xs font-bold uppercase tracking-wider text-[11px] rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
                >
                  Credibility
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="roadmaps" className="focus-visible:outline-none focus-visible:ring-0">
              <RoadmapPreview roadmaps={roadmaps} />
            </TabsContent>

            <TabsContent value="reviews" className="focus-visible:outline-none focus-visible:ring-0 space-y-md">
              {reviewsData.reviews.length === 0 ? (
                <Card className="border border-border bg-card border-dashed p-xl text-center select-none shadow-subtle">
                  <CardContent className="flex flex-col items-center gap-sm">
                    <MessageSquareQuote className="h-10 w-10 text-muted-foreground/55 shrink-0" />
                    <div>
                      <h3 className="text-body-md font-bold text-foreground mb-xxs">No reviews yet</h3>
                      <p className="text-muted-sm text-muted-foreground max-w-xs mx-auto">
                        Completed study session reviews from learners will appear here.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-md">
                  {/* Reviews Feed */}
                  <div className="space-y-md">
                    {reviewsData.reviews.map((review) => (
                      <ReviewCard
                        key={review._id}
                        review={review}
                        onReportClick={(reviewId) => setReportingReviewId(reviewId)}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {reviewsData.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border/40 pt-md select-none mt-md">
                      <span className="text-body-xs font-bold text-muted-foreground">
                        Page {reviewsData.page} of {reviewsData.totalPages}
                      </span>
                      
                      <div className="flex items-center gap-xs">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewPage((prev) => Math.max(prev - 1, 1))}
                          disabled={reviewPage === 1}
                          className="h-8 font-bold border-border gap-xxs"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>Prev</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewPage((prev) => Math.min(prev + 1, reviewsData.totalPages))}
                          disabled={reviewPage === reviewsData.totalPages}
                          className="h-8 font-bold border-border gap-xxs"
                        >
                          <span>Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="credibility" className="focus-visible:outline-none focus-visible:ring-0">
              <ProfileCredibilityPanel
                userId={guide._id}
                totalSessions={guide.totalSessions}
                averageRating={guide.averageRating}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* 4. Action Modals/Dialogs */}
      <PingGuideDialog
        guideId={guide._id}
        guideName={guide.name}
        isOpen={isPingOpen}
        onClose={() => setIsPingOpen(false)}
      />

      <BookSessionDialog
        guideName={guide.name}
        openSessions={openSessions}
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
      />

      {reportingReviewId && (
        <ReviewReportDialog
          reviewId={reportingReviewId}
          isOpen={!!reportingReviewId}
          onClose={() => setReportingReviewId(null)}
        />
      )}

      <ReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetType="user"
        targetId={guide._id}
        targetName={guide.name}
      />
    </PageContainer>
  );
};
