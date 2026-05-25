import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MentorshipMessage } from '../types';

export const MessageBubble = ({ message, isMine }: { message: MentorshipMessage; isMine: boolean }) => (
  <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
    <div className={cn('max-w-[78%] rounded-lg border px-4 py-3 shadow-subtle', isMine ? 'border-primary/20 bg-primary text-primary-foreground' : 'border-border bg-card')}>
      {message.messageType !== 'text' && (
        <Badge variant={message.messageType === 'session-request' ? 'warning' : 'secondary'} className="mb-2 text-[10px]">
          {message.messageType.replace('-', ' ')}
        </Badge>
      )}
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
      <p className={cn('mt-2 text-[10px]', isMine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
        {new Date(message.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </div>
);
