import React from 'react';
import { usePingsInbox } from '../hooks/usePingsInbox';
import { PingCard } from './PingCard';

export const PingInbox: React.FC = () => {
  const { data: pings, isLoading, isError } = usePingsInbox();

  if (isLoading) return <div className="text-gray-500 py-8 text-center">Loading inbox...</div>;
  if (isError) return <div className="text-red-500 py-8 text-center">Failed to load inbox.</div>;

  if (!pings || pings.length === 0) {
    return <div className="text-gray-500 py-8 text-center bg-gray-50 rounded border border-dashed">Your inbox is empty.</div>;
  }

  return (
    <div className="space-y-4">
      {pings.map((ping) => (
        <PingCard key={ping._id} ping={ping} type="inbox" />
      ))}
    </div>
  );
};
