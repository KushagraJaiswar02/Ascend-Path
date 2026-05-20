import React, { useState } from 'react';
import { useRespondPing } from '../hooks/useRespondPing';

interface PingResponseFormProps {
  pingId: string;
}

export const PingResponseForm: React.FC<PingResponseFormProps> = ({ pingId }) => {
  const [response, setResponse] = useState('');
  const respondMutation = useRespondPing();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) return;

    respondMutation.mutate(
      { pingId, response },
      {
        onSuccess: () => {
          setResponse('');
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t pt-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">Provide your response</label>
      <textarea 
        placeholder="Type your answer here..." 
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        required
        minLength={10}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mb-2"
      />
      <button 
        type="submit" 
        disabled={respondMutation.isPending || response.trim().length < 10}
        className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
      >
        {respondMutation.isPending ? 'Sending...' : 'Send Response'}
      </button>
    </form>
  );
};
