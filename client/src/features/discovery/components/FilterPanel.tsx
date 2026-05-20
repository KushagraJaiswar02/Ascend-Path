import React from 'react';

interface FilterPanelProps {
  activeTab: 'guides' | 'roadmaps' | 'posts';
  filters: any;
  onFilterChange: (newFilters: any) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ activeTab, filters, onFilterChange }) => {
  const handleChange = (name: string, value: any) => {
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-8">
      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4">Filters</h3>

      {activeTab === 'guides' && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Domain</label>
            <select
              className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              value={filters.domain || ''}
              onChange={(e) => handleChange('domain', e.target.value)}
            >
              <option value="">All Domains</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Mobile">Mobile</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Min Fame Score</label>
            <input
              type="range"
              min="0"
              max="500"
              step="50"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              value={filters.minFameScore || 0}
              onChange={(e) => handleChange('minFameScore', parseInt(e.target.value))}
            />
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
              <span>0</span>
              <span>{filters.minFameScore || 0}+</span>
              <span>500</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <input
              type="checkbox"
              id="isFree"
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              checked={filters.isFree || false}
              onChange={(e) => handleChange('isFree', e.target.checked)}
            />
            <label htmlFor="isFree" className="text-sm font-semibold text-blue-800 cursor-pointer">
              Show Free Sessions Only
            </label>
          </div>
        </div>
      )}

      {activeTab === 'roadmaps' && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Domain</label>
            <select
              className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm"
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
              className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm"
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
              className="w-full bg-gray-50 border-gray-200 rounded-lg text-sm"
              value={filters.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Question">Question</option>
              <option value="Discussion">Discussion</option>
              <option value="Showcase">Showcase</option>
            </select>
          </div>

          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
            <input
              type="checkbox"
              id="isSolved"
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              checked={filters.isSolved || false}
              onChange={(e) => handleChange('isSolved', e.target.checked)}
            />
            <label htmlFor="isSolved" className="text-sm font-semibold text-green-800 cursor-pointer">
              Solved Posts Only
            </label>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => onFilterChange({})}
        className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition"
      >
        Reset All Filters
      </button>
    </div>
  );
};
