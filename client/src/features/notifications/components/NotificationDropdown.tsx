import React, { useCallback } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkNotificationRead } from '../hooks/useMarkNotificationRead';
import { NotificationItem } from './NotificationItem';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { data, isLoading, isError } = useNotifications(1, 20);
  const { markAsRead, markAllAsRead, isMarkingAllAsRead } = useMarkNotificationRead();

  // Stable callback — won't cause NotificationItem rerenders when dropdown
  // re-renders due to isMarkingAllAsRead toggling.
  const handleMarkRead = useCallback(
    (id: string) => markAsRead(id),
    [markAsRead]
  );

  if (!isOpen) return null;

  const notifications = data?.notifications || [];
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col max-h-[500px]">
      {/* Dropdown Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-850 dark:text-gray-250">Notifications</h3>
          {hasUnread && (
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          )}
        </div>
        {hasUnread && (
          <button
            onClick={() => markAllAsRead()}
            disabled={isMarkingAllAsRead}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 transition-colors uppercase tracking-wider cursor-pointer"
          >
            {isMarkingAllAsRead ? 'Marking...' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Notifications List Container */}
      <div className="flex-grow overflow-y-auto p-3 space-y-2 max-h-[380px]">
        {isLoading ? (
          // Loading Skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3 border border-gray-50 rounded-xl animate-pulse">
              <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0"></div>
              <div className="flex-grow space-y-2">
                <div className="h-3.5 bg-gray-150 dark:bg-gray-800 rounded w-11/12"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-850 rounded w-1/4"></div>
              </div>
            </div>
          ))
        ) : isError ? (
          // Error State
          <div className="p-8 text-center">
            <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-semibold text-red-500">Failed to load notifications</p>
          </div>
        ) : notifications.length === 0 ? (
          // Empty State
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">All caught up!</h4>
            <p className="text-xs text-gray-450 dark:text-gray-500 max-w-[200px] leading-relaxed">No new alerts or notifications at this time.</p>
          </div>
        ) : (
          // Normal List — each item receives a stable markAsRead callback
          notifications.map((n) => (
            <NotificationItem
              key={n._id}
              notification={n}
              onItemClick={onClose}
              onMarkRead={handleMarkRead}
            />
          ))
        )}
      </div>

      {/* Dropdown Footer */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-850 text-center bg-gray-50/20 dark:bg-gray-900/10 flex-shrink-0">
        <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
          End of updates
        </span>
      </div>
    </div>
  );
};
