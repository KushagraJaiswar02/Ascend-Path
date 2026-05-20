import React from 'react';
import { usePingsSent } from '../hooks/usePingsSent';
import { PingCard } from './PingCard';

export const PingSent: React.FC = () => {
  const { data: pings, isLoading, isError } = usePingsSent();

  if (isLoading) return <div className="text-gray-500 py-8 text-center">Loading sent pings...</div>;
  if (isError) return <div className="text-red-500 py-8 text-center">Failed to load sent pings.</div>;

  if (!pings || pings.length === 0) {
    return <div className="text-gray-500 py-8 text-center bg-gray-50 rounded border border-dashed">You haven't sent any pings yet.</div>;
  }

  return (
    <div className="space-y-4">
      {pings.map((ping) => (
        <PingCard key={ping._id} ping={ping} type="sent" />
      ))}
    </div>
  );
};
