import React, { useState } from 'react';
import { useCreatePing } from '../hooks/useCreatePing';

interface CreatePingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePingModal: React.FC<CreatePingModalProps> = ({ isOpen, onClose }) => {
  const [receiverId, setReceiverId] = useState('');
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const createPingMutation = useCreatePing();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (question.trim().length < 10) {
      setErrorMsg('Question must be at least 10 characters long');
      return;
    }

    createPingMutation.mutate(
      { receiverId, question, context },
      {
        onSuccess: () => {
          setReceiverId('');
          setQuestion('');
          setContext('');
          onClose();
        },
        onError: (error: any) => {
          if (error.response?.data?.errors) {
            setErrorMsg(error.response.data.errors.map((err: any) => err.message).join(', '));
          } else {
            setErrorMsg(error.response?.data?.error || 'Failed to send ping.');
          }
        }
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Send a Direct Ping</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold">&times;</button>
        </div>
        
        <div className="p-6">
          {errorMsg && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Guide ID (Temporary manual input)</label>
              <input 
                type="text" 
                required
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 64b8f... (User Object ID)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Question</label>
              <textarea 
                required
                minLength={10}
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="What specific advice do you need?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Context (Optional)</label>
              <textarea 
                rows={2}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Any background information?"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={createPingMutation.isPending}
                className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {createPingMutation.isPending ? 'Sending...' : 'Send Ping'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
