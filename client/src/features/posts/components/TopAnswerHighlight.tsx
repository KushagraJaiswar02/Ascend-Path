import React, { type ReactNode } from 'react';

interface TopAnswerHighlightProps {
  active?: boolean;
  children: ReactNode;
}

export const TopAnswerHighlight: React.FC<TopAnswerHighlightProps> = ({ active, children }) => (
  <div className={active ? 'rounded-md border-l-4 border-l-success bg-success/5 shadow-subtle' : undefined}>
    {children}
  </div>
);
