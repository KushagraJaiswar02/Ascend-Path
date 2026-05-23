import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, CheckCircle2, MessageSquare, CalendarRange } from 'lucide-react';
import { ReputationBadge } from '../../reviews/components/ReputationBadge';

interface ProfileHeaderProps {
  guide: {
    _id: string;
    name: string;
    role: string;
    guideRank: string;
    bio?: string;
    avatar?: string;
    isVerified: boolean;
    socialLinks?: {
      github?: string;
      linkedin?: string;
      website?: string;
    };
    fameScore: number;
    averageRating: number;
  };
  onOpenPing: () => void;
  onOpenBook: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  guide,
  onOpenPing,
  onOpenBook,
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-md sm:p-lg shadow-subtle flex flex-col md:flex-row md:items-start gap-md sm:gap-lg">
      {/* Avatar Container */}
      <div className="shrink-0 flex justify-center select-none">
        <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-muted shadow-md">
          <AvatarImage src={guide.avatar} alt={guide.name} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary text-heading-md font-bold">
            {guide.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Info & Details */}
      <div className="flex-grow space-y-sm text-center md:text-left">
        <div className="space-y-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-sm">
            <h1 className="text-heading-md font-black text-foreground tracking-tight select-none">
              {guide.name}
            </h1>
            <div className="flex items-center justify-center gap-xs">
              {guide.isVerified && (
                <span title="Verified Guide" className="text-primary hover:scale-105 transition-all">
                  <CheckCircle2 className="h-5 w-5 fill-primary/15" />
                </span>
              )}
              <Badge variant="secondary" className="capitalize font-bold text-[11px] px-sm py-[2px] border border-border/80 select-none">
                {guide.guideRank}
              </Badge>
              <ReputationBadge fameScore={guide.fameScore} averageRating={guide.averageRating} />
            </div>
          </div>
          <span className="block text-body-xs font-bold text-muted-foreground uppercase tracking-widest select-none">
            {guide.role}
          </span>
        </div>

        {/* Bio */}
        {guide.bio ? (
          <p className="text-body-sm text-muted-foreground leading-relaxed max-w-2xl select-text">
            {guide.bio}
          </p>
        ) : (
          <p className="text-body-sm text-muted-foreground/60 italic select-none">
            No bio provided yet.
          </p>
        )}

        {/* Social Links */}
        <div className="flex justify-center md:justify-start items-center gap-sm select-none">
          {guide.socialLinks?.github && (
            <a
              href={guide.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-xs bg-muted/40 hover:bg-muted border border-border/60 rounded-lg"
              title="GitHub Profile"
            >
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
          )}
          {guide.socialLinks?.linkedin && (
            <a
              href={guide.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-xs bg-muted/40 hover:bg-muted border border-border/60 rounded-lg"
              title="LinkedIn Profile"
            >
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          )}
          {guide.socialLinks?.website && (
            <a
              href={guide.socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-xs bg-muted/40 hover:bg-muted border border-border/60 rounded-lg"
              title="Personal Website"
            >
              <Globe className="h-4.5 w-4.5" />
            </a>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row md:flex-col gap-sm shrink-0 w-full sm:w-auto md:w-56 justify-center select-none pt-sm md:pt-0 border-t md:border-t-0 md:border-l border-border/60 md:pl-md">
        <Button
          onClick={onOpenPing}
          variant="outline"
          className="w-full gap-sm border-border text-foreground hover:bg-muted shadow-subtle hover:scale-[1.01] active:scale-[0.99] transition-all font-bold"
        >
          <MessageSquare className="h-4 w-4 text-primary" />
          <span>Ping Guide</span>
        </Button>
        <Button
          onClick={onOpenBook}
          className="w-full gap-sm bg-primary text-primary-foreground hover:bg-primary/95 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all font-bold"
        >
          <CalendarRange className="h-4 w-4" />
          <span>Book Session</span>
        </Button>
      </div>
    </div>
  );
};
