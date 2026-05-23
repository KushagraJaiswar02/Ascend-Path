import { PlatformHealthWidgets } from '../features/admin/components/PlatformHealthWidgets';

export const AdminHealth = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Platform Health</h1>
        <p className="text-sm text-muted-foreground">Operational trust, abuse, and content safety indicators.</p>
      </div>
      <PlatformHealthWidgets />
    </div>
  );
};
