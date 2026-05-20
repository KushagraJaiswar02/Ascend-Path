import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

export interface DashboardData {
  recentPosts: any[];
  pendingPings: any[];
  upcomingSessions: any[];
}

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: async (): Promise<DashboardData> => {
      // Execute all requests in parallel
      const [postsRes, pingsRes, sessionsRes] = await Promise.allSettled([
        apiClient.get('/posts?limit=3'),
        apiClient.get('/pings/inbox'),
        apiClient.get('/sessions/me')
      ]);

      // Safely extract data, falling back to empty arrays if endpoints fail
      // (e.g. if the user has no sessions or if a feature isn't fully wired up yet)
      const recentPosts = postsRes.status === 'fulfilled' ? postsRes.value.data.data.posts : [];
      
      // Filter inbox pings for only 'pending'
      const allInboxPings = pingsRes.status === 'fulfilled' ? pingsRes.value.data.data.pings : [];
      const pendingPings = allInboxPings.filter((p: any) => p.status === 'pending').slice(0, 3);
      
      // Filter sessions for only 'scheduled'
      const allSessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value.data.data.sessions : [];
      const upcomingSessions = allSessions.filter((s: any) => s.status === 'scheduled').slice(0, 3);

      return {
        recentPosts: recentPosts.slice(0, 3), // Ensure max 3
        pendingPings,
        upcomingSessions
      };
    },
    // Cache for 5 minutes since dashboard data is a summary
    staleTime: 5 * 60 * 1000, 
  });
};
