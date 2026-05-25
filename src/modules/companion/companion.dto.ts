export const toCompanionProfileDto = (profile: any) => ({
  id: profile?._id?.toString?.(),
  aspirations: profile?.aspirations || [],
  activeGoals: profile?.activeGoals || [],
  evolvingInterests: profile?.evolvingInterests || [],
  confidenceTrend: profile?.confidenceTrend,
  learningPatterns: profile?.learningPatterns,
  momentum: profile?.momentum,
  blockers: profile?.blockers || [],
  milestones: profile?.milestones || [],
  reflectionSummaries: profile?.reflectionSummaries,
  mentorshipHistory: profile?.mentorshipHistory || [],
  privacy: profile?.privacy,
});

export const adaptiveGuidanceFor = (profile: any) => {
  const momentum = profile?.momentum?.status;
  const confidence = profile?.confidenceTrend?.current;
  const blockers = (profile?.blockers || []).filter((blocker: any) => !blocker.resolvedAt);

  if (momentum === 'stalled' || blockers.some((blocker: any) => blocker.severity === 'high')) {
    return {
      tone: 'recovery',
      title: 'Restart with a smaller next step',
      message: 'Your recent pattern suggests friction. A shorter milestone or mentor check-in may help you regain motion without pressure.',
      nextActions: ['Pick one 20-minute task', 'Ask a mentor to simplify the path', 'Review a beginner refresher'],
    };
  }

  if (confidence && confidence <= 2) {
    return {
      tone: 'supportive',
      title: 'Build confidence before increasing difficulty',
      message: 'Your confidence is running low. Stay close to guided practice and small wins for now.',
      nextActions: ['Choose a beginner-friendly step', 'Book a clarifying session', 'Write one reflection about what feels unclear'],
    };
  }

  if (momentum === 'building' && confidence && confidence >= 4) {
    return {
      tone: 'growth',
      title: 'You are ready for a stretch path',
      message: 'Your momentum and confidence look strong. Consider a specialization, advanced workshop, or community contribution.',
      nextActions: ['Explore an adjacent pathway', 'Try an advanced roadmap', 'Share a learning note with the community'],
    };
  }

  return {
    tone: 'steady',
    title: 'Keep a sustainable rhythm',
    message: 'Your journey is moving. The best next step is one that fits your pace and keeps direction clear.',
    nextActions: ['Continue your active roadmap', 'Capture one learning takeaway', 'Review possible next paths'],
  };
};
