import React from 'react';

interface GuideCardProps {
  guide: any;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold border-2 border-white shadow-sm">
            {guide.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 group-hover:text-blue-600 transition">{guide.name}</h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{guide.domain || 'Expert Mentor'}</span>
          </div>
        </div>
        
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
            <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fame Score</span>
            <span className="text-lg font-black text-gray-900">{guide.fameScore || 0}</span>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
            <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Respect</span>
            <span className="text-lg font-black text-gray-900">{guide.respectPoints || 0}</span>
          </div>
        </div>

        <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-sm hover:shadow-md">
          View Profile
        </button>
      </div>
    </div>
  );
};
