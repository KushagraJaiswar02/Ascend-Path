import { apiClient } from '../../services/apiClient';
import type { CompanionHome } from './types';

export const companionApi = {
  async home() {
    const { data } = await apiClient.get('/companion/me');
    return data.data as CompanionHome;
  },

  async submitCheckIn(input: {
    confidenceLevel: number;
    hardestThing?: string;
    goalsChanged?: boolean;
    newGoalText?: string;
    pacingFeeling?: 'too_slow' | 'right' | 'too_fast' | 'overwhelmed';
    supportNeeded: string[];
  }) {
    const { data } = await apiClient.post('/companion/me/check-ins', input);
    return data.data;
  },

  async createJournalEntry(input: {
    entryType: 'reflection' | 'win' | 'setback' | 'note' | 'realization' | 'mentorship_takeaway';
    title: string;
    body: string;
    mood?: 'confident' | 'curious' | 'stuck' | 'uncertain' | 'motivated' | 'tired';
    tags: string[];
    relatedDomainIds: string[];
    isPrivate: boolean;
  }) {
    const { data } = await apiClient.post('/companion/me/journal', input);
    return data.data;
  },
};
