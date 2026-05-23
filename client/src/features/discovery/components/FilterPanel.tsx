import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, LayoutGrid, Calendar, Sliders, CheckCircle2, UserCheck, Flame } from 'lucide-react';

interface FilterPanelProps {
  activeTab: 'guides' | 'roadmaps' | 'posts';
  filters: any;
  onFilterChange: (newFilters: any) => void;
}

const AVAILABLE_DOMAINS = [
  'Frontend Development',
  'Backend Development',
  'DevOps',
  'System Design',
  'UI/UX Design',
];

const AVAILABLE_SKILLS = [
  'React',
  'Node.js',
  'MongoDB',
  'Docker',
  'Kubernetes',
  'Figma',
  'TailwindCSS',
];

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
    <div className="bg-card border border-border/80 p-md sm:p-lg rounded-2xl shadow-subtle space-y-md sm:space-y-lg select-none">
      <div className="flex items-center gap-xs pb-sm border-b border-border/40">
        <Sliders className="h-4.5 w-4.5 text-primary shrink-0" />
        <h3 className="text-body-md font-black text-foreground">Discovery Filters</h3>
      </div>

      {activeTab === 'guides' && (
        <div className="space-y-md sm:space-y-lg">
          {/* 1. Domains Multi-select */}
          <div className="space-y-xs">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-xxs">
              <LayoutGrid className="h-3.5 w-3.5 text-primary" />
              <span>Expert Domains</span>
            </label>
            <div className="flex flex-col gap-xxs pt-xxs">
              {AVAILABLE_DOMAINS.map((domain) => {
                const isSelected = (filters.domains || []).includes(domain);
                return (
                  <label key={domain} className="flex items-center gap-xs cursor-pointer text-body-xs font-semibold text-foreground/80 hover:text-foreground">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary focus:ring-primary/45 border-border bg-background cursor-pointer"
                      checked={isSelected}
                      onChange={() => handleArrayToggle('domains', domain)}
                    />
                    <span>{domain}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 2. Skills Multi-select */}
          <div className="space-y-xs border-t border-border/40 pt-md">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-xxs">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span>Granular Technologies</span>
            </label>
            <div className="flex flex-wrap gap-xxs pt-xxs">
              {AVAILABLE_SKILLS.map((skill) => {
                const isSelected = (filters.skills || []).includes(skill);
                return (
                  <Badge
                    key={skill}
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => handleArrayToggle('skills', skill)}
                    className={`cursor-pointer px-sm py-[3px] rounded-full text-[10px] font-bold shadow-sm transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-primary/20'
                        : 'bg-background text-foreground border-border/80 hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    {skill}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* 3. Minimum Star Rating */}
          <div className="space-y-xs border-t border-border/40 pt-md">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-xxs">
              <Star className="h-3.5 w-3.5 text-primary" />
              <span>Minimum Star Rating</span>
            </label>
            <select
              className="w-full bg-background border border-border/80 rounded-xl text-body-xs font-bold text-foreground focus:ring-primary focus:border-primary px-sm py-xs mt-xxs outline-none cursor-pointer"
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
          <div className="space-y-xs border-t border-border/40 pt-md">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-xxs">
              <Flame className="h-3.5 w-3.5 text-primary fill-primary/5" />
              <span>Min Fame Score: {filters.minFameScore || 0}+</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="10"
              className="w-full h-1.5 bg-muted border border-border/40 rounded-lg appearance-none cursor-pointer accent-primary mt-xs"
              value={filters.minFameScore || 0}
              onChange={(e) => handleChange('minFameScore', Number(e.target.value))}
            />
          </div>

          {/* 5. Minimum Sessions Completed */}
          <div className="space-y-xs border-t border-border/40 pt-md">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-xxs">
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              <span>Min Sessions Completed</span>
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 5"
              className="w-full bg-background border border-border/80 rounded-xl text-body-xs font-bold text-foreground focus:ring-primary focus:border-primary px-sm py-xs outline-none"
              value={filters.minSessions || ''}
              onChange={(e) => handleChange('minSessions', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>

          {/* 6. Weekly Availability Day */}
          <div className="space-y-xs border-t border-border/40 pt-md">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-xxs">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Availability Day</span>
            </label>
            <select
              className="w-full bg-background border border-border/80 rounded-xl text-body-xs font-bold text-foreground focus:ring-primary focus:border-primary px-sm py-xs mt-xxs outline-none cursor-pointer"
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
          <div className="space-y-xxs border-t border-border/40 pt-md flex flex-col gap-xxs select-none">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-xs">
              Quick Highlights
            </label>
            <label className="flex items-center gap-xs cursor-pointer text-body-xs font-semibold text-foreground/80 hover:text-foreground">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-primary focus:ring-primary/45 border-border bg-background cursor-pointer"
                checked={filters.isBeginnerFriendly || false}
                onChange={(e) => handleChange('isBeginnerFriendly', e.target.checked)}
              />
              <span>Beginner Friendly</span>
            </label>
            <label className="flex items-center gap-xs cursor-pointer text-body-xs font-semibold text-foreground/80 hover:text-foreground">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-primary focus:ring-primary/45 border-border bg-background cursor-pointer"
                checked={filters.isTopRated || false}
                onChange={(e) => handleChange('isTopRated', e.target.checked)}
              />
              <span>Top Rated Only</span>
            </label>
            <label className="flex items-center gap-xs cursor-pointer text-body-xs font-semibold text-foreground/80 hover:text-foreground">
              <input
                type="checkbox"
                className="w-4 h-4 rounded text-primary focus:ring-primary/45 border-border bg-background cursor-pointer"
                checked={filters.isMostActive || false}
                onChange={(e) => handleChange('isMostActive', e.target.checked)}
              />
              <span>Most Active Only</span>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'roadmaps' && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Domain</label>
            <select
              className="w-full bg-background border border-border/80 rounded-xl text-body-xs font-bold text-foreground focus:ring-primary focus:border-primary px-sm py-xs outline-none cursor-pointer"
              value={filters.domain || ''}
              onChange={(e) => handleChange('domain', e.target.value)}
            >
              <option value="">All Domains</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Mobile">Mobile</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Max Duration (Weeks)</label>
            <input
              type="number"
              className="w-full bg-background border border-border/80 rounded-xl text-body-xs font-bold text-foreground focus:ring-primary focus:border-primary px-sm py-xs outline-none"
              placeholder="e.g. 12"
              value={filters.maxEstimatedWeeks || ''}
              onChange={(e) => handleChange('maxEstimatedWeeks', e.target.value)}
            />
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Category</label>
            <select
              className="w-full bg-background border border-border/80 rounded-xl text-body-xs font-bold text-foreground focus:ring-primary focus:border-primary px-sm py-xs outline-none cursor-pointer"
              value={filters.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Question">Question</option>
              <option value="Discussion">Discussion</option>
              <option value="Showcase">Showcase</option>
            </select>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/60">
            <input
              type="checkbox"
              id="isSolved"
              className="w-4 h-4 text-primary rounded focus:ring-primary/45 border-border bg-background cursor-pointer"
              checked={filters.isSolved || false}
              onChange={(e) => handleChange('isSolved', e.target.checked)}
            />
            <label htmlFor="isSolved" className="text-sm font-semibold text-foreground/85 cursor-pointer">
              Solved Posts Only
            </label>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => onFilterChange({})}
        className="w-full py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest border border-border/40 hover:border-border rounded-xl transition duration-200"
      >
        Reset All Filters
      </button>
    </div>
  );
};
