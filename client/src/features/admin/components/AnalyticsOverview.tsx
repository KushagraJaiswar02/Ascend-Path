import { BarChart3, CalendarCheck, GitBranch, MessageSquareWarning, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useAdminAnalytics, useAdminStats } from '../hooks';

export const AnalyticsOverview = () => {
  const { data: stats } = useAdminStats();
  const { data: analytics } = useAdminAnalytics();

  const metricCards = [
    { label: 'Daily active users', value: stats?.activeToday, icon: Users },
    { label: 'Roadmap enrollments', value: analytics?.roadmapEnrollmentsLast30Days, icon: GitBranch },
    { label: 'Session bookings', value: analytics?.sessionBookingsLast30Days, icon: CalendarCheck },
    { label: 'Pending reports', value: stats?.pendingReports, icon: MessageSquareWarning },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{metric.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{metric.value ?? '-'}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Growth and Abuse Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <SignalList title="User growth" items={analytics?.growth?.slice(-8)} valueKey="count" labelKey="date" />
            <SignalList title="Abuse spikes" items={analytics?.abuseSpikes?.slice(-8)} valueKey="count" labelKey="reason" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top mentors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(analytics?.topMentors || []).slice(0, 6).map((mentor: any) => (
              <div key={mentor._id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">{mentor.name}</span>
                <span className="text-muted-foreground">{mentor.fameScore}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SignalList = ({
  title,
  items = [],
  labelKey,
  valueKey,
}: {
  title: string;
  items?: Record<string, any>[];
  labelKey: string;
  valueKey: string;
}) => (
  <div>
    <h3 className="mb-3 text-sm font-semibold">{title}</h3>
    <div className="space-y-2">
      {items.length === 0 && <p className="text-sm text-muted-foreground">No signal yet</p>}
      {items.map((item, index) => (
        <div key={`${item[labelKey]}-${index}`} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          <span className="truncate text-muted-foreground">{item[labelKey]}</span>
          <span className="font-medium">{item[valueKey]}</span>
        </div>
      ))}
    </div>
  </div>
);
