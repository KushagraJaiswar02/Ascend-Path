import React, { useState } from 'react';
import type { Ping } from '../types';
import { PingResponseForm } from './PingResponseForm';
import { useRatePing } from '../hooks/useRatePing';

interface PingCardProps {
  ping: Ping;
  type: 'inbox' | 'sent';
}

export const PingCard: React.FC<PingCardProps> = ({ ping, type }) => {
  const [rating, setRating] = useState<number>(5);
  const rateMutation = useRatePing();

  const handleRate = (e: React.FormEvent) => {
    e.preventDefault();
    rateMutation.mutate({ pingId: ping._id, rating });
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    answered: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white p-5 rounded shadow-sm border border-gray-200 mb-4">
      <div className="flex justify-between items-start mb-4 border-b pb-4">
        <div>
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded uppercase ${statusColors[ping.status]}`}>
            {ping.status}
          </span>
          <div className="mt-2 text-sm text-gray-500">
            {type === 'inbox' 
              ? <>From: <span className="font-semibold text-gray-700">{ping.senderId.name}</span></>
              : <>To: <span className="font-semibold text-gray-700">{ping.receiverId.name}</span></>
            }
          </div>
        </div>
        <div className="text-xs text-gray-400">
          {new Date(ping.createdAt).toLocaleDateString()}
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 mb-1">Question:</h3>
        <p className="text-gray-700 whitespace-pre-wrap">{ping.question}</p>
        {ping.context && (
          <p className="text-sm text-gray-500 mt-2 italic bg-gray-50 p-2 rounded">
            Context: {ping.context}
          </p>
        )}
      </div>

      {/* Receiver View (Inbox) */}
      {type === 'inbox' && ping.status === 'pending' && (
        <PingResponseForm pingId={ping._id} />
      )}

      {/* Answered State (Both) */}
      {(ping.status === 'answered' || ping.status === 'closed') && ping.response && (
        <div className="mt-4 border-t pt-4 bg-blue-50/50 -mx-5 -mb-5 p-5 rounded-b">
          <h3 className="font-bold text-blue-800 mb-1">Response:</h3>
          <p className="text-gray-800 whitespace-pre-wrap mb-4">{ping.response}</p>
          
          {/* Rating Form for Sender */}
          {type === 'sent' && ping.status === 'answered' && !ping.rating && (
            <form onSubmit={handleRate} className="flex items-center gap-3 mt-4 border-t border-blue-100 pt-4">
              <label className="text-sm font-semibold text-gray-700">Rate this response:</label>
              <select 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
              </select>
              <button 
                type="submit"
                disabled={rateMutation.isPending}
                className="bg-yellow-500 text-white px-3 py-1 rounded font-bold hover:bg-yellow-600 text-sm disabled:opacity-50"
              >
                {rateMutation.isPending ? 'Rating...' : 'Submit Rating'}
              </button>
            </form>
          )}

          {/* Rating Display */}
          {ping.rating && (
            <div className="mt-2 text-sm font-semibold text-yellow-600">
              Rated: {ping.rating} / 5 Stars
            </div>
          )}
        </div>
      )}
    </div>
  );
};
