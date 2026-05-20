import React, { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useSearchGuides } from '../features/discovery/hooks/useSearchGuides';
import { useSearchRoadmaps } from '../features/discovery/hooks/useSearchRoadmaps';
import { useSearchPosts } from '../features/discovery/hooks/useSearchPosts';
import { SearchBar } from '../features/discovery/components/SearchBar';
import { FilterPanel } from '../features/discovery/components/FilterPanel';
import { GuideCard } from '../features/discovery/components/GuideCard';
import { RoadmapCard } from '../features/discovery/components/RoadmapCard';
import { DiscoveryPostCard } from '../features/discovery/components/DiscoveryPostCard';

type TabType = 'guides' | 'roadmaps' | 'posts';

export const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('guides');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Only fire the query for the currently-visible tab.
  // The other two queries stay suspended (enabled: false) so we don't
  // fire 3 network requests when the user only sees one result set.
  const guidesQuery = useSearchGuides({ 
    q: debouncedSearch, 
    ...filters 
  }, activeTab === 'guides');
  
  const roadmapsQuery = useSearchRoadmaps({ 
    q: debouncedSearch, 
    ...filters 
  }, activeTab === 'roadmaps');
  
  const postsQuery = useSearchPosts({ 
    q: debouncedSearch, 
    ...filters 
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
    setFilters({}); // Reset filters on tab change
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Explore the Community</h1>
        <p className="text-gray-500 text-lg max-w-2xl">Find the perfect guide, follow a structured roadmap, or jump into deep technical discussions.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar: Filters */}
        <div className="lg:w-72 flex-shrink-0">
          <FilterPanel 
            activeTab={activeTab} 
            filters={filters} 
            onFilterChange={setFilters} 
          />
        </div>

        {/* Main Content */}
        <div className="flex-grow">
          {/* Search and Tabs Container */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            
            <div className="flex border-b border-gray-100 mt-8">
              {(['guides', 'roadmaps', 'posts'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`px-8 py-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${
                    activeTab === tab 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div>
            {query.isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-50"></div>
                ))}
              </div>
            )}

            {query.isError && (
              <div className="bg-red-50 p-8 rounded-2xl text-center">
                <p className="text-red-600 font-bold">Failed to load results. Please try again.</p>
              </div>
            )}

            {query.isSuccess && (
              <>
                {query.data.total === 0 ? (
                  <div className="bg-gray-50 p-16 rounded-2xl text-center border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold">No results found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
