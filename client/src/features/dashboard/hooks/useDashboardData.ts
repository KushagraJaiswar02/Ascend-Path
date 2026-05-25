import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { SessionReflection } from '../../sessions/types';
import type { RoadmapMomentumItem, TrendingRoadmapSignal } from '../../roadmaps/types';
import { safeParsePings } from '../../pings/types';
import type { RecommendationResponseV2 } from '../../recommendations/types';
import type { UserJourney } from '../../pathways/types';
import type { CompanionHome } from '../../companion/types';


export interface DashboardData {
  recentPosts: any[];
  pendingPings: any[];
  upcomingSessions: any[];
  mentorRecommendations: SessionReflection[];
  pendingReflections: SessionReflection[];
  roadmapMomentum: RoadmapMomentumItem[];
  trendingRoadmaps: TrendingRoadmapSignal[];
  contextualRecommendations?: RecommendationResponseV2;
  careerJourney?: UserJourney;
  companion?: CompanionHome;
}

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboardData'],
    queryFn: async (): Promise<DashboardData> => {
      // Execute all requests in parallel
      const [postsRes, pingsRes, sessionsRes, reflectionsRes, momentumRes, trendingRes, recommendationRes, journeyRes, companionRes] = await Promise.allSettled([
        apiClient.get('/posts?limit=3'),
        apiClient.get('/pings/inbox'),
        apiClient.get('/sessions/me'),
        apiClient.get('/me/reflections?limit=8'),
        apiClient.get('/me/roadmaps/momentum'),
        apiClient.get('/roadmaps/trending?limit=4'),
        apiClient.get('/recommendations/me', { params: { context: 'dashboard', limit: 4 } }),
        apiClient.get('/pathways/me/journey'),
        apiClient.get('/companion/me')
      ]);

      // Safely extract data, falling back to empty arrays if endpoints fail
      // (e.g. if the user has no sessions or if a feature isn't fully wired up yet)
      const recentPosts = postsRes.status === 'fulfilled' ? postsRes.value.data.data.posts : [];
      
      // Filter inbox pings for only 'pending'
      const allInboxPings = pingsRes.status === 'fulfilled' ? safeParsePings(pingsRes.value.data.data.pings) : [];
      const pendingPings = allInboxPings.filter((p: any) => p.status === 'pending').slice(0, 3);
      
      // Surface live and upcoming execution sessions first.
      const allSessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value.data.data.sessions : [];
      const upcomingSessions = allSessions
        .filter((s: any) => s.status === 'booked' || ['waiting', 'active'].includes(s.attendanceStatus))
        .sort((a: any, b: any) => {
          const aLive = ['waiting', 'active'].includes(a.attendanceStatus) ? 0 : 1;
          const bLive = ['waiting', 'active'].includes(b.attendanceStatus) ? 0 : 1;
          return aLive - bLive || new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
        })
        .slice(0, 3);
      const reflections = reflectionsRes.status === 'fulfilled' ? reflectionsRes.value.data.data.reflections : [];
      const mentorRecommendations = reflections.filter((r: SessionReflection) => r.mentorFollowup?.submittedAt).slice(0, 3);
      const pendingReflections = reflections.filter((r: SessionReflection) => !r.menteeReflection?.submittedAt).slice(0, 3);
      const roadmapMomentum = momentumRes.status === 'fulfilled' ? momentumRes.value.data.data.momentum : [];
      const trendingRoadmaps = trendingRes.status === 'fulfilled' ? trendingRes.value.data.data.roadmaps : [];
      const contextualRecommendations = recommendationRes.status === 'fulfilled' ? recommendationRes.value.data.data : undefined;
      const careerJourney = journeyRes.status === 'fulfilled' ? journeyRes.value.data.data : undefined;
      const companion = companionRes.status === 'fulfilled' ? companionRes.value.data.data : undefined;

      return {
        recentPosts: recentPosts.slice(0, 3), // Ensure max 3
        pendingPings,
        upcomingSessions,
        mentorRecommendations,
        pendingReflections,
        roadmapMomentum,
        trendingRoadmaps,
        contextualRecommendations,
        careerJourney,
        companion
      };
    },
    // Cache for 5 minutes since dashboard data is a summary
    staleTime: 5 * 60 * 1000, 
  });
};
