import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, LayoutGrid, Calendar, Sliders, CheckCircle2, UserCheck, Flame } from 'lucide-react';
import { useTaxonomyExplorer } from '@/features/taxonomy/hooks/useTaxonomy';

interface FilterPanelProps {
  activeTab: 'guides' | 'roadmaps' | 'posts';
  filters: any;
  onFilterChange: (newFilters: any) => void;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ activeTab, filters, onFilterChange }) => {
  const taxonomy = useTaxonomyExplorer();
  const availableDomains = taxonomy.data?.clusters.flatMap((cluster) => cluster.domains || []) || [];
  const availableSkills = ['Portfolio', 'Exam prep', 'Interview prep', 'Freelancing', 'Study abroad', 'Research', 'Leadership'];

  const handleChange = (name: string, value: any) => {
    onFilterChange({ ...filters, [name]: value });
  };

  const handleArrayToggle = (name: string, item: string) => {
    const current = filters[name] || [];
    const updated = current.includes(item)
      ? current.filter((x: string) => x !== item)
      : [...current, item];
    handleChange(name, updated);
  };

  return (
    <div className="bg-card border border-border bg-card p-5 rounded-2xl shadow-subtle space-y-5 select-none transition-all duration-300 hover:border-border/80 relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent group-hover:bg-primary/20 transition-colors duration-300" />
      
      <div className="flex items-center gap-2 pb-3 border-b border-border/40 mt-[2px]">
        <Sliders className="h-4.5 w-4.5 text-primary shrink-0" />
        <h3 className="text-card-title font-bold text-foreground">Discovery Filters</h3>
      </div>

      {activeTab === 'guides' && (
        <div className="space-y-5">
          {/* 1. Domains Multi-select */}
          <div className="space-y-2">
            <label className="block text-label-lbl font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Expert Domains</span>
            </label>
            <div className="flex flex-col gap-1.5 pt-1">
              {availableDomains.slice(0, 16).map((domain) => {
                const isSelected = (filters.domains || []).includes(domain.id);
                return (
                  <label key={domain.id} className="flex items-center gap-2 cursor-pointer text-metadata font-semibold text-foreground/80 hover:text-foreground">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border bg-background cursor-pointer accent-primary"
                      checked={isSelected}
                      onChange={() => handleArrayToggle('domains', domain.id)}
                    />
                    <span>{domain.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Skills Multi-select */}
          <div className="space-y-2 border-t border-border/40 pt-4">
            <label className="block text-label-lbl font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Focus Areas</span>
            </label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {availableSkills.map((skill) => {
                const isSelected = (filters.skills || []).includes(skill);
                return (
                  <Badge
                    key={skill}
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => handleArrayToggle('skills', skill)}
                    className={`cursor-pointer px-2.5 py-[3px] rounded-full text-[10px] font-bold shadow-sm transition-all duration-200 select-none ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-primary/10'
                        : 'bg-background text-foreground border-border hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    {skill}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* 3. Minimum Star Rating */}
          <div className="space-y-2 border-t border-border/40 pt-4">
            <label className="block text-label-lbl font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Minimum Star Rating</span>
            </label>
            <select
              className="w-full bg-background border border-border rounded-xl text-metadata font-bold text-foreground focus:ring-1 focus:ring-primary focus:border-primary px-3 py-2 mt-1 outline-none cursor-pointer"
              value={filters.minRating || ''}
              onChange={(e) => handleChange('minRating', e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Any Rating</option>
              <option value="5.0">5.0 Star Only</option>
              <option value="4.5">4.5 Stars & Up</option>
              <option value="4.0">4.0 Stars & Up</option>
              <option value="3.0">3.0 Stars & Up</option>
            </select>
          </div>

          {/* 4. Minimum Fame Score */}
          <div className="space-y-2 border-t border-border/40 pt-4">
            <label className="block text-label-lbl font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-primary fill-primary/5 shrink-0" />
              <span>Min Fame Score: {filters.minFameScore || 0}+</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              className="w-full h-1.5 bg-muted border border-border/40 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
              value={filters.minFameScore || 0}
              onChange={(e) => handleChange('minFameScore', Number(e.target.value))}
            />
          </div>

          {/* 5. Minimum Sessions Completed */}
          <div className="space-y-2 border-t border-border/40 pt-4">
            <label className="block text-label-lbl font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Min Sessions Completed</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 5"
              className="w-full bg-background border border-border rounded-xl text-metadata font-semibold text-foreground focus:ring-1 focus:ring-primary focus:border-primary px-3 py-2 outline-none"
              value={filters.minSessions || ''}
              onChange={(e) => handleChange('minSessions', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          {/* 6. Weekly Availability Day */}
          <div className="space-y-2 border-t border-border/40 pt-4">
            <label className="block text-label-lbl font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Availability Day</span>
            </label>
            <select
              className="w-full bg-background border border-border rounded-xl text-metadata font-bold text-foreground focus:ring-1 focus:ring-primary focus:border-primary px-3 py-2 mt-1 outline-none cursor-pointer"
              value={filters.availability || ''}
              onChange={(e) => handleChange('availability', e.target.value || undefined)}
            >
              <option value="">Any Day</option>
              {DAYS_OF_WEEK.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* 7. Quick Checks (Beginner Friendly, Top Rated, Active) */}
          <div className="space-y-2 border-t border-border/40 pt-4 flex flex-col gap-1.5 select-none">
            <label className="block text-label-lbl font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Quick Highlights
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-metadata font-semibold text-foreground/80 hover:text-foreground">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border bg-background cursor-pointer accent-primary"
                checked={filters.isBeginnerFriendly || false}
                onChange={(e) => handleChange('isBeginnerFriendly', e.target.checked)}
              />
              <span>Beginner Friendly</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-metadata font-semibold text-foreground/80 hover:text-foreground">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border bg-background cursor-pointer accent-primary"
                checked={filters.isTopRated || false}
                onChange={(e) => handleChange('isTopRated', e.target.checked)}
              />
              <span>Top Rated Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-metadata font-semibold text-foreground/80 hover:text-foreground">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-border bg-background cursor-pointer accent-primary"
                checked={filters.isMostActive || false}
                onChange={(e) => handleChange('isMostActive', e.target.checked)}
              />
              <span>Most Active Only</span>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'roadmaps' && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-label-lbl font-semibold text-muted-foreground uppercase tracking-wider">Domain</label>
            <select
              className="w-full bg-background border border-border rounded-xl text-metadata font-bold text-foreground focus:ring-1 focus:ring-primary focus:border-primary px-3 py-2 outline-none cursor-pointer"
              value={filters.domain || ''}
              onChange={(e) => handleChange('domain', e.target.value)}
            >
              <option value="">All Domains</option>
              {availableDomains.slice(0, 30).map((domain) => (
                <option key={domain.id} value={domain.id}>{domain.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="block text-label-lbl font-semibold text-muted-foreground uppercase tracking-wider">Max Duration (Weeks)</label>
            <input
              type="number"
              className="w-full bg-background border border-border rounded-xl text-metadata font-semibold text-foreground focus:ring-1 focus:ring-primary focus:border-primary px-3 py-2 outline-none"
              placeholder="e.g. 12"
              value={filters.maxEstimatedWeeks || ''}
              onChange={(e) => handleChange('maxEstimatedWeeks', e.target.value)}
            />
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-label-lbl font-semibold text-muted-foreground uppercase tracking-wider">Category</label>
            <select
              className="w-full bg-background border border-border rounded-xl text-metadata font-bold text-foreground focus:ring-1 focus:ring-primary focus:border-primary px-3 py-2 outline-none cursor-pointer"
              value={filters.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Question">Question</option>
              <option value="Discussion">Discussion</option>
              <option value="Showcase">Showcase</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 p-3 bg-muted/40 rounded-xl border border-border/60 mt-2 select-none">
            <input
              type="checkbox"
              id="isSolved"
              className="w-4 h-4 text-primary rounded focus:ring-primary/20 border-border bg-background cursor-pointer accent-primary"
              checked={filters.isSolved || false}
              onChange={(e) => handleChange('isSolved', e.target.checked)}
            />
            <label htmlFor="isSolved" className="text-metadata font-semibold text-foreground/90 cursor-pointer">
              Solved Posts Only
            </label>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => onFilterChange({})}
        className="w-full py-2.5 text-[11px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest border border-border/50 hover:border-border rounded-xl transition duration-200 cursor-pointer bg-background hover:bg-muted/30"
      >
        Reset All Filters
      </button>
    </div>
  );
};
