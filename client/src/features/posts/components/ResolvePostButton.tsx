import React from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResolvePostButtonProps {
  accepted?: boolean;
  disabled?: boolean;
  onAccept?: () => void;
  onUnaccept?: () => void;
}

export const ResolvePostButton: React.FC<ResolvePostButtonProps> = ({ accepted, disabled, onAccept, onUnaccept }) => {
  if (accepted) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={onUnaccept}
        className="h-6 px-2 text-[10px] border-border text-muted-foreground"
        title="Remove accepted answer"
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        Unaccept
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={onAccept}
      className="h-6 px-2 text-[10px] border-success/30 text-success hover:bg-success/10 hover:text-success"
      title="Accept this answer"
    >
      <CheckCircle2 className="h-3 w-3 mr-1" />
      Accept
    </Button>
  );
};
