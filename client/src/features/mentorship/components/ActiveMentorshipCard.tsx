import { Link } from 'react-router-dom';
import { MessageCircleHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const ActiveMentorshipCard = ({ preview }: { preview?: string }) => (
  <Card className="border border-border">
    <CardContent className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <MessageCircleHeart className="h-5 w-5 text-primary" />
        <h2 className="font-bold text-foreground">Active mentorship</h2>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {preview || 'Start with one async mentor question. Live sessions unlock when the conversation needs deeper context.'}
      </p>
      <Button asChild className="mt-4" variant="outline">
        <Link to="/messages">Open messages</Link>
      </Button>
    </CardContent>
  </Card>
);
