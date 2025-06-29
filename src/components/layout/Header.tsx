import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Settings, 
  User, 
  Bell, 
  ChevronDown,
  LogOut,
  UserCircle,
  Monitor,
  MessageSquare
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * Header Component
 * 
 * Main application header that provides:
 * - Brand identity and logo
 * - Voice session controls
 * - Notifications dropdown
 * - Settings quick access
 * - User profile management
 * 
 * Responsive Design:
 * - Adapts layout for mobile/tablet/desktop
 * - Collapsible elements on smaller screens
 * - Touch-friendly interactive elements
 */
export const Header: React.FC = () => {
  const { 
    isVoiceActive, 
    setVoiceActive, 
    startVoiceSession, 
    endVoiceSession,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useAppStore();
  
  const { user, logout } = useAuthStore();
  
  // Local state for dropdown visibility
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  /**
   * Handle voice session toggle
   * Manages voice session state and provides user feedback
   */
  const handleVoiceToggle = () => {
    if (isVoiceActive) {
      endVoiceSession();
      setVoiceActive(false);
    } else {
      startVoiceSession();
    }
  };

  /**
   * Handle notification click
   * Marks notification as read and navigates to action URL if available
   */
  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  // Get recent notifications for dropdown display
  const recentNotifications = notifications.slice(0, 5);

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 relative z-50">
      <div className="flex items-center justify-between">
        {/* Brand Section - Responsive logo and title */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          <div className="flex items-center space-x-3">
            {/* Logo with uploaded image */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-primary-600 flex items-center justify-center">
              <img 
                src="/ChatGPT Image Jun 28, 2025, 07_57_17 PM.png" 
                alt="FactoryLink Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to text logo if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.style.display = 'flex';
                }}
              />
              <span className="text-white font-bold text-sm sm:text-lg hidden">F</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">FactoryLink</h1>
          </div>
        </div>

        {/* Action Controls - Responsive layout */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Voice Session Toggle - Responsive button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleVoiceToggle}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              isVoiceActive
                ? 'bg-error-600 text-white hover:bg-error-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {isVoiceActive ? (
              <>
                <MicOff className="w-4 h-4" />
                <span className="hidden sm:inline">End Voice</span>
                <div className="w-2 h-2 bg-error-300 rounded-full animate-pulse" />
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Start Voice</span>
              </>
            )}
          </motion.button>

          {/* User Controls Section */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-lg shadow-lg"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {recentNotifications.length > 0 ? (
                        recentNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-primary-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.priority === 'high' ? 'bg-error-500' :
                                notification.priority === 'medium' ? 'bg-warning-500' :
                                'bg-success-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {notification.createdAt.toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">Settings</h3>
                    </div>
                    <div className="p-2">
                      <div className="space-y-1">
                        <Link
                          to="/account"
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setShowSettings(false)}
                        >
                          <UserCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">Account Preferences</span>
                        </Link>
                        <Link
                          to="/settings/notifications"
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setShowSettings(false)}
                        >
                          <Bell className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">Notification Settings</span>
                        </Link>
                        <Link
                          to="/settings/communications"
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setShowSettings(false)}
                        >
                          <MessageSquare className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">Communication Preferences</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                          onClick={() => setShowSettings(false)}
                        >
                          <Monitor className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">Dashboard Settings</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User Profile Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-2 sm:space-x-3 pl-3 border-l border-gray-200 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.quotesUsed}/{user.quotesLimit} quotes used
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>

                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg"
                    >
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                              <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.company && (
                              <div className="text-sm text-gray-500">{user.company}</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="space-y-1">
                          <Link
                            to="/account"
                            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setShowProfile(false)}
                          >
                            <UserCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">View Profile</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors"
                            onClick={() => setShowProfile(false)}
                          >
                            <Settings className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">Account Settings</span>
                          </Link>
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            onClick={logout}
                            className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-100 rounded-lg transition-colors text-error-600"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};