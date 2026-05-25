import React, { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useSearchGuides } from '../features/discovery/hooks/useSearchGuides';
import { useSearchRoadmaps } from '../features/discovery/hooks/useSearchRoadmaps';
import { useSearchPosts } from '../features/discovery/hooks/useSearchPosts';
import { SearchBar } from '../features/discovery/components/SearchBar';
import { FilterPanel } from '../features/discovery/components/FilterPanel';
import { GuideCard } from '../features/discovery/components/GuideCard';
import { RoadmapCard } from '../features/discovery/components/RoadmapCard';
import { DiscoveryPostCard } from '../features/discovery/components/DiscoveryPostCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ArrowUpDown, ShieldAlert, Sparkles } from 'lucide-react';
import { useRecommendations } from '@/features/recommendations/hooks/useRecommendations';
import { RecommendationRail } from '@/features/recommendations/components/RecommendationRail';

type TabType = 'guides' | 'roadmaps' | 'posts';

export const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('guides');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [sortBy, setSortBy] = useState('fameScore');
  const [page, setPage] = useState(1);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const recommendations = useRecommendations('explore', 4);

  // Reset pagination when search, filter or tab changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters, sortBy, activeTab]);

  const guidesParams = {
    search: debouncedSearch,
    domains: filters.domains?.join(','),
    skills: filters.skills?.join(','),
    minRating: filters.minRating,
    minFameScore: filters.minFameScore,
    minSessions: filters.minSessions,
    isBeginnerFriendly: filters.isBeginnerFriendly,
    isTopRated: filters.isTopRated,
    isMostActive: filters.isMostActive,
    availability: filters.availability,
    page,
    sortBy,
  };

  const guidesQuery = useSearchGuides(guidesParams, activeTab === 'guides');
  
  const roadmapsQuery = useSearchRoadmaps({ 
    q: debouncedSearch, 
    ...filters,
    page,
  }, activeTab === 'roadmaps');
  
  const postsQuery = useSearchPosts({ 
    q: debouncedSearch, 
    ...filters,
    page,
  }, activeTab === 'posts');

  const getQuery = () => {
    switch(activeTab) {
      case 'guides': return guidesQuery;
      case 'roadmaps': return roadmapsQuery;
      case 'posts': return postsQuery;
    }
  };

  const query = getQuery();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setFilters({});
    setSortBy(tab === 'guides' ? 'fameScore' : 'popular');
    setPage(1);
  };

  const handleRemoveFilter = (key: string, value?: any) => {
    const updatedFilters = { ...filters };
    if (value !== undefined) {
      // Remove specific array item
      updatedFilters[key] = (updatedFilters[key] || []).filter((v: any) => v !== value);
      if (updatedFilters[key].length === 0) {
        delete updatedFilters[key];
      }
    } else {
      // Remove completely
      delete updatedFilters[key];
    }
    setFilters(updatedFilters);
  };

  const renderActiveFilterBadges = () => {
    const badges: React.ReactNode[] = [];

    if (filters.domains && filters.domains.length > 0) {
      filters.domains.forEach((dom: string) => {
        badges.push(
          <Badge key={`dom-${dom}`} variant="secondary" className="flex items-center gap-xxs px-sm py-[3px] text-[10px] font-bold">
            <span>Domain: {dom}</span>
            <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleRemoveFilter('domains', dom)} />
          </Badge>
        );
      });
    }

    if (filters.skills && filters.skills.length > 0) {
      filters.skills.forEach((sk: string) => {
        badges.push(
          <Badge key={`sk-${sk}`} variant="secondary" className="flex items-center gap-xxs px-sm py-[3px] text-[10px] font-bold">
            <span>Skill: {sk}</span>
            <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleRemoveFilter('skills', sk)} />
          </Badge>
        );
      });
    }

    if (filters.minRating) {
      badges.push(
        <Badge key="minRating" variant="secondary" className="flex items-center gap-xxs px-sm py-[3px] text-[10px] font-bold">
          <span>Rating: {filters.minRating}★+</span>
          <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleRemoveFilter('minRating')} />
        </Badge>
      );
    }

    if (filters.minFameScore) {
      badges.push(
        <Badge key="minFameScore" variant="secondary" className="flex items-center gap-xxs px-sm py-[3px] text-[10px] font-bold">
          <span>Fame: {filters.minFameScore}+</span>
          <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleRemoveFilter('minFameScore')} />
        </Badge>
      );
    }

    if (filters.minSessions) {
      badges.push(
        <Badge key="minSessions" variant="secondary" className="flex items-center gap-xxs px-sm py-[3px] text-[10px] font-bold">
          <span>Sessions: {filters.minSessions}+</span>
          <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleRemoveFilter('minSessions')} />
        </Badge>
      );
    }

    if (filters.availability) {
      badges.push(
        <Badge key="availability" variant="secondary" className="flex items-center gap-xxs px-sm py-[3px] text-[10px] font-bold">
          <span>Available: {filters.availability}</span>
          <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleRemoveFilter('availability')} />
        </Badge>
      );
    }

    if (filters.isBeginnerFriendly) {
      badges.push(
        <Badge key="isBeginnerFriendly" variant="secondary" className="flex items-center gap-xxs px-sm py-[3px] text-[10px] font-bold">
          <span>Beginner Friendly</span>
          <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleRemoveFilter('isBeginnerFriendly')} />
        </Badge>
      );
    }

    if (filters.isTopRated) {
      badges.push(
        <Badge key="isTopRated" variant="secondary" className="flex items-center gap-xxs px-sm py-[3px] text-[10px] font-bold">
          <span>Top Rated</span>
          <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleRemoveFilter('isTopRated')} />
        </Badge>
      );
    }

    if (filters.isMostActive) {
      badges.push(
        <Badge key="isMostActive" variant="secondary" className="flex items-center gap-xxs px-sm py-[3px] text-[10px] font-bold">
          <span>Most Active</span>
          <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground shrink-0" onClick={() => handleRemoveFilter('isMostActive')} />
        </Badge>
      );
    }

    if (badges.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-xs items-center select-none pt-sm">
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mr-xxs">Active:</span>
        {badges}
        <button 
          onClick={() => setFilters({})}
          className="text-[10px] font-extrabold text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border/60 hover:border-border px-xs py-xxs rounded-md"
        >
          Clear All
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-text">
      {/* Page Title Header */}
      <div className="mb-12 select-none">
        <h1 className="text-heading-lg font-black text-foreground mb-sm tracking-tight leading-tight flex items-center gap-sm">
          <Sparkles className="h-8 w-8 text-primary" />
          <span>Discover Mentors & Guides</span>
        </h1>
        <p className="text-muted-foreground text-body-sm max-w-2xl leading-relaxed">
          Find public guides, study maps, or jump into career mentorship. Filter by expert domains, technologies, availability, and reputation.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar Filters */}
        <div className="w-full lg:w-72 shrink-0">
          <FilterPanel 
            activeTab={activeTab} 
            filters={filters} 
            onFilterChange={setFilters} 
          />
        </div>

        {/* Right Search Grid Content */}
        <div className="flex-grow w-full space-y-md">
          {/* Main Control Panel (Search, Tabs, Sort dropdown) */}
          <div className="bg-card border border-border/80 p-md rounded-2xl shadow-subtle space-y-md">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search mentors by name, bio, domains or skills..." />
            
            <div className="flex items-center justify-between border-t border-border/40 pt-md flex-wrap gap-sm select-none">
              {/* Core Discovery Navigation Tabs */}
              <div className="flex border-b border-border/40 pb-[2px] bg-muted/30 p-xxs border border-border/60 rounded-xl">
                {(['guides', 'roadmaps', 'posts'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-sm py-[6px] text-body-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                      activeTab === tab 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Sorting Strategies Trigger select */}
              {activeTab === 'guides' && (
                <div className="flex items-center gap-xs">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-body-xs font-bold text-muted-foreground uppercase tracking-wider">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-background border border-border/80 rounded-xl text-body-xs font-bold text-foreground focus:ring-primary focus:border-primary px-sm py-xxs outline-none cursor-pointer"
                  >
                    <option value="fameScore">Highest Fame</option>
                    <option value="averageRating">Top Rated</option>
                    <option value="totalSessions">Most Popular</option>
                    <option value="mostActive">Most Active</option>
                    <option value="newest">Newest Guides</option>
                  </select>
                </div>
              )}
            </div>

            {/* Rendered filter badges if any are active */}
            {activeTab === 'guides' && renderActiveFilterBadges()}
          </div>

          {recommendations.data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
              <RecommendationRail
                title="Recommended For You"
                subtitle={recommendations.data.contextLabel}
                items={[
                  ...recommendations.data.rails.roadmaps.slice(0, 2),
                  ...recommendations.data.rails.mentors.slice(0, 2),
                ]}
                context="explore"
              />
              <RecommendationRail
                title="Because You Are Exploring"
                subtitle="Sessions and discussions matched to your goals"
                items={[
                  ...recommendations.data.rails.sessions.slice(0, 2),
                  ...recommendations.data.rails.forum.slice(0, 2),
                ]}
                context="explore-context"
              />
            </div>
          )}

          {/* Results Area */}
          <div>
            {query.isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-card border border-border/50 rounded-2xl p-md sm:p-lg h-56 animate-pulse flex flex-col justify-between">
                    <div className="flex gap-sm">
                      <div className="h-14 w-14 rounded-full bg-muted shrink-0" />
                      <div className="space-y-xs w-full">
                        <div className="h-4.5 w-1/3 bg-muted rounded" />
                        <div className="h-3 w-1/4 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-3.5 w-full bg-muted rounded" />
                    <div className="flex justify-between items-center gap-sm">
                      <div className="h-6 w-1/3 bg-muted rounded" />
                      <div className="h-8 w-1/4 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.isError && (
              <div className="bg-destructive/5 border border-destructive/20 p-lg rounded-2xl text-center select-none shadow-subtle flex flex-col items-center gap-sm">
                <ShieldAlert className="h-10 w-10 text-destructive shrink-0" />
                <div>
                  <h3 className="text-body-md font-bold text-foreground">Discovery Error</h3>
                  <p className="text-muted-foreground text-body-xs mt-xxs">Failed to load results. Please check connection and try again.</p>
                </div>
              </div>
            )}

            {query.isSuccess && (
              <>
                {query.data.total === 0 ? (
                  <div className="bg-muted/10 border-2 border-dashed border-border/80 p-xl rounded-2xl text-center select-none shadow-subtle flex flex-col items-center gap-sm">
                    <ShieldAlert className="h-10 w-10 text-muted-foreground/60 shrink-0" />
                    <div>
                      <h3 className="text-body-md font-black text-foreground">No matches found</h3>
                      <p className="text-muted-foreground text-body-xs mt-xxs max-w-xs mx-auto">No public guides or study maps match your filtering criteria. Try resetting filters.</p>
                    </div>
                    <Button variant="outline" className="border-border text-foreground hover:bg-muted font-bold mt-xs" onClick={() => setFilters({})}>
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-md">
                    {/* Content lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                      {activeTab === 'guides' && query.data.guides?.map((guide: any) => (
                        <GuideCard key={guide._id} guide={guide} />
                      ))}
                      {activeTab === 'roadmaps' && query.data.roadmaps?.map((roadmap: any) => (
                        <RoadmapCard key={roadmap._id} roadmap={roadmap} />
                      ))}
                      {activeTab === 'posts' && query.data.posts?.map((post: any) => (
                        <DiscoveryPostCard key={post._id} post={post} />
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {query.data.totalPages > 1 && (
                      <div className="flex items-center justify-between border-t border-border/40 pt-md select-none mt-lg">
                        <span className="text-body-xs font-bold text-muted-foreground">
                          Page {query.data.page} of {query.data.totalPages} (Total {query.data.total})
                        </span>
                        
                        <div className="flex items-center gap-xs">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="h-8.5 font-bold border-border gap-xxs"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span>Prev</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((prev) => Math.min(prev + 1, query.data.totalPages))}
                            disabled={page === query.data.totalPages}
                            className="h-8.5 font-bold border-border gap-xxs"
                          >
                            <span>Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
