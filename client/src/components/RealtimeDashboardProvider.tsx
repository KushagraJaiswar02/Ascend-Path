import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';

interface RealtimeContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({
  socket: null,
  isConnected: false,
});

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const queryClient = useQueryClient();
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If not authenticated or no token, make sure we disconnect any active socket
    if (!isAuthenticated || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Backend endpoint URL
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Initialize socket connection with JWT authorization handshake
    const socket = io(socketUrl, {
      auth: {
        token: accessToken,
      },
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 [Websocket] Connected to server registry successfully');
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [Websocket] Disconnected: ${reason}`);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('🔌 [Websocket] Handshake/Connection error:', error.message);
    });

    // 1. Realtime Notifications Invalidations
    socket.on('new_notification', (payload) => {
      console.log('🔔 [Websocket] New notification event received:', payload);
      // Invalidate notifications queries to trigger optimistic UI sync
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
      // Try playing a premium notification beep sound if available
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.4;
        audio.play().catch(() => {}); // prevent browser audio restrictions crashes
      } catch (err) {}
    });

    // 2. Realtime Dashboard Data Refreshes
    socket.on('refresh_data', (payload: { domain: string }) => {
      console.log(`🔄 [Websocket] Live data refresh requested for domain: ${payload.domain}`);
      const domain = payload.domain;

      if (domain === 'pings') {
        queryClient.invalidateQueries({ queryKey: ['pings'] });
        queryClient.invalidateQueries({ queryKey: ['pingsSent'] });
        queryClient.invalidateQueries({ queryKey: ['pingsReceived'] });
      } else if (domain === 'sessions') {
        queryClient.invalidateQueries({ queryKey: ['sessions'] });
        queryClient.invalidateQueries({ queryKey: ['sessionExecution'] });
      } else if (domain === 'roadmap') {
        queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
        queryClient.invalidateQueries({ queryKey: ['roadmapCommunity'] });
        queryClient.invalidateQueries({ queryKey: ['progress'] });
        queryClient.invalidateQueries({ queryKey: ['me', 'roadmaps'] });
      } else if (domain === 'dashboard') {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
        queryClient.invalidateQueries({ queryKey: ['me'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['guides'] }); // refresh Discover guide lists
      } else if (domain === 'reviews') {
        queryClient.invalidateQueries({ queryKey: ['reviews'] });
        queryClient.invalidateQueries({ queryKey: ['reputation'] });
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else if (domain === 'forums') {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
        queryClient.invalidateQueries({ queryKey: ['replies'] });
      }
    });

    socket.on('roadmap_community_updated', (payload: { roadmapId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['roadmapCommunity', payload.roadmapId] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps', 'trending'] });
      queryClient.invalidateQueries({ queryKey: ['me', 'roadmaps', 'momentum'] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [accessToken, isAuthenticated, queryClient]);

  return (
    <RealtimeContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </RealtimeContext.Provider>
  );
};
