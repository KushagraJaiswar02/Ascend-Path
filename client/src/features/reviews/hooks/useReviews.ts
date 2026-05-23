import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

export interface StarDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface TagDistribution {
  tag: string;
  count: number;
}

export interface RatingBreakdownData {
  averageRating: number;
  totalReviews: number;
  starDistribution: StarDistribution;
  tagsDistribution: TagDistribution[];
}

export interface GuideReviewsResponse {
  reviews: any[];
  total: number;
  page: number;
  totalPages: number;
  breakdown: RatingBreakdownData;
}

/**
 * Hook to fetch paginated reviews feed and aggregated ratings metrics for a Guide.
 */
export const useGuideReviews = (guideId: string, page = 1, limit = 5) => {
  return useQuery<GuideReviewsResponse>({
    queryKey: ['guideReviews', guideId, page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get(`/guides/${guideId}/reviews`, {
        params: { page, limit },
      });
      return data.data;
    },
    enabled: !!guideId,
    staleTime: 2 * 60 * 1000, // 2 mins cache
  });
};

/**
 * Mutation to submit a verified session review.
 */
export const useSubmitReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      sessionId: string;
      rating: number;
      reviewText: string;
      tags?: string[];
    }) => {
      const { data } = await apiClient.post('/reviews', payload);
      return data.data;
    },
    onSuccess: () => {
      // Invalidate both reviews list and guide profile caches to trigger full sync
      queryClient.invalidateQueries({ queryKey: ['guideReviews'] });
      queryClient.invalidateQueries({ queryKey: ['guideProfile'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

/**
 * Mutation to edit an existing review.
 */
export const useEditReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reviewId,
      payload,
    }: {
      reviewId: string;
      payload: {
        rating?: number;
        reviewText?: string;
        tags?: string[];
      };
    }) => {
      const { data } = await apiClient.patch(`/reviews/${reviewId}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guideReviews'] });
      queryClient.invalidateQueries({ queryKey: ['guideProfile'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

/**
 * Mutation to delete a review.
 */
export const useDeleteReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { data } = await apiClient.delete(`/reviews/${reviewId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guideReviews'] });
      queryClient.invalidateQueries({ queryKey: ['guideProfile'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

/**
 * Mutation to report a review for abusive content.
 */
export const useReportReviewMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, reason }: { reviewId: string; reason: string }) => {
      const { data } = await apiClient.post(`/reviews/${reviewId}/report`, { reason });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guideReviews'] });
    },
  });
};
