import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { MessageSquare, Mail, Phone, Globe, Clock, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface CommunicationFormData {
  preferredMethod: 'email' | 'phone' | 'portal';
  timezone: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  language: string;
  autoResponder: boolean;
  responseTime: string;
}

export const CommunicationSettings: React.FC = () => {
  const { user, updatePreferences } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { isDirty } } = useForm<CommunicationFormData>({
    defaultValues: {
      preferredMethod: user?.preferences.communication.preferredMethod ?? 'email',
      timezone: user?.preferences.communication.timezone ?? 'America/New_York',
      businessHoursStart: user?.preferences.communication.businessHours.start ?? '09:00',
      businessHoursEnd: user?.preferences.communication.businessHours.end ?? '17:00',
      language: 'en-US',
      autoResponder: false,
      responseTime: '24'
    }
  });

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
  ];

  const languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'es-US', label: 'Spanish (US)' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' }
  ];

  const onSubmit = async (data: CommunicationFormData) => {
    setIsLoading(true);
    try {
      updatePreferences({
        communication: {
          preferredMethod: data.preferredMethod,
          timezone: data.timezone,
          businessHours: {
            start: data.businessHoursStart,
            end: data.businessHoursEnd
          }
        }
      });
      toast.success('Communication settings updated successfully');
    } catch (error) {
      toast.error('Failed to update communication settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/settings"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Communication Settings</h1>
          <p className="text-gray-600 mt-1">
            Configure your preferred communication methods and availability
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Preferred Contact Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-secondary-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Preferred Contact Method</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="relative">
              <input
                type="radio"
                value="email"
                {...register('preferredMethod')}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 transition-all">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 peer-checked:text-primary-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email</h3>
                    <p className="text-xs text-gray-500">Receive communications via email</p>
                  </div>
                </div>
              </div>
            </label>

            <label className="relative">
              <input
                type="radio"
                value="phone"
                {...register('preferredMethod')}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 transition-all">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 peer-checked:text-primary-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Phone</h3>
                    <p className="text-xs text-gray-500">Prefer phone calls for communication</p>
                  </div>
                </div>
              </div>
            </label>

            <label className="relative">
              <input
                type="radio"
                value="portal"
                {...register('preferredMethod')}
                className="sr-only peer"
              />
              <div className="p-4 border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 transition-all">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-400 peer-checked:text-primary-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Portal</h3>
                    <p className="text-xs text-gray-500">Use in-app messaging system</p>
                  </div>
                </div>
              </div>
            </label>
          </div>
        </motion.div>

        {/* Time & Location Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-accent-100 rounded-lg">
              <Clock className="w-5 h-5 text-accent-600" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">Time & Availability</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                {...register('timezone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                {...register('language')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Hours Start
              </label>
              <input
                type="time"
                {...register('businessHoursStart')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Hours End
              </label>
              <input
                type="time"
                {...register('businessHoursEnd')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </motion.div>

        {/* Response Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-6">Response Settings</h2>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Auto-responder</h3>
                <p className="text-xs text-gray-500">Send automatic replies when you're unavailable</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('autoResponder')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Response Time
              </label>
              <select
                {...register('responseTime')}
                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="1">Within 1 hour</option>
                <option value="4">Within 4 hours</option>
                <option value="24">Within 24 hours</option>
                <option value="48">Within 48 hours</option>
                <option value="72">Within 3 business days</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <h2 className="text-lg font-medium text-gray-900 mb-6">Contact Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">
                To change your email, please contact support
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={user?.phone || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                placeholder="Not provided"
              />
              <p className="text-xs text-gray-500 mt-1">
                Update in Account Preferences
              </p>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};