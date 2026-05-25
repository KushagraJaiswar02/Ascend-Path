import React, { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  Briefcase,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { apiClient } from '../services/apiClient';
import { useToast } from '../components/ui/toast';
import {
  useOpportunities,
  useOpportunity,
  useApplicationsBoard,
  useApplyOpportunity,
  useAdminOpportunities,
  useVerifyOpportunity,
} from '../features/opportunities/api';
import { OpportunityCard } from '../features/opportunities/components/OpportunityCard';
import { SkillGapPanel } from '../features/opportunities/components/SkillGapPanel';
import { ApplicationTrackerBoard } from '../features/opportunities/components/ApplicationTrackerBoard';
import { DeadlineReminderStrip } from '../features/opportunities/components/DeadlineReminderStrip';
import type { Opportunity } from '../features/opportunities/types';

export const Opportunities: React.FC = () => {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const applyMut = useApplyOpportunity();
  const verifyMut = useVerifyOpportunity();

  const [activeTab, setActiveTab] = useState<string>('discover');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [opportunityType, setOpportunityType] = useState('');
  const [remoteStatus, setRemoteStatus] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [sortByReady, setSortByReady] = useState(false);

  // Meta selections from backend (populated dynamically)
  const [domains, setDomains] = useState<{ id: string; name: string }[]>([]);
  const [roadmaps, setRoadmaps] = useState<{ _id: string; title: string }[]>([]);

  // Selected opportunity for detail modal
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Create opportunity modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('');
  const [createType, setCreateType] = useState('internship');
  const [createOrg, setCreateOrg] = useState('');
  const [createLogo, setCreateLogo] = useState('');
  const [createSkills, setCreateSkills] = useState('');
  const [createRemote, setCreateRemote] = useState('remote');
  const [createStipend, setCreateStipend] = useState('');
  const [createDeadline, setCreateDeadline] = useState('');
  const [createLink, setCreateLink] = useState('');
  const [createRmId, setCreateRmId] = useState('');

  // Fetch Opportunities list
  const {
    data: oppsData,
    isLoading: isOppsLoading,
    isError: isOppsError,
    refetch: refetchOpps,
  } = useOpportunities({
    q: searchTerm || undefined,
    opportunityType: opportunityType || undefined,
    remoteStatus: remoteStatus || undefined,
    difficulty: difficulty || undefined,
    domainId: selectedDomain || undefined,
    sortByReady: sortByReady || undefined,
  });

  // Fetch applications tracking board
  const {
    data: appsBoard,
    isLoading: isAppsLoading,
    refetch: refetchBoard,
  } = useApplicationsBoard();

  // Fetch opportunity details for SkillGapPanel
  const { data: detailData, isLoading: isDetailLoading } = useOpportunity(selectedOppId || '', !!selectedOppId);

  const isAdmin = ['admin', 'architect', 'super_admin', 'moderator', 'sentinel'].includes(user?.role || '');
  const {
    data: adminOppsData,
    refetch: refetchAdminOpps,
  } = useAdminOpportunities(1, 40, isAdmin);

  // Load taxonomy domains & roadmaps for form selectors
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const taxonomyRes = await apiClient.get('/taxonomy/explorer');
        const rmsRes = await apiClient.get('/roadmaps/trending?limit=40');
        
        // Extract domains safely
        const fetchedDomains: any[] = [];
        taxonomyRes.data?.data?.clusters?.forEach((cluster: any) => {
          cluster.domains?.forEach((d: any) => {
            fetchedDomains.push({ id: d.id, name: d.name });
          });
        });
        setDomains(fetchedDomains);
        setRoadmaps(rmsRes.data?.data?.roadmaps || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadMeta();
  }, []);

  const handleOpenDetails = (opp: Opportunity) => {
    setSelectedOppId(opp._id);
    setIsDetailOpen(true);
  };

  const handleTrackOpportunity = async (oppId: string) => {
    try {
      await applyMut.mutateAsync(oppId);
      toast({
        title: 'Added to Applications',
        description: 'Successfully tracking this opportunity in your dashboard.',
      });
      refetchOpps();
      refetchBoard();
    } catch (e: any) {
      toast({
        title: 'Tracking Failed',
        description: e?.response?.data?.message || 'Could not track application.',
        type: 'error',
      });
    }
  };

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle || !createOrg || !createDeadline || !createLink) {
      toast({ title: 'Validation Error', description: 'Please complete all required fields.', type: 'error' });
      return;
    }

    try {
      const skillsArray = createSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: createTitle,
        opportunityType: createType,
        organizationName: createOrg,
        organizationLogo: createLogo || undefined,
        requiredSkills: skillsArray,
        remoteStatus: createRemote,
        stipend: createStipend || undefined,
        applicationDeadline: createDeadline,
        applicationLink: createLink,
        recommendedRoadmaps: createRmId ? [createRmId] : [],
      };

      await apiClient.post('/opportunities', payload);
      toast({
        title: 'Opportunity Created',
        description: isAdmin
          ? 'Opportunity posted and verified successfully!'
          : 'Opportunity submitted for moderator review.',
      });
      setIsCreateOpen(false);
      
      // Clear fields
      setCreateTitle('');
      setCreateOrg('');
      setCreateLogo('');
      setCreateSkills('');
      setCreateStipend('');
      setCreateDeadline('');
      setCreateLink('');
      setCreateRmId('');

      refetchOpps();
      refetchAdminOpps();
    } catch (e: any) {
      toast({
        title: 'Creation Failed',
        description: e?.response?.data?.message || 'Failed to publish opportunity.',
        type: 'error',
      });
    }
  };

  const handleVerify = async (oppId: string, status: 'approved' | 'rejected', isFeatured = false) => {
    try {
      await verifyMut.mutateAsync({ opportunityId: oppId, verificationStatus: status, isFeatured });
      toast({ title: 'Action Recorded', description: `Opportunity was successfully ${status}.` });
      refetchOpps();
      refetchAdminOpps();
    } catch (e) {
      console.error(e);
    }
  };

  // Determine tracked IDs to prevent dual tracking clicks
  const appliedOppIds = new Set(appsBoard?.map((app) => app.opportunityId?._id));

  return (
    <PageContainer size="default">
      {/* Top Banner section */}
      <section className="pb-6 border-b border-border/50 mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-violet-500/5 to-indigo-500/5 rounded-3xl blur-md pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10 p-2">
          <div className="space-y-1.5">
            <h2 className="text-page-title font-extrabold text-foreground tracking-tight leading-tight sm:text-3xl flex items-center gap-2">
              <Briefcase className="h-7 w-7 text-primary" />
              <span>Outcome Infrastructure & Opportunities</span>
            </h2>
            <p className="text-body-p text-muted-foreground font-semibold">
              Bridge the gap between curriculum learning, path readiness signals, and measurable real-world outcomes.
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="primary"
            size="default"
            className="rounded-2xl h-11 px-5 font-bold uppercase tracking-wider text-xs shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
            <span>Post Opportunity</span>
          </Button>
        </div>
      </section>

      {/* Main Tabs interface */}
      <Tabs defaultValue="discover" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:max-w-md bg-muted/20 border border-border/40 p-1 rounded-2xl">
          <TabsTrigger value="discover" className="rounded-xl text-xs font-bold py-2 cursor-pointer">
            Discover Opportunities
          </TabsTrigger>
          <TabsTrigger value="applications" className="rounded-xl text-xs font-bold py-2 cursor-pointer">
            My Applications (Kanban)
          </TabsTrigger>
        </TabsList>

        {/* Discover tab content */}
        <TabsContent value="discover" className="space-y-8 outline-none">
          {/* Urgency warning banner strip */}
          {oppsData?.opportunities && (
            <DeadlineReminderStrip
              opportunities={oppsData.opportunities}
              onViewDetails={handleOpenDetails}
            />
          )}

          {/* Filtering desk */}
          <Card className="border border-border/80 bg-gradient-to-br from-card to-muted/10 rounded-2xl shadow-subtle relative overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                
                {/* Search Bar */}
                <div className="relative w-full lg:max-w-md shrink-0">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search roles, skills, or companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 text-xs rounded-xl bg-card border-border/60"
                  />
                </div>

                {/* Readiness sorter switch toggle */}
                <div className="flex items-center gap-2 select-none self-end lg:self-center">
                  <Button
                    onClick={() => setSortByReady((prev) => !prev)}
                    variant={sortByReady ? 'primary' : 'outline'}
                    size="sm"
                    className="h-9 px-4 rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
                  >
                    <TrendingUp className={`h-4 w-4 ${sortByReady ? 'text-white animate-pulse' : 'text-primary'}`} />
                    <span>Rank by Readiness</span>
                  </Button>
                  {isAdmin && (
                    <Button
                      onClick={() => setActiveTab('moderation')}
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 rounded-xl text-xs font-bold text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/5 cursor-pointer"
                    >
                      Moderator Queue
                    </Button>
                  )}
                </div>
              </div>

              {/* Specific detail filters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border/30 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider leading-none">
                    Opportunity Type
                  </label>
                  <select
                    value={opportunityType}
                    onChange={(e) => setOpportunityType(e.target.value)}
                    className="w-full text-xs font-bold border border-border/60 bg-muted/20 hover:bg-muted/40 rounded-xl px-3 py-2 outline-none text-foreground"
                  >
                    <option value="">All Types</option>
                    <option value="internship">Internships</option>
                    <option value="job">Jobs</option>
                    <option value="freelance">Freelance Gigs</option>
                    <option value="scholarship">Scholarships</option>
                    <option value="competition">Competitions</option>
                    <option value="exam">Exams</option>
                    <option value="university">University Pathways</option>
                    <option value="bootcamp">Bootcamps</option>
                    <option value="fellowship">Fellowships</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider leading-none">
                    Remote Status
                  </label>
                  <select
                    value={remoteStatus}
                    onChange={(e) => setRemoteStatus(e.target.value)}
                    className="w-full text-xs font-bold border border-border/60 bg-muted/20 hover:bg-muted/40 rounded-xl px-3 py-2 outline-none text-foreground"
                  >
                    <option value="">All Locations</option>
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider leading-none">
                    Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full text-xs font-bold border border-border/60 bg-muted/20 hover:bg-muted/40 rounded-xl px-3 py-2 outline-none text-foreground"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider leading-none">
                    Taxonomy Domain
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full text-xs font-bold border border-border/60 bg-muted/20 hover:bg-muted/40 rounded-xl px-3 py-2 outline-none text-foreground"
                  >
                    <option value="">All Domains</option>
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities list layout */}
          {isOppsLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3 animate-pulse">
              <RefreshCw className="h-7 w-7 text-muted-foreground animate-spin shrink-0" />
              <span className="text-body-xs text-muted-foreground">Compiling readiness outcomes...</span>
            </div>
          ) : isOppsError ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh] border border-destructive/15 bg-destructive/5 rounded-3xl p-6 text-center">
              <AlertCircle className="h-10 w-10 text-destructive mb-2" />
              <h4 className="text-body-sm font-bold text-foreground">Could not load opportunities</h4>
              <p className="text-metadata text-muted-foreground mt-1 max-w-sm">
                There was a networking issue fetching opportunities from the database. Let's try refreshing.
              </p>
              <Button onClick={() => refetchOpps()} variant="outline" className="mt-4 gap-1.5 h-9 text-xs">
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </Button>
            </div>
          ) : oppsData?.opportunities && oppsData.opportunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {oppsData.opportunities.map((opp) => (
                <OpportunityCard
                  key={opp._id}
                  opportunity={opp}
                  onViewDetails={handleOpenDetails}
                  onApply={handleTrackOpportunity}
                  isApplied={appliedOppIds.has(opp._id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/40 rounded-3xl">
              <Briefcase className="h-12 w-12 text-muted-foreground/60 mb-2.5" />
              <h5 className="text-body-xs font-bold text-foreground">No opportunities match filters</h5>
              <p className="text-metadata text-muted-foreground mt-1 max-w-sm font-medium">
                Try searching for alternative skills or reset type filters to explore active roles.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Kanban tracking board tab */}
        <TabsContent value="applications" className="outline-none">
          {isAppsLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[30vh]">
              <RefreshCw className="h-7 w-7 text-muted-foreground animate-spin" />
            </div>
          ) : appsBoard ? (
            <ApplicationTrackerBoard applications={appsBoard} onRefresh={refetchBoard} />
          ) : null}
        </TabsContent>

        {/* Moderator list desk tab */}
        <TabsContent value="moderation" className="outline-none">
          <Card className="border border-border/80 rounded-2xl bg-card">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-body-sm font-bold text-foreground">Opportunities Verification Desk</h3>
              <p className="text-metadata text-muted-foreground font-semibold">
                Manage expirations, verify authentic listings, toggle featured highlights, and audit scam prevention.
              </p>

              <div className="overflow-x-auto border border-border/45 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/15 border-b border-border/30 font-extrabold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3">Title & Company</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Deadline</th>
                      <th className="p-3">Verification</th>
                      <th className="p-3">Featured</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/25">
                    {adminOppsData?.opportunities?.map((opp) => (
                      <tr key={opp._id} className="hover:bg-muted/10">
                        <td className="p-3 font-semibold text-foreground">
                          <div>{opp.title}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">{opp.organizationName}</div>
                        </td>
                        <td className="p-3 capitalize">{opp.opportunityType}</td>
                        <td className="p-3">{new Date(opp.applicationDeadline).toLocaleDateString()}</td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-bold capitalize ${
                              opp.verificationStatus === 'approved'
                                ? 'text-success border-success/20 bg-success/5'
                                : opp.verificationStatus === 'rejected'
                                ? 'text-destructive border-destructive/20 bg-destructive/5'
                                : 'text-warning border-warning/20 bg-warning/5'
                            }`}
                          >
                            {opp.verificationStatus}
                          </Badge>
                        </td>
                        <td className="p-3">{opp.isFeatured ? '⭐ Yes' : 'No'}</td>
                        <td className="p-3 text-right space-x-1.5">
                          {opp.verificationStatus !== 'approved' && (
                            <Button
                              onClick={() => handleVerify(opp._id, 'approved', opp.isFeatured)}
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] font-bold px-2 rounded-lg text-success border-success/20 hover:bg-success/5 cursor-pointer"
                            >
                              Approve
                            </Button>
                          )}
                          {opp.verificationStatus !== 'rejected' && (
                            <Button
                              onClick={() => handleVerify(opp._id, 'rejected', false)}
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] font-bold px-2 rounded-lg text-destructive border-destructive/20 hover:bg-destructive/5 cursor-pointer"
                            >
                              Reject
                            </Button>
                          )}
                          {!opp.isFeatured && opp.verificationStatus === 'approved' && (
                            <Button
                              onClick={() => handleVerify(opp._id, 'approved', true)}
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] font-bold px-2 rounded-lg text-primary border-primary/20 hover:bg-primary/5 cursor-pointer"
                            >
                              Feature
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!adminOppsData?.opportunities || adminOppsData.opportunities.length === 0) && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-muted-foreground font-medium">
                          No opportunities posted in moderation queue.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Opportunity Skill Gap Dialog */}
      {selectedOppId && (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl p-0 rounded-3xl border border-border bg-card max-h-[85vh] overflow-y-auto">
            {isDetailLoading ? (
              <div className="flex flex-col items-center justify-center p-12 gap-3 animate-pulse text-muted-foreground">
                <RefreshCw className="h-7 w-7 animate-spin shrink-0" />
                <span className="text-xs">Computing Skill Alignment...</span>
              </div>
            ) : detailData ? (
              <SkillGapPanel
                opportunity={detailData.opportunity}
                readinessScore={detailData.readinessScore}
                readinessGaps={detailData.readinessGaps}
                onClose={() => setIsDetailOpen(false)}
              />
            ) : null}
          </DialogContent>
        </Dialog>
      )}

      {/* Create Opportunity Dialog Form */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg rounded-3xl border border-border bg-card max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-border/40">
            <DialogTitle className="text-body-lg font-extrabold text-foreground leading-snug">
              Post Career Opportunity
            </DialogTitle>
            <DialogDescription className="text-metadata text-muted-foreground font-semibold leading-normal">
              Contribute jobs, internships, freelance gigs, or exams to the outcome directory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOpportunity} className="space-y-4 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  Opportunity Title *
                </label>
                <Input
                  required
                  placeholder="e.g. Junior Frontend Dev"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="h-9.5 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  Organization Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Google DeepMind"
                  value={createOrg}
                  onChange={(e) => setCreateOrg(e.target.value)}
                  className="h-9.5 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  Opportunity Type *
                </label>
                <select
                  value={createType}
                  onChange={(e) => setCreateType(e.target.value)}
                  className="w-full text-xs font-bold border border-border/60 bg-muted/20 hover:bg-muted/40 rounded-xl px-3 py-2 h-9.5 outline-none text-foreground"
                >
                  <option value="internship">Internship</option>
                  <option value="job">Full-time Job</option>
                  <option value="freelance">Freelance Gig</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="competition">Competition</option>
                  <option value="exam">Exam Path</option>
                  <option value="university">University Pathway</option>
                  <option value="bootcamp">Bootcamp</option>
                  <option value="fellowship">Fellowship</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  Remote Status
                </label>
                <select
                  value={createRemote}
                  onChange={(e) => setCreateRemote(e.target.value)}
                  className="w-full text-xs font-bold border border-border/60 bg-muted/20 hover:bg-muted/40 rounded-xl px-3 py-2 h-9.5 outline-none text-foreground"
                >
                  <option value="remote">Remote Only</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                Organization Logo Link
              </label>
              <Input
                placeholder="URL to organization logo image"
                value={createLogo}
                onChange={(e) => setCreateLogo(e.target.value)}
                className="h-9.5 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                Required Skills (Comma separated)
              </label>
              <Input
                placeholder="React, TypeScript, CSS, Git"
                value={createSkills}
                onChange={(e) => setCreateSkills(e.target.value)}
                className="h-9.5 text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  Stipend / Salary Range
                </label>
                <Input
                  placeholder="e.g. $1200/mo or $85k-$110k"
                  value={createStipend}
                  onChange={(e) => setCreateStipend(e.target.value)}
                  className="h-9.5 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  Recommended Roadmap Linking
                </label>
                <select
                  value={createRmId}
                  onChange={(e) => setCreateRmId(e.target.value)}
                  className="w-full text-xs font-bold border border-border/60 bg-muted/20 hover:bg-muted/40 rounded-xl px-3 py-2 h-9.5 outline-none text-foreground"
                >
                  <option value="">No Roadmap linkage</option>
                  {roadmaps.map((rm) => (
                    <option key={rm._id} value={rm._id}>
                      {rm.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  Application Deadline *
                </label>
                <Input
                  type="date"
                  required
                  value={createDeadline}
                  onChange={(e) => setCreateDeadline(e.target.value)}
                  className="h-9.5 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  Application Link *
                </label>
                <Input
                  type="url"
                  required
                  placeholder="https://company.com/apply"
                  value={createLink}
                  onChange={(e) => setCreateLink(e.target.value)}
                  className="h-9.5 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-2 border-t border-border/40 pt-4 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="h-10 text-xs font-bold px-4 rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-10 text-xs font-bold px-5 rounded-xl bg-primary text-white hover:bg-primary/95 cursor-pointer"
              >
                Publish Listing
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};
