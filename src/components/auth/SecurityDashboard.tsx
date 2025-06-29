import React from 'react';
import { Shield, AlertTriangle, Clock, User, Mail, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';

export const SecurityDashboard: React.FC = () => {
  const { authenticationLogs, registrationAttempts, deletedAccounts } = useAuthStore();

  // Get recent security events
  const recentLogs = authenticationLogs.slice(-10).reverse();
  const recentAttempts = registrationAttempts.slice(-5).reverse();
  const blockedAttempts = registrationAttempts.filter(attempt => attempt.blocked);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login_success':
        return <Shield className="w-4 h-4 text-success-600" />;
      case 'login_failed':
        return <AlertTriangle className="w-4 h-4 text-error-600" />;
      case 'registration_attempt':
        return <User className="w-4 h-4 text-primary-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string, success: boolean) => {
    if (action === 'login_success' || (action === 'registration_attempt' && success)) {
      return 'text-success-700 bg-success-50 border-success-200';
    } else if (action === 'login_failed' || (action === 'registration_attempt' && !success)) {
      return 'text-error-700 bg-error-50 border-error-200';
    }
    return 'text-gray-700 bg-gray-50 border-gray-200';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Security Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Monitor authentication attempts and security events
        </p>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Logins</p>
              <p className="text-2xl font-bold text-gray-900">
                {authenticationLogs.filter(log => log.action === 'login_success').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed Attempts</p>
              <p className="text-2xl font-bold text-gray-900">
                {authenticationLogs.filter(log => log.action === 'login_failed').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-error-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blocked Registrations</p>
              <p className="text-2xl font-bold text-gray-900">
                {blockedAttempts.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deleted Accounts</p>
              <p className="text-2xl font-bold text-gray-900">
                {deletedAccounts.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Authentication Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg border border-gray-200"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Authentication Events</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div key={log.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg border ${getActionColor(log.action, log.success)}`}>
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {log.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-sm text-gray-500">
                        {log.timestamp.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{log.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{log.ipAddress}</span>
                      </div>
                    </div>
                    {log.reason && (
                      <p className="mt-1 text-sm text-gray-600">
                        Reason: {log.reason}
                      </p>
                    )}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        <details>
                          <summary className="cursor-pointer">Additional Details</summary>
                          <pre className="mt-1 bg-gray-50 p-2 rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No authentication events recorded</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Blocked Registration Attempts */}
      {blockedAttempts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Blocked Registration Attempts</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {blockedAttempts.map((attempt) => (
              <div key={attempt.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg border bg-error-50 border-error-200">
                    <AlertTriangle className="w-4 h-4 text-error-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        Registration Blocked
                      </p>
                      <p className="text-sm text-gray-500">
                        {attempt.attemptedAt.toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{attempt.email}</span>
                      </div>
                      {attempt.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{attempt.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{attempt.ipAddress}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-error-600">
                      Reason: {attempt.blockReason}
                    </p>
                    {attempt.firstName && attempt.lastName && (
                      <p className="mt-1 text-sm text-gray-600">
                        Name: {attempt.firstName} {attempt.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};