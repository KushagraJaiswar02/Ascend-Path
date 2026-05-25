import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { MentorshipConversation } from '../types';

export const ConversationPreviewCard = ({ conversation }: { conversation: MentorshipConversation }) => (
  <Card className="border border-border">
    <CardContent className="p-4">
      <p className="text-sm font-bold text-foreground">{conversation.mentorId?.name || conversation.menteeId?.name}</p>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{conversation.lastMessagePreview || 'Mentorship thread'}</p>
      <Link to={`/messages?conversation=${conversation._id}`} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
        Continue <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </CardContent>
  </Card>
);
