import React, { useState } from 'react';
import { PingInbox } from '../features/pings/components/PingInbox';
import { PingSent } from '../features/pings/components/PingSent';
import { CreatePingModal } from '../features/pings/components/CreatePingModal';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Mail, Send, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Pings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent'>('inbox');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <PageContainer size="default">
      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60 mb-6 gap-4 select-none">
        <div className="space-y-1">
          <h1 className="text-page-title text-foreground tracking-tight">
            Direct Pings
          </h1>
          <p className="text-body-p text-muted-foreground leading-normal">
            Ask targeted questions directly to expert guides, track pending responses, and build your curriculum momentum.
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="font-bold gap-1.5 self-start sm:self-center shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Send Direct Ping</span>
        </Button>
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-border/60 mb-6 select-none">
        <button
          onClick={() => setActiveTab('inbox')}
          className={cn(
            "px-6 py-3 font-semibold text-metadata border-b-2 transition-all duration-200 gap-2 inline-flex items-center cursor-pointer",
            activeTab === 'inbox' 
              ? 'border-primary text-primary font-bold bg-primary/[2%] dark:bg-primary/[4%]' 
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
          )}
        >
          <Mail className="h-4 w-4 shrink-0" />
          <span>Incoming Inbox</span>
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={cn(
            "px-6 py-3 font-semibold text-metadata border-b-2 transition-all duration-200 gap-2 inline-flex items-center cursor-pointer",
            activeTab === 'sent' 
              ? 'border-primary text-primary font-bold bg-primary/[2%] dark:bg-primary/[4%]' 
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
          )}
        >
          <Send className="h-4 w-4 shrink-0" />
          <span>Sent Pings</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'inbox' ? <PingInbox /> : <PingSent />}
      </div>

      {/* Modal */}
      <CreatePingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </PageContainer>
  );
};
