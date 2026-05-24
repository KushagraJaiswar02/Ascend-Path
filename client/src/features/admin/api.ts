import { apiClient } from '../../services/apiClient';

export const adminApi = {
  async getStats() {
    const { data } = await apiClient.get('/admin/stats');
    return data.data;
  },

  async getAnalytics() {
    const { data } = await apiClient.get('/admin/analytics');
    return data.data;
  },

  async getHealth() {
    const { data } = await apiClient.get('/admin/health');
    return data.data;
  },

  async getReports(params: Record<string, string | number | undefined>) {
    const { data } = await apiClient.get('/moderation', { params });
    return data.data;
  },

  async actionReport(reportId: string, payload: { status: string; resolution?: string }) {
    const { data } = await apiClient.put(`/moderation/${reportId}`, payload);
    return data.data;
  },

  async assignReport(reportId: string) {
    const { data } = await apiClient.patch(`/moderation/${reportId}/assign`, {});
    return data.data;
  },

  async bulkAction(payload: { reportIds: string[]; action: string; payload?: Record<string, unknown> }) {
    const { data } = await apiClient.post('/moderation/bulk', payload);
    return data.data;
  },

  async hideContent(payload: { targetType: string; targetId: string; reason: string }) {
    const { data } = await apiClient.post('/moderation/content/hide', payload);
    return data.data;
  },

  async softDeleteContent(payload: { targetType: string; targetId: string; reason: string }) {
    const { data } = await apiClient.post('/moderation/content/delete', payload);
    return data.data;
  },

  async suspendUser(userId: string, payload: { days: number; reason: string }) {
    const { data } = await apiClient.post(`/moderation/users/${userId}/suspend`, payload);
    return data.data;
  },

  async adjustReputation(userId: string, payload: { delta: number; reason: string }) {
    const { data } = await apiClient.post(`/moderation/users/${userId}/reputation`, payload);
    return data.data;
  },

  async getUsers(params: Record<string, string | number | undefined>) {
    const { data } = await apiClient.get('/admin/users', { params });
    return data.data;
  },

  async getAuditLogs(params: Record<string, string | number | undefined>) {
    const { data } = await apiClient.get('/admin/audit-logs', { params });
    return data.data;
  },
};
