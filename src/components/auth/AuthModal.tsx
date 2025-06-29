import React, { useState } from 'react';
import { X, Mail, Lock, User, Building, AlertTriangle, Shield, CheckCircle, Clock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    role: 'founder' as 'founder' | 'procurement_manager',
  });

  const { 
    login, 
    register, 
    isLoading, 
    checkDeletedAccount, 
    checkEmailExists, 
    validateEmailFormat,
    checkAccountLockout 
  } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'login') {
        // Additional client-side validation for login
        if (!validateEmailFormat(formData.email)) {
          toast.error('Please enter a valid email address.');
          return;
        }

        // Check for account lockout before attempting login
        const lockoutStatus = checkAccountLockout(formData.email);
        if (lockoutStatus.isLocked) {
          toast.error(`Account temporarily locked. Please try again in ${lockoutStatus.remainingTime} minutes.`, {
            duration: 6000,
            icon: '🔒',
          });
          return;
        }

        await login(formData.email, formData.password);
        toast.success('Welcome back!', {
          icon: '👋',
        });
      } else {
        // Registration validation
        if (!validateEmailFormat(formData.email)) {
          toast.error('Please enter a valid email address.');
          return;
        }

        // Check for deleted account before attempting registration
        const deletedAccount = checkDeletedAccount(formData.email, formData.phone);
        if (deletedAccount) {
          toast.error('This email address or phone number is associated with a permanently deleted account and cannot be used for registration.', {
            duration: 8000,
            icon: '🚫',
          });
          return;
        }

        // Check if email already exists
        if (checkEmailExists(formData.email)) {
          toast.error('An account with this email address already exists. Please use a different email or try logging in.', {
            duration: 6000,
            icon: '⚠️',
          });
          return;
        }

        await register(formData);
        toast.success('Account created successfully! Please check your email for verification.', {
          duration: 8000,
          icon: '✅',
        });
      }
      onClose();
    } catch (error: any) {
      // Enhanced error handling with specific error types
      if (error.message.includes('permanently deleted')) {
        toast.error(error.message, {
          duration: 8000,
          icon: '🚫',
        });
      } else if (error.message.includes('security policies')) {
        toast.error(error.message, {
          duration: 8000,
          icon: '🔒',
        });
      } else if (error.message.includes('temporarily locked')) {
        toast.error(error.message, {
          duration: 8000,
          icon: '⏰',
        });
      } else if (error.message.includes('No account found')) {
        toast.error(error.message, {
          duration: 6000,
          icon: '❌',
        });
      } else if (error.message.includes('already exists')) {
        toast.error(error.message, {
          duration: 6000,
          icon: '⚠️',
        });
      } else {
        toast.error(error.message || 'Authentication failed. Please try again.', {
          duration: 4000,
        });
      }
    }
  };

  const handleEmailChange = (email: string) => {
    setFormData({ ...formData, email });
    
    // Real-time email validation
    if (email.length > 0) {
      if (!validateEmailFormat(email)) {
        setEmailValidation({
          isValid: false,
          message: 'Please enter a valid email address'
        });
      } else if (mode === 'register') {
        // Check for deleted accounts during registration
        const deletedAccount = checkDeletedAccount(email);
        if (deletedAccount) {
          setEmailValidation({
            isValid: false,
            message: 'This email is associated with a permanently deleted account'
          });
        } else if (checkEmailExists(email)) {
          setEmailValidation({
            isValid: false,
            message: 'An account with this email already exists'
          });
        } else {
          setEmailValidation({
            isValid: true,
            message: 'Email is available'
          });
        }
      } else if (mode === 'login') {
        // Check if email exists for login
        if (!checkEmailExists(email)) {
          setEmailValidation({
            isValid: false,
            message: 'No account found with this email address'
          });
        } else {
          const lockoutStatus = checkAccountLockout(email);
          if (lockoutStatus.isLocked) {
            setEmailValidation({
              isValid: false,
              message: `Account temporarily locked (${lockoutStatus.remainingTime} min remaining)`
            });
          } else {
            setEmailValidation({
              isValid: true,
              message: 'Email found'
            });
          }
        }
      }
    } else {
      setEmailValidation(null);
    }
  };

  const validatePassword = (password: string) => {
    if (mode === 'login') return true;
    
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Security Notice for Registration */}
        {mode === 'register' && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-primary-800">Account Security</h4>
                <p className="text-sm text-primary-700 mt-1">
                  Email verification is required. Deleted account credentials cannot be reused for security.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="First name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Last name"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company (Optional)
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Your company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="founder">First-Time Founder</option>
                  <option value="procurement_manager">Procurement Manager</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                  emailValidation?.isValid === false ? 'border-error-500' : 
                  emailValidation?.isValid === true ? 'border-success-500' : 
                  'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {emailValidation?.isValid === true && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success-500 w-4 h-4" />
              )}
              {emailValidation?.isValid === false && (
                <AlertTriangle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-error-500 w-4 h-4" />
              )}
            </div>
            
            {/* Real-time email validation feedback */}
            {emailValidation && (
              <div className={`mt-2 p-2 rounded-lg text-sm ${
                emailValidation.isValid 
                  ? 'bg-success-50 border border-success-200 text-success-700' 
                  : 'bg-error-50 border border-error-200 text-error-700'
              }`}>
                <div className="flex items-start space-x-2">
                  {emailValidation.isValid ? (
                    <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-error-600 mt-0.5 flex-shrink-0" />
                  )}
                  <p>{emailValidation.message}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password requirements for registration */}
            {mode === 'register' && formData.password && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">Password Requirements:</p>
                <div className="space-y-1">
                  {[
                    { test: formData.password.length >= 8, label: 'At least 8 characters' },
                    { test: /[A-Z]/.test(formData.password), label: 'One uppercase letter' },
                    { test: /[a-z]/.test(formData.password), label: 'One lowercase letter' },
                    { test: /\d/.test(formData.password), label: 'One number' },
                    { test: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password), label: 'One special character' }
                  ].map((req, index) => (
                    <div key={index} className={`text-xs flex items-center ${req.test ? 'text-success-600' : 'text-gray-500'}`}>
                      <span className="mr-2">{req.test ? '✓' : '○'}</span>
                      {req.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || (emailValidation?.isValid === false) || (mode === 'register' && !validatePassword(formData.password))}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>
              {isLoading 
                ? 'Processing...' 
                : mode === 'login' 
                ? 'Sign In' 
                : 'Create Account'
              }
            </span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setEmailValidation(null);
              setFormData({
                email: '',
                password: '',
                firstName: '',
                lastName: '',
                company: '',
                phone: '',
                role: 'founder',
              });
            }}
            className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>

        {/* Security Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-500">
              <p className="font-medium mb-1">Security & Privacy</p>
              <p>Your data is protected with industry-standard encryption. By continuing, you agree to our Terms of Service and Privacy Policy.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};