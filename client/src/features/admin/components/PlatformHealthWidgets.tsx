import { AlertTriangle, EyeOff, ShieldCheck, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { usePlatformHealth } from '../hooks';

const pct = (value: number) => `${Math.round((value || 0) * 1000) / 10}%`;

export const PlatformHealthWidgets = () => {
  const { data, isLoading } = usePlatformHealth();
  const items = [
    { label: 'Ban rate', value: pct(data?.banRate), icon: ShieldCheck },
    { label: 'Suspension rate', value: pct(data?.suspensionRate), icon: AlertTriangle },
    { label: 'Report action rate', value: pct(data?.reportConversionRate), icon: ShieldCheck },
    { label: 'Guide rating', value: (data?.averageGuideRating || 0).toFixed(2), icon: Star },
    { label: 'Hidden content', value: data?.hiddenContentCount || 0, icon: EyeOff },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">{item.label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{isLoading ? '-' : item.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
