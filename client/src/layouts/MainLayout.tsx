import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { NotificationBell } from '../features/notifications/components/NotificationBell';
import { ThemeToggle } from '../components/ThemeToggle';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Button } from '../components/ui/button';

export const MainLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const navLinks = [
    { name: 'Dashboard', to: '/dashboard', privateOnly: true },
    { name: 'Forum', to: '/forum', privateOnly: false },
    { name: 'Sessions', to: '/sessions', privateOnly: true },
    { name: 'Explore', to: '/explore', privateOnly: true },
    { name: 'Pings', to: '/pings', privateOnly: true },
  ];

  // Filter links based on whether user is logged in
  const visibleLinks = navLinks.filter(
    (link) => !link.privateOnly || isAuthenticated
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo and Nav Links */}
            <div className="flex items-center gap-md">
              {/* Brand Logo */}
              <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-xs group shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-subtle group-hover:scale-105 transition-transform duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-body-lg font-bold tracking-tight text-foreground">
                  AscendPath
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center gap-xs ml-md">
                {visibleLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-muted text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-sm">
              <ThemeToggle />

              {isAuthenticated ? (
                <>
                  <NotificationBell />

                  {/* Divider */}
                  <span className="w-px h-5 bg-border" />

                  {/* User Profile Info */}
                  <div className="flex items-center gap-xs bg-card text-card-foreground border border-border p-xs rounded-lg shadow-subtle select-none">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>
                        {user?.name ? user.name.slice(0, 2) : 'US'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 pr-xs">
                      <p className="text-xs font-bold leading-none truncate max-w-[100px]">
                        {user?.name}
                      </p>
                      <p className="text-[10px] font-medium text-muted-foreground capitalize leading-none mt-0.5">
                        {user?.role}
                      </p>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    title="Log out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-xs">
                  <Link to="/auth/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button variant="primary" size="sm">Register</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions Drawer Toggle */}
            <div className="flex md:hidden items-center gap-xs">
              <ThemeToggle />
              {isAuthenticated && <NotificationBell />}
              
              <Button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card text-card-foreground px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 shadow-medium">
            {visibleLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-muted text-foreground font-bold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

            <span className="block border-t border-border my-sm" />

            {isAuthenticated ? (
              <div className="space-y-sm pt-xs">
                {/* User card info */}
                <div className="flex items-center gap-xs px-3 py-1.5 bg-muted/50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.name ? user.name.slice(0, 2) : 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold leading-none mb-1 text-foreground">
                      {user?.name}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground capitalize leading-none">
                      {user?.role}
                    </p>
                  </div>
                </div>
                {/* Mobile logout */}
                <Button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  variant="outline"
                  className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive shrink-0"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-xs pt-xs">
                <Link to="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Main Page Content Wrapper */}
      <main className="flex-grow min-w-0 bg-background text-foreground">
        <Outlet />
      </main>
    </div>
  );
};
