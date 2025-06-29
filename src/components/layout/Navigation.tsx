import React from 'react';
import { 
  Map, 
  FileText, 
  MessageSquare, 
  User,
  Settings,
  Database
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * Navigation Component
 * 
 * Sidebar navigation that provides:
 * - Primary application navigation
 * - Active route highlighting
 * - Responsive design for different screen sizes
 * - Smooth hover animations
 * 
 * Responsive Behavior:
 * - Full sidebar on desktop
 * - Collapsible on tablet
 * - Bottom navigation on mobile (future enhancement)
 */
export const Navigation: React.FC = () => {
  const location = useLocation();

  // Navigation items configuration
  const navItems = [
    { id: 'map', label: 'Interactive Map', icon: Map, path: '/map' },
    { id: 'database', label: 'Manufacturer Database', icon: Database, path: '/database' },
    { id: 'quotes', label: 'Quote Management', icon: FileText, path: '/quotes' },
    { id: 'conversations', label: 'Communications', icon: MessageSquare, path: '/conversations' },
    { id: 'account', label: 'Account', icon: User, path: '/account' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ] as const;

  /**
   * Determine if a navigation item is active
   * Handles both exact matches and sub-route matching (e.g., settings sub-pages)
   */
  const isActiveRoute = (path: string) => {
    if (path === '/settings') {
      return location.pathname === path || location.pathname.startsWith('/settings/');
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-r border-gray-200 w-64 min-h-screen flex-shrink-0 hidden md:block">
      <div className="p-4 lg:p-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            
            return (
              <motion.div 
                key={item.id} 
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Link
                  to={item.path}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 bg-primary-600 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
        
        {/* Navigation Footer - Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-2">
            <div className="flex items-center justify-between">
              <span>Version</span>
              <span className="font-mono">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};