import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onResend: () => void;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  email, 
  onVerified, 
  onResend 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  
  const { verifyEmail, resendEmailVerification } = useAuthStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    try {
      const isValid = await verifyEmail(verificationCode);
      
      if (isValid) {
        toast.success('Email verified successfully!', {
          icon: '✅',
          duration: 4000,
        });
        onVerified();
      } else {
        toast.error('Invalid or expired verification code. Please try again.', {
          icon: '❌',
          duration: 4000,
        });
      }
    } catch (error) {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendEmailVerification(email);
      toast.success('Verification email sent!', {
        icon: '📧',
        duration: 4000,
      });
      setCanResend(false);
      setCountdown(60);
      onResend();
    } catch (error) {
      toast.error('Failed to resend verification email');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600">
          We've sent a verification code to
        </p>
        <p className="font-medium text-gray-900">{email}</p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 text-center text-lg font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 tracking-widest"
            placeholder="000000"
            maxLength={6}
          />
          <p className="text-xs text-gray-500 mt-1 text-center">
            Enter the 6-digit code from your email
          </p>
        </div>

        <button
          type="submit"
          disabled={isVerifying || verificationCode.length !== 6}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isVerifying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Verify Email</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Didn't receive the code?
        </p>
        
        {canResend ? (
          <button
            onClick={handleResend}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium mx-auto transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Resend Code</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 text-gray-500 mx-auto">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Resend available in {countdown}s
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">Security Notice</p>
            <p>
              This verification step helps protect your account. The code expires in 24 hours.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};