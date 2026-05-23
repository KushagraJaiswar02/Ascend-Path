import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export const BecomeMentorCTA = () => {
  return (
    <Button variant="outline" asChild className="gap-2">
      <Link to="/mentor/apply">
        <ShieldCheck className="h-4 w-4" />
        Become a Mentor
        <ArrowRight className="h-4 w-4" />
      </Link>
    </Button>
  );
};
