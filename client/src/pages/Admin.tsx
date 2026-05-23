import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../features/admin/components/AdminSidebar';
import { AnalyticsOverview } from '../features/admin/components/AnalyticsOverview';

export const Admin = () => {
  const location = useLocation();
  const isIndex = location.pathname === '/admin';

  return (
    <div className="flex flex-col lg:flex-row">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-4 md:p-6">
        {isIndex ? <AnalyticsOverview /> : <Outlet />}
      </main>
    </div>
  );
};
