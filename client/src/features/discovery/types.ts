export interface SearchGuidesParams {
  q?: string;
  domain?: string;
  minFameScore?: number;
  isFree?: boolean;
  page?: number;
}

export interface SearchRoadmapsParams {
  q?: string;
  domain?: string;
  maxEstimatedWeeks?: number;
  page?: number;
}

export interface SearchPostsParams {
  q?: string;
  category?: string;
  isSolved?: boolean;
  page?: number;
}
