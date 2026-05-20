import React, { useState, useRef, useEffect } from 'react';
import { useUnreadNotifications } from '../hooks/useUnreadNotifications';
import { NotificationDropdown } from './NotificationDropdown';

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: unreadCount = 0 } = useUnreadNotifications();

  // Close dropdown when clicking outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggleDropdown}
        className={`relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none rounded-xl transition-all cursor-pointer ${
          isOpen
            ? 'bg-gray-100 dark:bg-gray-850 text-gray-800 dark:text-gray-150'
            : 'hover:bg-gray-50 dark:hover:bg-gray-900'
        }`}
        aria-label="View notifications"
      >
        {/* Bell Icon */}
        <svg
          className={`w-6 h-6 transition-transform ${isOpen ? 'scale-105' : 'group-hover:rotate-6'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Count Badge Overlay */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-5 h-5 px-1 bg-rose-500 text-[10px] font-black text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Embedded Dropdown Component */}
      <NotificationDropdown isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};
