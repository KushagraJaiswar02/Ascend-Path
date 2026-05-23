import { apiClient } from '../../services/apiClient';
import type { MentorApplicationPayload, MentorApplicationStatus } from './types';

export const mentorApplicationApi = {
  async getMine() {
    const { data } = await apiClient.get('/mentor-applications/me');
    return data.data;
  },

  async submit(payload: MentorApplicationPayload) {
    const { data } = await apiClient.post('/mentor-applications', payload);
    return data.data;
  },

  async updateMine(payload: Partial<MentorApplicationPayload>) {
    const { data } = await apiClient.patch('/mentor-applications/me', payload);
    return data.data;
  },

  async createUploadIntent(payload: { assetType: 'resume' | 'certification' | 'portfolio_asset'; fileName: string; mimeType: string; sizeBytes: number }) {
    const { data } = await apiClient.post('/mentor-applications/upload-intent', payload);
    return data.data;
  },

  async listAdmin(params: { status?: MentorApplicationStatus; search?: string; page?: number; limit?: number }) {
    const { data } = await apiClient.get('/admin/mentor-applications', { params });
    return data.data;
  },

  async getAdmin(id: string) {
    const { data } = await apiClient.get(`/admin/mentor-applications/${id}`);
    return data.data;
  },

  async updateStatus(id: string, payload: { status: MentorApplicationStatus; rejectionReason?: string; changeRequest?: string; internalNotes?: string }) {
    const { data } = await apiClient.patch(`/admin/mentor-applications/${id}/status`, payload);
    return data.data;
  },
};
