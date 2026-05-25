import React, { useState } from 'react';
import { useUpdateProfessionalProfile } from '../hooks/useCredibility';
import { useToast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash, Link as LinkIcon, GitBranch, Network, Globe, Sparkles } from 'lucide-react';
import type { PublicProfile } from '../api/credibility.api';

interface ProfessionalProfileProps {
  profile: PublicProfile;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ProfessionalProfile: React.FC<ProfessionalProfileProps> = ({
  profile,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const updateProfileMutation = useUpdateProfessionalProfile();

  const [username, setUsername] = useState(profile.username || '');
  const [headline, setHeadline] = useState(profile.headline || '');
  const [specialization, setSpecialization] = useState(profile.specialization || '');
  const [bio, setBio] = useState(profile.bio || '');

  // Social Links
  const [github, setGithub] = useState(profile.socialLinks?.github || '');
  const [linkedin, setLinkedin] = useState(profile.socialLinks?.linkedin || '');
  const [website, setWebsite] = useState(profile.socialLinks?.website || '');

  // Portfolio Links
  const [portfolioLinks, setPortfolioLinks] = useState<{ label: string; url: string }[]>(
    profile.portfolioLinks || []
  );

  const handleAddLink = () => {
    setPortfolioLinks([...portfolioLinks, { label: '', url: '' }]);
  };

  const handleRemoveLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...portfolioLinks];
    updated[index][field] = value;
    setPortfolioLinks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (username.trim() && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      toast({
        title: 'Invalid Username',
        description: 'Username must be 3-20 characters long and contain only alphanumeric characters or underscores.',
        type: 'error',
      });
      return;
    }

    try {
      const payload = {
        username: username.trim() || undefined,
        headline: headline.trim() || undefined,
        specialization: specialization.trim() || undefined,
        bio: bio.trim() || undefined,
        socialLinks: {
          github: github.trim() || undefined,
          linkedin: linkedin.trim() || undefined,
          website: website.trim() || undefined,
        },
        portfolioLinks: portfolioLinks.filter((link) => link.label.trim() && link.url.trim()),
      };

      await updateProfileMutation.mutateAsync(payload);
      toast({
        title: 'Profile Updated',
        description: 'Your professional credibility profile was successfully updated.',
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: 'Update Failed',
        description: err?.response?.data?.message || 'Failed to update professional profile.',
        type: 'error',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-lg select-text p-6">
        <DialogHeader className="pb-3 border-b border-border/40">
          <DialogTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Refine Professional Identity</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-semibold">
            Showcase your credentials, domain specialization, and portfolio links to demonstrate credibility.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                Username
              </label>
              <Input
                placeholder="e.g. kushagra_j"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-9.5 text-xs rounded-xl"
              />
              <p className="text-[9px] text-muted-foreground font-semibold">
                This configures your public URL: `/u/:username`
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                Specialization / Domain Role
              </label>
              <Input
                placeholder="e.g. Full Stack Developer, Research Engineer"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="h-9.5 text-xs rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
              Headline
            </label>
            <Input
              placeholder="e.g. CS Graduate passionate about systems engineering and AI scalability"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="h-9.5 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
              Career Biography (Bio)
            </label>
            <Textarea
              placeholder="Tell mentors and recruiters about your engineering path, goals, and technical focus..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[100px] text-xs"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-foreground">Social & Network Links</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="relative">
                  <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="GitHub URL"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <Network className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="LinkedIn URL"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Personal Website URL"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="pl-9 h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Custom Portfolio Links */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4 text-primary" />
                <span>Custom Verification & Credentials Links</span>
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLink}
                className="h-8 text-[10px] font-bold gap-1 rounded-lg border-border/70 hover:bg-muted"
              >
                <Plus className="h-3 w-3" />
                <span>Add Link</span>
              </Button>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {portfolioLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Label (e.g. AWS Certified Developer)"
                    value={link.label}
                    onChange={(e) => handleLinkChange(idx, 'label', e.target.value)}
                    className="h-9.5 text-xs rounded-xl flex-1"
                  />
                  <Input
                    type="url"
                    placeholder="Verification/Credential URL"
                    value={link.url}
                    onChange={(e) => handleLinkChange(idx, 'url', e.target.value)}
                    className="h-9.5 text-xs rounded-xl flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLink(idx)}
                    className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 rounded-xl"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {portfolioLinks.length === 0 && (
                <p className="text-[11px] text-muted-foreground font-semibold italic text-center py-2">
                  No custom links added yet. Add external certifications or resumes here.
                </p>
              )}
            </div>
          </div>

          {/* Form actions */}
          <div className="flex justify-end gap-2 border-t border-border/40 pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-10 text-xs font-bold px-4 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="h-10 text-xs font-bold px-5 rounded-xl bg-primary text-white hover:bg-primary/95 cursor-pointer"
            >
              {updateProfileMutation.isPending ? 'Updating...' : 'Save Professional Profile'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
