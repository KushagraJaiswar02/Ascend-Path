import { apiClient } from '../../services/apiClient';
import type { DomainHub, UserJourney } from './types';

export const pathwayApi = {
  async domainHub(slug: string) {
    const { data } = await apiClient.get(`/pathways/domains/${slug}`);
    return data.data as DomainHub;
  },

  async myJourney() {
    const { data } = await apiClient.get('/pathways/me/journey');
    return data.data as UserJourney;
  },
};
