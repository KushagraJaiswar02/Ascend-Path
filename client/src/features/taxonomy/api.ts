import { apiClient } from '../../services/apiClient';
import type { CareerCluster, CareerDomain, CareerGoal, TaxonomyExplorerResponse } from './types';

export const taxonomyApi = {
  async clusters() {
    const { data } = await apiClient.get('/taxonomy/clusters');
    return data.data as CareerCluster[];
  },

  async domains(params?: { clusterId?: string; q?: string }) {
    const { data } = await apiClient.get('/taxonomy/domains', { params });
    return data.data as CareerDomain[];
  },

  async goals() {
    const { data } = await apiClient.get('/taxonomy/goals');
    return data.data as CareerGoal[];
  },

  async explorer() {
    const { data } = await apiClient.get('/taxonomy/explorer');
    return data.data as TaxonomyExplorerResponse;
  },
};
