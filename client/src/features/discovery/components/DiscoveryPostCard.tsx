import React from 'react';
import { Link } from 'react-router-dom';

interface DiscoveryPostCardProps {
  post: any;
}

export const DiscoveryPostCard: React.FC<DiscoveryPostCardProps> = ({ post }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded uppercase border border-green-100 tracking-widest">
            {post.category}
          </span>
          {post.isSolved && (
            <span className="flex items-center gap-1 text-[10px] font-black text-green-700 uppercase tracking-widest">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
              Solved
            </span>
          )}
        </div>
        
        <Link to={`/forum/${post._id}`} className="block">
          <h3 className="text-lg font-black text-gray-900 mb-3 group-hover:text-green-600 transition line-clamp-2">
            {post.title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">By {post.authorId?.name}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.505 7.01c-.396.792-1.2 1.306-2.091 1.306H10c-1.104 0-2-.896-2-2v-7a2 2 0 01.586-1.414l5-5a2 2 0 013 3l-1.5 3z" /></svg>
              {post.upvotes}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              {post.repliesCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
