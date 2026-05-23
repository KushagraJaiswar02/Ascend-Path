export interface SearchGuidesParams {
  search?: string;
  domains?: string; // Comma-separated list
  skills?: string; // Comma-separated list
  minRating?: number;
  minFameScore?: number;
  minSessions?: number;
  isBeginnerFriendly?: boolean;
  isTopRated?: boolean;
  isMostActive?: boolean;
  availability?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
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
