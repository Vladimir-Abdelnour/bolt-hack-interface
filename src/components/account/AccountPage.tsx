import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Building, Phone, Save, X, Edit2, Camera, Upload, Trash2, Key, AlertTriangle, Shield, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface AccountFormData {
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  phone?: string;
  role: 'founder' | 'procurement_manager';
  bio?: string;
  website?: string;
  linkedin?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AccountDeletionData {
  reason: string;
  confirmation: string;
}

export const AccountPage: React.FC = () => {
  const { user, updateUser, logout, deleteAccount } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<AccountFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      company: user?.company || '',
      phone: user?.phone || '',
      role: user?.role || 'founder',
      bio: user?.bio || '',
      website: user?.website || '',
      linkedin: user?.linkedin || ''
    }
  });

  const { 
    register: registerPassword, 
    handleSubmit: handlePasswordSubmit, 
    reset: resetPassword,
    watch: watchPassword,
    formState: { errors: passwordErrors } 
  } = useForm<PasswordChangeData>();

  const { 
    register: registerDeletion, 
    handleSubmit: handleDeletionSubmit, 
    watch: watchDeletion,
    formState: { errors: deletionErrors } 
  } = useForm<AccountDeletionData>();

  const newPassword = watchPassword('newPassword');
  const confirmationText = watchDeletion('confirmation');
  const deletionReason = watchDeletion('reason');

  const onSubmit = (data: AccountFormData) => {
    try {
      updateUser({
        ...data,
        avatar: avatarPreview || user?.avatar
      });
      setIsEditing(false);
      toast.success('Account updated successfully');
    } catch (error) {
      toast.error('Failed to update account');
    }
  };

  const handleCancel = () => {
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      company: user?.company || '',
      phone: user?.phone || '',
      role: user?.role || 'founder',
      bio: user?.bio || '',
      website: user?.website || '',
      linkedin: user?.linkedin || ''
    });
    setIsEditing(false);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (data: PasswordChangeData) => {
    setIsChangingPassword(true);
    try {
      // Simulate API call for password change
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would make an API call here
      // await changePassword(data.currentPassword, data.newPassword);
      
      toast.success('Password changed successfully');
      setShowPasswordModal(false);
      resetPassword();
    } catch (error) {
      toast.error('Failed to change password. Please check your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async (data: AccountDeletionData) => {
    setIsDeletingAccount(true);
    try {
      // Validate confirmation text
      if (data.confirmation !== 'DELETE MY ACCOUNT') {
        toast.error('Please type "DELETE MY ACCOUNT" to confirm');
        setIsDeletingAccount(false);
        return;
      }

      if (!data.reason.trim()) {
        toast.error('Please provide a reason for account deletion');
        setIsDeletingAccount(false);
        return;
      }

      // Call the delete account function from auth store
      await deleteAccount(data.reason);
      
      toast.success('Account has been permanently deleted');
      
      // Logout after successful deletion
      setTimeout(() => {
        logout();
      }, 2000);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account. Please try again.');
      setIsDeletingAccount(false);
    }
  };

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const passwordValidation = newPassword ? validatePassword(newPassword) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Account Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information, preferences, and account settings
          </p>
        </div>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center space-x-6">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-600 flex items-center justify-center">
                {avatarPreview || user?.avatar ? (
                  <img
                    src={avatarPreview || user?.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : 'Complete your profile'
                }
              </h2>
              <p className="text-gray-600">{user?.email}</p>
              {user?.company && (
                <p className="text-sm text-gray-500 mt-1">{user.company}</p>
              )}
              <div className="flex items-center space-x-4 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.subscription === 'pro' 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user?.subscription === 'pro' ? '💎 Pro Member' : '🆓 Free Plan'}
                </span>
                <span className="text-sm text-gray-500">
                  {user?.quotesUsed || 0}/{user?.quotesLimit || 3} quotes used
                </span>
                {user?.status === 'active' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    <div className="w-2 h-2 bg-success-500 rounded-full mr-1"></div>
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    {...register('firstName', { required: 'First name is required' })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    } ${errors.firstName ? 'border-error-500' : 'border-gray-300'}`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-error-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    {...register('lastName', { required: 'Last name is required' })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    } ${errors.lastName ? 'border-error-500' : 'border-gray-300'}`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-error-600">{errors.lastName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    } ${errors.email ? 'border-error-500' : 'border-gray-300'}`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    } border-gray-300`}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Building className="w-5 h-5 mr-2 text-secondary-600" />
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    {...register('company')}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    } border-gray-300`}
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    } ${errors.role ? 'border-error-500' : 'border-gray-300'}`}
                  >
                    <option value="founder">First-Time Founder</option>
                    <option value="procurement_manager">Procurement Manager</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-error-600">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Website
                  </label>
                  <input
                    type="url"
                    {...register('website')}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    } border-gray-300`}
                    placeholder="https://yourcompany.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    {...register('linkedin')}
                    disabled={!isEditing}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                    } border-gray-300`}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio
                </label>
                <textarea
                  {...register('bio')}
                  disabled={!isEditing}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none ${
                    !isEditing ? 'bg-gray-50 text-gray-600' : 'bg-white'
                  } border-gray-300`}
                  placeholder="Tell us about your background and experience in manufacturing..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                
                <button
                  type="submit"
                  disabled={!isDirty}
                  className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </motion.div>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Subscription</p>
              <p className="text-xl font-bold text-gray-900 capitalize">{user?.subscription}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💎</span>
            </div>
          </div>
          {user?.subscription === 'freemium' && (
            <button className="mt-3 w-full text-xs bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors">
              Upgrade to Pro
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quotes Used</p>
              <p className="text-xl font-bold text-gray-900">
                {user?.quotesUsed || 0}/{user?.quotesLimit || 3}
              </p>
            </div>
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-secondary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((user?.quotesUsed || 0) / (user?.quotesLimit || 3)) * 100}%` }}
            />
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
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-xl font-bold text-gray-900">
                {user?.createdAt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🗓️</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profile Complete</p>
              <p className="text-xl font-bold text-gray-900">
                {Math.round(((user?.firstName ? 1 : 0) + 
                           (user?.lastName ? 1 : 0) + 
                           (user?.email ? 1 : 0) + 
                           (user?.company ? 1 : 0) + 
                           (user?.phone ? 1 : 0)) / 5 * 100)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Export Data</div>
              <div className="text-sm text-gray-500">Download your account data</div>
            </div>
          </button>
          
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Key className="w-5 h-5 text-gray-600" />
            <div className="text-left">
              <div className="font-medium text-gray-900">Change Password</div>
              <div className="text-sm text-gray-500">Update your login credentials</div>
            </div>
          </button>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-3 p-4 border border-error-200 text-error-600 rounded-lg hover:bg-error-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <div className="text-left">
              <div className="font-medium">Delete Account</div>
              <div className="text-sm text-error-500">Permanently remove your account</div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-8 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handlePasswordSubmit(handlePasswordChange)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your current password"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-error-600">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('newPassword', { 
                      required: 'New password is required',
                      validate: (value) => {
                        const validation = validatePassword(value);
                        return validation.isValid || 'Password does not meet requirements';
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your new password"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-error-600">{passwordErrors.newPassword.message}</p>
                  )}
                  
                  {/* Password Requirements */}
                  {newPassword && passwordValidation && (
                    <div className="mt-2 space-y-1">
                      <div className={`text-xs flex items-center ${passwordValidation.minLength ? 'text-success-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.minLength ? '✓' : '○'}</span>
                        At least 8 characters
                      </div>
                      <div className={`text-xs flex items-center ${passwordValidation.hasUpperCase ? 'text-success-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                        One uppercase letter
                      </div>
                      <div className={`text-xs flex items-center ${passwordValidation.hasLowerCase ? 'text-success-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                        One lowercase letter
                      </div>
                      <div className={`text-xs flex items-center ${passwordValidation.hasNumbers ? 'text-success-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.hasNumbers ? '✓' : '○'}</span>
                        One number
                      </div>
                      <div className={`text-xs flex items-center ${passwordValidation.hasSpecialChar ? 'text-success-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                        One special character
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    {...registerPassword('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: (value) => value === newPassword || 'Passwords do not match'
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Confirm your new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-error-600">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isChangingPassword && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>{isChangingPassword ? 'Changing...' : 'Change Password'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Compact Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-error-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-error-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDeletionSubmit(handleDeleteAccount)} className="p-6 space-y-4">
                {/* Security Notice */}
                <div className="bg-error-50 border border-error-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-4 h-4 text-error-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-error-800">Security Notice</h4>
                      <p className="text-xs text-error-700 mt-1">
                        Once deleted, this email and phone cannot be used to create a new account. This action is permanent.
                      </p>
                    </div>
                  </div>
                </div>

                {/* What will be removed */}
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Account deletion will permanently remove:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Your profile and personal information</li>
                    <li>• All saved quotes and conversations</li>
                    <li>• Your manufacturer shortlist and preferences</li>
                    <li>• All account data and history</li>
                    <li>• Access to any premium features</li>
                  </ul>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for deletion (required)
                  </label>
                  <textarea
                    {...registerDeletion('reason', { 
                      required: 'Please provide a reason',
                      minLength: { value: 10, message: 'Please provide a detailed reason (at least 10 characters)' }
                    })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    placeholder="Please tell us why you're deleting your account..."
                  />
                  {deletionErrors.reason && (
                    <p className="mt-1 text-xs text-error-600">{deletionErrors.reason.message}</p>
                  )}
                </div>

                {/* Confirmation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type "DELETE MY ACCOUNT" to confirm
                  </label>
                  <input
                    type="text"
                    {...registerDeletion('confirmation', { 
                      required: 'Please type the confirmation text',
                      validate: (value) => value === 'DELETE MY ACCOUNT' || 'Please type exactly "DELETE MY ACCOUNT"'
                    })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="DELETE MY ACCOUNT"
                  />
                  {deletionErrors.confirmation && (
                    <p className="mt-1 text-xs text-error-600">{deletionErrors.confirmation.message}</p>
                  )}
                </div>

                {/* Data Retention Notice */}
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-warning-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-warning-800">Data Retention Policy</h4>
                      <p className="text-xs text-warning-700 mt-1">
                        Some anonymized data may be retained for up to 1 year for security and compliance. Personal identifiers will be removed immediately.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeletingAccount || confirmationText !== 'DELETE MY ACCOUNT' || !deletionReason?.trim()}
                    className="flex items-center space-x-2 px-4 py-2 text-sm bg-error-600 text-white rounded-lg hover:bg-error-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDeletingAccount && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    <span>{isDeletingAccount ? 'Deleting...' : 'Delete Account'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};