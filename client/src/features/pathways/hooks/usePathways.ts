import { useQuery } from '@tanstack/react-query';
import { pathwayApi } from '../api';

export const useDomainHub = (slug?: string) => {
  return useQuery({
    queryKey: ['pathways', 'domain', slug],
    queryFn: () => pathwayApi.domainHub(slug || ''),
    enabled: Boolean(slug),
    staleTime: 10 * 60 * 1000,
  });
};

export const useMyCareerJourney = () => {
  return useQuery({
    queryKey: ['pathways', 'me', 'journey'],
    queryFn: pathwayApi.myJourney,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};
