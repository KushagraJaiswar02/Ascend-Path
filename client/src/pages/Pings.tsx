import React, { useState } from 'react';
import { PingInbox } from '../features/pings/components/PingInbox';
import { PingSent } from '../features/pings/components/PingSent';
import { CreatePingModal } from '../features/pings/components/CreatePingModal';

export const Pings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Direct Pings</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
        >
          + Send Ping
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'inbox' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Inbox
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'sent' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Sent
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'inbox' ? <PingInbox /> : <PingSent />}
      </div>

      {/* Modal */}
      <CreatePingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};
