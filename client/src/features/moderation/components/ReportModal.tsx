import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, ShieldAlert, Loader2, Link2, Image, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { apiClient } from '@/services/apiClient';

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: 'post' | 'reply' | 'user' | 'review' | 'roadmap' | 'session' | 'guide_profile';
  targetId: string;
  targetName?: string;
}

const REASON_CATEGORIES = [
  { value: 'spam', label: 'Spam or irrelevant commercial content', description: 'Repeated ads, links, or unsolicited content.' },
  { value: 'harassment', label: 'Harassment, bullying, or threat', description: 'Targeting individuals, toxic speech, or intimidation.' },
  { value: 'abuse', label: 'Abusive behavior or language', description: 'Insults, slurs, or aggressive/inappropriate remarks.' },
  { value: 'misinformation', label: 'Misinformation or deceitful info', description: 'Sharing demonstrably false career advice or claims.' },
  { value: 'fake_mentor', label: 'Fake mentor or profile details', description: 'Impersonation, fake credentials, or false experiences.' },
  { value: 'scam', label: 'Scam, phishing, or fraud', description: 'Financial requests, fraudulent offers, or suspicious activity.' },
  { value: 'inappropriate_content', label: 'Inappropriate or adult content', description: 'Nudity, graphic violence, or sexually explicit content.' },
  { value: 'hate_speech', label: 'Hate speech, racism, or bigotry', description: 'Attacking protected groups or using hateful slurs.' },
  { value: 'session_misconduct', label: 'Misconduct during a live session', description: 'No-show, aggressive behavior, or session violations.' },
  { value: 'other', label: 'Other issues', description: 'Any other policy violation or trust concerns.' },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  open,
  onOpenChange,
  targetType,
  targetId,
  targetName,
}) => {
  const { toast } = useToast();
  const [reasonCategory, setReasonCategory] = React.useState('');
  const [detailedReason, setDetailedReason] = React.useState('');
  const [evidenceLinks, setEvidenceLinks] = React.useState<string[]>(['']);
  const [screenshots, setScreenshots] = React.useState<string[]>(['']);
  const [step, setStep] = React.useState<'form' | 'success'>('form');

  // Reset state on open/close
  React.useEffect(() => {
    if (open) {
      setReasonCategory('');
      setDetailedReason('');
      setEvidenceLinks(['']);
      setScreenshots(['']);
      setStep('form');
    }
  }, [open]);

  const reportMutation = useMutation({
    mutationFn: async () => {
      // Filter out empty evidence and screenshots
      const finalLinks = evidenceLinks.filter((link) => link.trim() !== '');
      const finalScreenshots = screenshots.filter((shot) => shot.trim() !== '');

      const response = await apiClient.post('/moderation', {
        targetType,
        targetId,
        reasonCategory,
        detailedReason,
        evidenceLinks: finalLinks,
        screenshots: finalScreenshots,
      });
      return response.data;
    },
    onSuccess: () => {
      setStep('success');
      toast({
        title: 'Report Submitted Successfully',
        description: 'Our Trust & Safety moderators are reviewing this case.',
        type: 'success',
      });
    },
    onError: (error: any) => {
      const errMsg = error?.response?.data?.message || error?.message || 'Failed to submit report. Please try again.';
      toast({
        title: 'Submission Blocked',
        description: errMsg,
        type: 'error',
      });
    },
  });

  const handleAddEvidenceLink = () => {
    setEvidenceLinks([...evidenceLinks, '']);
  };

  const handleEvidenceLinkChange = (index: number, value: string) => {
    const updated = [...evidenceLinks];
    updated[index] = value;
    setEvidenceLinks(updated);
  };

  const handleAddScreenshot = () => {
    setScreenshots([...screenshots, '']);
  };

  const handleScreenshotChange = (index: number, value: string) => {
    const updated = [...screenshots];
    updated[index] = value;
    setScreenshots(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonCategory) {
      toast({
        title: 'Selection Required',
        description: 'Please select a reason category to proceed.',
        type: 'warning',
      });
      return;
    }
    if (detailedReason.trim().length < 15) {
      toast({
        title: 'More details required',
        description: 'Please provide at least 15 characters of detailed explanation.',
        type: 'warning',
      });
      return;
    }
    reportMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto border border-violet-500/20 shadow-lg shadow-violet-500/5 bg-slate-900 text-slate-100 p-6 rounded-xl scrollbar-thin scrollbar-thumb-violet-500/20">
        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader className="text-left space-y-2">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-violet-600/25 border border-violet-500/30">
                  <ShieldAlert className="h-5 w-5 text-violet-400" />
                </div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                  Trust & Safety Report
                </DialogTitle>
              </div>
              <DialogDescription className="text-slate-400 text-sm">
                You are reporting the {targetType.replace('_', ' ')}
                {targetName ? (
                  <span className="font-semibold text-slate-200"> "{targetName}"</span>
                ) : (
                  ''
                )}{' '}
                to our safety officers.
              </DialogDescription>
            </DialogHeader>

            {/* Deterrent / Policy Alert */}
            <div className="flex items-start space-x-3 p-3 bg-red-950/20 border border-red-800/30 rounded-lg text-xs leading-normal">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-red-300 space-y-1">
                <span className="font-semibold block">Reporting Accountability Notice</span>
                <span>
                  Our reporting system is trust-sensitive. Reports are reviewed by human moderators.
                  <strong className="text-red-200"> False, malicious, or revenge reporting will trigger a 2-day platform suspension</strong> and a strike to your trust history.
                </span>
              </div>
            </div>

            {/* Reason Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center space-x-1">
                <FileText className="h-3.5 w-3.5 text-violet-400" />
                <span>1. Select Reason Category *</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-violet-500/20 border border-slate-800 rounded-lg p-2 bg-slate-950/50">
                {REASON_CATEGORIES.map((cat) => (
                  <label
                    key={cat.value}
                    className={`flex flex-col p-2 rounded-lg border text-left cursor-pointer transition-all duration-200 ${
                      reasonCategory === cat.value
                        ? 'bg-violet-950/40 border-violet-500 text-slate-100 shadow-sm shadow-violet-500/20'
                        : 'bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="reasonCategory"
                        value={cat.value}
                        checked={reasonCategory === cat.value}
                        onChange={() => setReasonCategory(cat.value)}
                        className="sr-only"
                      />
                      <div
                        className={`h-3 w-3 rounded-full border flex items-center justify-center ${
                          reasonCategory === cat.value ? 'border-violet-400' : 'border-slate-500'
                        }`}
                      >
                        {reasonCategory === cat.value && <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />}
                      </div>
                      <span className="text-xs font-semibold">{cat.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 pl-5 leading-normal">{cat.description}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Written Explanation */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center space-x-1">
                <FileText className="h-3.5 w-3.5 text-violet-400" />
                <span>2. Written Explanation * (Min. 15 chars)</span>
              </label>
              <Textarea
                placeholder="Explain clearly what went wrong. Provide context, timestamps, or specific details to help our safety officers make an informed, fair judgment..."
                value={detailedReason}
                onChange={(e) => setDetailedReason(e.target.value)}
                className="bg-slate-950/60 border-slate-800 text-slate-100 focus:border-violet-500 placeholder-slate-500 min-h-[100px] text-sm rounded-lg"
                required
              />
            </div>

            {/* Evidence Links */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center space-x-1">
                  <Link2 className="h-3.5 w-3.5 text-violet-400" />
                  <span>3. Add Evidence Links (Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddEvidenceLink}
                  className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider"
                >
                  + Add Link
                </button>
              </div>
              <div className="space-y-1.5">
                {evidenceLinks.map((link, idx) => (
                  <Input
                    key={idx}
                    type="url"
                    placeholder="e.g. https://github.com/issue-link or external chat logs"
                    value={link}
                    onChange={(e) => handleEvidenceLinkChange(idx, e.target.value)}
                    className="bg-slate-950/60 border-slate-800 text-slate-100 text-xs focus:border-violet-500 rounded-lg placeholder-slate-600"
                  />
                ))}
              </div>
            </div>

            {/* Screenshots */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center space-x-1">
                  <Image className="h-3.5 w-3.5 text-violet-400" />
                  <span>4. Attach Screenshot URLs (Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddScreenshot}
                  className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider"
                >
                  + Add URL
                </button>
              </div>
              <div className="space-y-1.5">
                {screenshots.map((shot, idx) => (
                  <Input
                    key={idx}
                    type="url"
                    placeholder="e.g. https://imgur.com/screenshot.png or image link"
                    value={shot}
                    onChange={(e) => handleScreenshotChange(idx, e.target.value)}
                    className="bg-slate-950/60 border-slate-800 text-slate-100 text-xs focus:border-violet-500 rounded-lg placeholder-slate-600"
                  />
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-slate-800 text-slate-300 hover:bg-slate-800"
                disabled={reportMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-violet-600 hover:bg-violet-700 text-slate-100 shadow-md shadow-violet-600/10 font-semibold"
                disabled={reportMutation.isPending}
              >
                {reportMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-slate-100" />
                    Submitting...
                  </>
                ) : (
                  'Submit Safety Report'
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="p-4 rounded-full bg-emerald-600/20 border border-emerald-500/30 animate-pulse">
              <CheckCircle className="h-12 w-12 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Report Safely Filed
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
                Thank you for helping us keep Ascend Path safe. A Trust & Safety officer has been notified and will investigate the evidence provided.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 border border-slate-700"
              >
                Close Portal
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
