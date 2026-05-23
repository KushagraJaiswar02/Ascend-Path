import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu } from 'lucide-react';

interface SkillTagsProps {
  skills: any[];
}

export const SkillTags: React.FC<SkillTagsProps> = ({ skills = [] }) => {
  return (
    <Card className="border border-border bg-card shadow-subtle flex flex-col h-full hover:border-border/80 transition-all select-none">
      <CardHeader className="p-md pb-xs border-b border-border/50 bg-muted/10">
        <CardTitle className="text-body-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-xs">
          <Cpu className="h-4 w-4 text-primary shrink-0" />
          <span>Core Domain Skills</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-md sm:p-lg flex-grow flex flex-wrap gap-xs items-start">
        {!skills || skills.length === 0 ? (
          <span className="text-body-sm text-muted-foreground/60 italic">
            No specific skills listed yet.
          </span>
        ) : (
          skills.map((skill, idx) => {
            const skillName = typeof skill === 'string' ? skill : skill?.name;
            const skillLevel = typeof skill === 'string' ? undefined : skill?.level;
            const skillYears = typeof skill === 'string' ? undefined : skill?.years;

            return (
              <Badge
                key={idx}
                variant="outline"
                title={skillLevel ? `${skillLevel} level${skillYears ? `, ${skillYears}y experience` : ''}` : undefined}
                className="text-body-xs font-bold px-sm py-[4px] border border-border/80 bg-background/50 hover:bg-primary/5 hover:border-primary/45 hover:text-primary transition-all duration-200 cursor-default select-none shadow-sm shadow-black/5"
              >
                <span>{skillName}</span>
                {skillYears && (
                  <span className="text-[10px] text-muted-foreground ml-xxs font-normal">
                    ({skillYears}y)
                  </span>
                )}
              </Badge>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
