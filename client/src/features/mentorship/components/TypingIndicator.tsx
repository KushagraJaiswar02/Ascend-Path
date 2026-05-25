export const TypingIndicator = ({ name }: { name?: string }) => (
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <span>{name || 'Mentor'} is typing</span>
    <span className="flex gap-1">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary delay-100" />
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary delay-200" />
    </span>
  </div>
);
