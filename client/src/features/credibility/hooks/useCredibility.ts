import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { credibilityApi } from '../api/credibility.api';
import type { PortfolioProject } from '../api/credibility.api';

export const usePortfolioProjects = (userId: string) =>
  useQuery({
    queryKey: ['portfolio', userId],
    queryFn: () => credibilityApi.getPortfolioProjects(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

export const useAchievements = (userId: string) =>
  useQuery({
    queryKey: ['achievements', userId],
    queryFn: () => credibilityApi.getAchievements(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

export const useEndorsements = (userId: string) =>
  useQuery({
    queryKey: ['endorsements', userId],
    queryFn: () => credibilityApi.getEndorsements(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });

export const usePublicProfileByUsername = (username: string) =>
  useQuery({
    queryKey: ['publicProfile', 'username', username],
    queryFn: () => credibilityApi.getPublicProfileByUsername(username),
    enabled: !!username,
    staleTime: 1000 * 60 * 5,
  });

export const usePublicProfile = (userId: string) =>
  useQuery({
    queryKey: ['publicProfile', userId],
    queryFn: () => credibilityApi.getPublicProfileById(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 3,
  });

export const useCreatePortfolioProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PortfolioProject>) => credibilityApi.createPortfolioProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
};

export const useDeletePortfolioProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => credibilityApi.deletePortfolioProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
};

export const useUpdatePortfolioProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PortfolioProject> }) =>
      credibilityApi.updatePortfolioProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
};

export const useCreateEndorsement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof credibilityApi.createEndorsement>[0]) =>
      credibilityApi.createEndorsement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endorsements'] });
    },
  });
};

export const useUpdateProfessionalProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof credibilityApi.updateProfessionalProfile>[0]) =>
      credibilityApi.updateProfessionalProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
    },
  });
};
