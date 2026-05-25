export interface PathwayConnection {
  id: string;
  sourceDomain: any;
  targetDomain: any;
  relationshipType: string;
  overlapStrength: number;
  requiredSkills: string[];
  opportunityOutcomes: string[];
  decisionSignals: string[];
  estimatedTimelineWeeks?: number;
  suggestedRoadmaps: any[];
}

export interface DomainHub {
  domain: any;
  overview: {
    title: string;
    description?: string;
    cluster?: any;
  };
  graph: {
    current: any;
    outgoing: PathwayConnection[];
    incoming: PathwayConnection[];
  };
  decisionGuidance: {
    headline: string;
    fitSignals: string[];
    difficultyExpectation: string;
    timeInvestment: string;
    skills: string[];
    outcomes: string[];
  };
  ecosystem: {
    roadmaps: any[];
    mentors: any[];
    sessions: any[];
    goals: any[];
  };
}

export interface UserJourney {
  currentPosition: {
    careerStage?: string;
    targetRole?: string;
    domains: string[];
    activeRoadmaps: any[];
  };
  possiblePaths: PathwayConnection[];
  nextRoadmaps: any[];
  nextStepNarrative: string;
}
