import React from 'react';

interface RoadmapCardProps {
  roadmap: any;
}

export const RoadmapCard: React.FC<RoadmapCardProps> = ({ roadmap }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-black rounded uppercase border border-purple-100 tracking-widest">
            {roadmap.domain}
          </span>
          <span className="text-xs font-bold text-gray-400 italic">{roadmap.estimatedWeeks} weeks</span>
        </div>
        
        <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-purple-600 transition leading-tight">
          {roadmap.title}
        </h3>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10">
          {roadmap.description}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200"></div>
            <span className="text-xs font-bold text-gray-600">{roadmap.creatorId?.name || 'Curator'}</span>
          </div>
          <button className="text-sm font-black text-purple-600 hover:text-purple-800 transition uppercase tracking-widest">
            Explore &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
