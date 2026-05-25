import { useQuery } from '@tanstack/react-query';
import { taxonomyApi } from '../api';

export const useTaxonomyExplorer = () => {
  return useQuery({
    queryKey: ['taxonomy', 'explorer'],
    queryFn: taxonomyApi.explorer,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCareerGoals = () => {
  return useQuery({
    queryKey: ['taxonomy', 'goals'],
    queryFn: taxonomyApi.goals,
    staleTime: 10 * 60 * 1000,
  });
};
