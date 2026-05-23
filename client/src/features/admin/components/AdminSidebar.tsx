import { Activity, ClipboardList, FileClock, Gauge, Shield, ShieldCheck, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../../lib/utils';

const navItems = [
  { to: '/admin', label: 'Operations', icon: Gauge },
  { to: '/admin/moderation', label: 'Queue', icon: ClipboardList },
  { to: '/admin/mentor-applications', label: 'Mentors', icon: ShieldCheck },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/audit', label: 'Audit', icon: FileClock },
  { to: '/admin/health', label: 'Health', icon: Activity },
];

export const AdminSidebar = () => {
  return (
    <aside className="w-full border-b border-border bg-background/95 px-4 py-3 lg:min-h-[calc(100vh-4rem)] lg:w-64 lg:border-b-0 lg:border-r">
      <div className="mb-4 hidden items-center gap-2 px-2 lg:flex">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-semibold">Admin Ops</span>
      </div>
      <nav className="flex gap-2 overflow-x-auto lg:flex-col">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                cn(
                  'flex min-w-max items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  isActive && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
