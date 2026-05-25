import { Link, useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DomainPathwayGraph } from '@/features/pathways/components/DomainPathwayGraph';
import { NextPathSuggestions } from '@/features/pathways/components/NextPathSuggestions';
import { OpportunityUnlockPanel } from '@/features/pathways/components/OpportunityUnlockPanel';
import { RelatedCareerStrip } from '@/features/pathways/components/RelatedCareerStrip';
import { useDomainHub } from '@/features/pathways/hooks/usePathways';

export const DomainHub = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useDomainHub(slug);

  if (isLoading) {
    return <PageContainer className="py-10"><div className="h-72 rounded-md bg-muted animate-pulse" /></PageContainer>;
  }

  if (isError || !data) {
    return <PageContainer className="py-10"><Card><CardContent className="p-6">Domain hub not found.</CardContent></Card></PageContainer>;
  }

  return (
    <PageContainer size="default" className="space-y-8 py-8">
      <section className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-primary">{data.overview.cluster?.name || 'Career Domain'}</div>
        <h1 className="text-3xl font-black text-foreground">{data.overview.title}</h1>
        <p className="max-w-3xl text-muted-foreground">{data.overview.description || data.decisionGuidance.headline}</p>
        <RelatedCareerStrip connections={data.graph.outgoing} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <DomainPathwayGraph current={data.graph.current} connections={data.graph.outgoing} />
        <NextPathSuggestions connections={data.graph.outgoing} />
      </div>

      <OpportunityUnlockPanel skills={data.decisionGuidance.skills} outcomes={data.decisionGuidance.outcomes} />

      <section className="grid gap-6 lg:grid-cols-3">
        <HubColumn title="Roadmap Paths" items={data.ecosystem.roadmaps} href={(item) => `/roadmaps/${item.slug || item._id}`} />
        <HubColumn title="Mentor Ecosystem" items={data.ecosystem.mentors} href={(item) => `/profile/${item._id}`} label={(item) => item.name} />
        <HubColumn title="Workshops" items={data.ecosystem.sessions} href={(item) => `/sessions/${item._id}`} />
      </section>
    </PageContainer>
  );
};

const HubColumn = ({
  title,
  items,
  href,
  label,
}: {
  title: string;
  items: any[];
  href: (item: any) => string;
  label?: (item: any) => string;
}) => (
  <Card className="border border-border bg-card">
    <CardContent className="space-y-3 p-5">
      <h2 className="text-base font-bold">{title}</h2>
      {items.slice(0, 4).map((item) => (
        <Link key={item._id} to={href(item)} className="block rounded-md border border-border p-3 hover:bg-muted">
          <div className="text-sm font-semibold">{label ? label(item) : item.title}</div>
        </Link>
      ))}
      {items.length === 0 && <p className="text-sm text-muted-foreground">This part of the ecosystem is still growing.</p>}
      <Button asChild variant="outline" size="sm">
        <Link to="/explore">Explore more</Link>
      </Button>
    </CardContent>
  </Card>
);
