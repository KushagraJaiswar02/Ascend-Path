import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Landing } from '../pages/Landing';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AdminRoute } from '../components/AdminRoute';
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
const ProfileDetail = lazy(() => import('../pages/ProfileDetail').then(m => ({ default: m.ProfileDetail })));
const RoadmapDetail = lazy(() => import('../pages/RoadmapDetail').then(m => ({ default: m.RoadmapDetail })));
const RoadmapBuilder = lazy(() => import('../pages/RoadmapBuilder').then(m => ({ default: m.RoadmapBuilder })));
const MentorApplication = lazy(() => import('../pages/MentorApplication').then(m => ({ default: m.MentorApplication })));
const Onboarding = lazy(() => import('../pages/Onboarding').then(m => ({ default: m.Onboarding })));
const Admin = lazy(() => import('../pages/Admin').then(m => ({ default: m.Admin })));
const AdminModeration = lazy(() => import('../pages/AdminModeration').then(m => ({ default: m.AdminModeration })));
const AdminUsers = lazy(() => import('../pages/AdminUsers').then(m => ({ default: m.AdminUsers })));
const AdminAudit = lazy(() => import('../pages/AdminAudit').then(m => ({ default: m.AdminAudit })));
const AdminHealth = lazy(() => import('../pages/AdminHealth').then(m => ({ default: m.AdminHealth })));
const AdminMentorApplications = lazy(() => import('../pages/AdminMentorApplications').then(m => ({ default: m.AdminMentorApplications })));

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
        path: '/profile/:id',
        element: <Lazy><ProfileDetail /></Lazy>,
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
          {
            path: '/roadmaps/:id',
            element: <Lazy><RoadmapDetail /></Lazy>,
          },
          {
            path: '/roadmaps/builder',
            element: <Lazy><RoadmapBuilder /></Lazy>,
          },
          {
            path: '/roadmaps/builder/:id',
            element: <Lazy><RoadmapBuilder /></Lazy>,
          },
          {
            path: '/mentor/apply',
            element: <Lazy><MentorApplication /></Lazy>,
          },
          {
            path: '/onboarding',
            element: <Lazy><Onboarding /></Lazy>,
          },
          {
            element: <AdminRoute />,
            children: [
              {
                path: '/admin',
                element: <Lazy><Admin /></Lazy>,
                children: [
                  {
                    path: '/admin/moderation',
                    element: <Lazy><AdminModeration /></Lazy>,
                  },
                  {
                    path: '/admin/users',
                    element: <Lazy><AdminUsers /></Lazy>,
                  },
                  {
                    path: '/admin/mentor-applications',
                    element: <Lazy><AdminMentorApplications /></Lazy>,
                  },
                  {
                    path: '/admin/audit',
                    element: <Lazy><AdminAudit /></Lazy>,
                  },
                  {
                    path: '/admin/health',
                    element: <Lazy><AdminHealth /></Lazy>,
                  },
                ],
              },
            ],
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
