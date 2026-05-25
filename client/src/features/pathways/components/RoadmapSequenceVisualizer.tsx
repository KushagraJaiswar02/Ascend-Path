import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const RoadmapSequenceVisualizer = ({ roadmaps }: { roadmaps: any[] }) => {
  if (!roadmaps?.length) return null;

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-3 text-sm font-bold">Roadmap Continuity</div>
      <div className="flex flex-col gap-2">
        {roadmaps.slice(0, 4).map((roadmap, index) => (
          <div key={roadmap._id || roadmap.id} className="flex items-center gap-2">
            {index > 0 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            <Link to={`/roadmaps/${roadmap.slug || roadmap._id}`} className="rounded-md border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
              {roadmap.title}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
