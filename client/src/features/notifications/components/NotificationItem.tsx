import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onItemClick?: () => void;
  /** Passed down from parent — avoids calling useMarkNotificationRead per-item */
  onMarkRead: (id: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 10) return 'just now';
  if (diffSecs < 60) return `${diffSecs}s ago`;
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// Icon & styling selector based on notification type — defined OUTSIDE the
// component so the object is not recreated on every render.
const getTypeStyling = (type: string) => {
  switch (type) {
    case 'ping_received':
      return {
        bg: 'bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/50',
        text: 'text-indigo-600 dark:text-indigo-400',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
      };
    case 'ping_answered':
      return {
        bg: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50',
        text: 'text-emerald-600 dark:text-emerald-400',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      };
    case 'session_booked':
    case 'session_accepted':
      return {
        bg: 'bg-teal-50 border-teal-100 dark:bg-teal-950/20 dark:border-teal-900/50',
        text: 'text-teal-600 dark:text-teal-400',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      };
    case 'session_completed':
      return {
        bg: 'bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900/50',
        text: 'text-green-600 dark:text-green-400',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        ),
      };
    case 'review_received':
      return {
        bg: 'bg-yellow-50 border-yellow-100 dark:bg-yellow-950/20 dark:border-yellow-900/50',
        text: 'text-yellow-600 dark:text-yellow-400',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ),
      };
    case 'roadmap_completed':
      return {
        bg: 'bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/50',
        text: 'text-purple-600 dark:text-purple-400',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        ),
      };
    case 'step_completed':
      return {
        bg: 'bg-cyan-50 border-cyan-100 dark:bg-cyan-950/20 dark:border-cyan-900/50',
        text: 'text-cyan-600 dark:text-cyan-400',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        ),
      };
    case 'post_reply':
      return {
        bg: 'bg-sky-50 border-sky-100 dark:bg-sky-950/20 dark:border-sky-900/50',
        text: 'text-sky-600 dark:text-sky-400',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        ),
      };
    case 'post_upvoted':
      return {
        bg: 'bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:border-orange-900/50',
        text: 'text-orange-600 dark:text-orange-400',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
          </svg>
        ),
      };
    case 'guide_followed':
      return {
        bg: 'bg-pink-50 border-pink-100 dark:bg-pink-950/20 dark:border-pink-900/50',
        text: 'text-pink-600 dark:text-pink-400',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      };
    case 'warning_issued':
      return {
        bg: 'bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50',
        text: 'text-red-600 dark:text-red-400',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      };
    default:
      return {
        bg: 'bg-gray-50 border-gray-100 dark:bg-gray-800/50 dark:border-gray-700/50',
        text: 'text-gray-600 dark:text-gray-400',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        ),
      };
  }
};

// ── Component ─────────────────────────────────────────────────────────────────
// Wrapped in memo so the list doesn't rerender when unrelated state changes
// (e.g. isMarkingAllAsRead toggling in the parent dropdown).
export const NotificationItem: React.FC<NotificationItemProps> = memo(
  ({ notification, onItemClick, onMarkRead }) => {
    const navigate = useNavigate();

    const handleNotificationClick = () => {
      if (!notification.read) {
        onMarkRead(notification._id);
      }

      if (onItemClick) {
        onItemClick();
      }

      // Navigate based on entityType and entityId if available
      if (notification.entityType && notification.entityId) {
        const entityType = notification.entityType;
        const entityId = notification.entityId;
        if (entityType === 'Ping') navigate(`/pings`);
        else if (entityType === 'Session') navigate(`/sessions`);
        else if (entityType === 'Review') navigate(`/`);
        else if (entityType === 'Roadmap') navigate(`/roadmaps/${entityId}`);
        else if (entityType === 'Post') navigate(`/forum/post/${entityId}`);
      }
    };

    const style = getTypeStyling(notification.type);
    const actorName = notification.actorId?.name;

    return (
      <div
        onClick={handleNotificationClick}
        className={`group flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
          notification.read
            ? 'bg-white hover:bg-gray-50/80 border-gray-100 hover:border-gray-200 dark:bg-gray-900 dark:border-gray-800 dark:hover:bg-gray-800/50'
            : 'bg-blue-50/50 hover:bg-blue-50 border-blue-100/70 hover:border-blue-200/80 dark:bg-blue-950/10 dark:border-blue-900/30 dark:hover:bg-blue-950/20'
        }`}
      >
        {/* Icon Badge container */}
        <div className={`p-2 rounded-xl border flex-shrink-0 flex items-center justify-center ${style.bg} ${style.text}`}>
          {style.icon}
        </div>

        {/* Message and Metadata content */}
        <div className="flex-grow min-w-0 pr-1">
          {/* Title row */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className={`text-[11px] font-bold uppercase tracking-wide ${style.text}`}>
              {notification.title}
            </p>
            {actorName && (
              <span className="text-[10px] text-muted-foreground font-medium">· {actorName}</span>
            )}
          </div>
          {/* Message body */}
          <p
            className={`text-sm leading-snug break-words transition-colors ${
              notification.read
                ? 'text-gray-500 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-gray-200'
                : 'text-gray-800 font-medium group-hover:text-gray-950 dark:text-gray-200 dark:group-hover:text-white'
            }`}
          >
            {notification.message}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
              {formatRelativeTime(notification.createdAt)}
            </span>
            {!notification.read && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">
                  New
                </span>
              </>
            )}
          </div>
        </div>

        {/* Unread dot indicator on the right */}
        {!notification.read && (
          <div className="flex-shrink-0 pt-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
          </div>
        )}
      </div>
    );
  }
);

NotificationItem.displayName = 'NotificationItem';
