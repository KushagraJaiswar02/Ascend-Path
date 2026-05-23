import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { useInitializeAuth } from './hooks/useInitializeAuth';
import { ThemeProvider } from './components/ThemeProvider';
import { ToastProvider } from './components/ui/toast';
import { RealtimeDashboardProvider } from './components/RealtimeDashboardProvider';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
      refetchOnWindowFocus: false, // Prevent refetching when window regains focus to save requests
      retry: 1, // Only retry failed requests once by default
    },
  },
});

function AppContent() {
  const { isInitializing } = useInitializeAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-body-md">Loading AscendPath...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeDashboardProvider>
        <RouterProvider router={router} />
      </RealtimeDashboardProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
