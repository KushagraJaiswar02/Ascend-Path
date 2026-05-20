import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Landing } from '../pages/Landing';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MainLayout } from '../layouts/MainLayout';
import { PageLoadingFallback } from '../components/ui/PageLoadingFallback';

// ─── Lazy-loaded route-level page chunks ─────────────────────────────────────
// Each page gets its own chunk. The lazily-imported module path must be a
// static string literal so Vite can statically analyse and split it.
const Dashboard    = lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Forum        = lazy(() => import('../pages/Forum').then(m => ({ default: m.Forum })));
const PostDetail   = lazy(() => import('../pages/PostDetail').then(m => ({ default: m.PostDetail })));
const Sessions     = lazy(() => import('../pages/Sessions').then(m => ({ default: m.Sessions })));
const SessionDetail = lazy(() => import('../pages/SessionDetail').then(m => ({ default: m.SessionDetail })));
const Explore      = lazy(() => import('../pages/Explore').then(m => ({ default: m.Explore })));
const Pings        = lazy(() => import('../pages/Pings').then(m => ({ default: m.Pings })));

// Thin Suspense wrapper so every lazy route gets the same fallback treatment
const Lazy = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PageLoadingFallback />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/auth/login',
    element: <Login />,
  },
  {
    path: '/auth/register',
    element: <Register />,
  },
  {
    // Application Shell Layout (Public & Authenticated)
    element: <MainLayout />,
    children: [
      {
        path: '/forum',
        element: <Lazy><Forum /></Lazy>,
      },
      {
        path: '/forum/:id',
        element: <Lazy><PostDetail /></Lazy>,
      },
      {
        // Protected Routes Wrapper
        element: <ProtectedRoute />,
        children: [
          {
            path: '/dashboard',
            element: <Lazy><Dashboard /></Lazy>,
          },
          {
            path: '/pings',
            element: <Lazy><Pings /></Lazy>,
          },
          {
            path: '/sessions',
            element: <Lazy><Sessions /></Lazy>,
          },
          {
            path: '/sessions/:id',
            element: <Lazy><SessionDetail /></Lazy>,
          },
          {
            path: '/explore',
            element: <Lazy><Explore /></Lazy>,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <div>404 Not Found</div>,
  }
]);
