import { create } from 'zustand';
import { User, UserPreferences, DeletedAccount, RegistrationAttempt, DeletionAuditEntry, AuthenticationLog, EmailVerification } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  deletedAccounts: DeletedAccount[];
  registrationAttempts: RegistrationAttempt[];
  authenticationLogs: AuthenticationLog[];
  emailVerifications: EmailVerification[];
  registeredEmails: string[]; // Mock database of registered emails
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'founder' | 'procurement_manager';
    company?: string;
    phone?: string;
  }) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  deleteAccount: (reason: string) => Promise<void>;
  checkDeletedAccount: (email: string, phone?: string) => DeletedAccount | null;
  checkEmailExists: (email: string) => boolean;
  logAuthenticationAttempt: (log: Omit<AuthenticationLog, 'id' | 'timestamp'>) => void;
  logRegistrationAttempt: (attempt: Omit<RegistrationAttempt, 'id' | 'attemptedAt'>) => void;
  addDeletionAuditEntry: (deletedAccountId: string, entry: Omit<DeletionAuditEntry, 'id' | 'timestamp'>) => void;
  sendEmailVerification: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendEmailVerification: (email: string) => Promise<void>;
  validateEmailFormat: (email: string) => boolean;
  checkAccountLockout: (email: string) => { isLocked: boolean; remainingTime?: number };
  incrementLoginAttempts: (email: string) => void;
  resetLoginAttempts: (email: string) => void;
}

const defaultPreferences: UserPreferences = {
  notifications: {
    email: true,
    push: true,
    sms: false,
    quoteUpdates: true,
    messages: true,
    statusChanges: true,
  },
  communication: {
    preferredMethod: 'email',
    timezone: 'America/New_York',
    businessHours: {
      start: '09:00',
      end: '17:00',
    },
  },
  dashboard: {
    defaultView: 'map',
    autoRefresh: true,
    compactMode: false,
  },
};

// Mock registered emails database
const mockRegisteredEmails = [
  'john.doe@example.com',
  'jane.smith@company.com',
  'admin@factorylink.com',
  'test.user@demo.com',
  'procurement@manufacturing.com'
];

// Mock deleted accounts for demonstration
const mockDeletedAccounts: DeletedAccount[] = [
  {
    id: 'del_001',
    originalUserId: 'user_deleted_001',
    email: 'deleted.user@example.com',
    firstName: 'John',
    lastName: 'Deleted',
    phone: '+1-555-0123',
    deletedAt: new Date('2024-01-15T10:30:00Z'),
    deletionReason: 'User requested account deletion',
    deletedBy: 'user_deleted_001',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    dataRetentionUntil: new Date('2025-01-15T10:30:00Z'),
    auditTrail: [
      {
        id: 'audit_001',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        action: 'account_deleted',
        performedBy: 'user_deleted_001',
        details: 'User initiated account deletion through settings page',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ]
  },
  {
    id: 'del_002',
    originalUserId: 'user_deleted_002',
    email: 'test.deleted@company.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1-555-0456',
    deletedAt: new Date('2024-02-01T14:20:00Z'),
    deletionReason: 'Account violation - spam activity',
    deletedBy: 'admin_001',
    ipAddress: '10.0.0.50',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    dataRetentionUntil: new Date('2025-02-01T14:20:00Z'),
    auditTrail: [
      {
        id: 'audit_002',
        timestamp: new Date('2024-02-01T14:20:00Z'),
        action: 'account_deleted',
        performedBy: 'admin_001',
        details: 'Account deleted by admin due to spam activity violations',
        ipAddress: '10.0.0.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    ]
  }
];

// Helper function to get client IP (mock)
const getClientIP = (): string => {
  // In a real application, this would get the actual client IP
  return '192.168.1.100';
};

// Helper function to generate verification token
const generateVerificationToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  deletedAccounts: mockDeletedAccounts,
  registrationAttempts: [],
  authenticationLogs: [],
  emailVerifications: [],
  registeredEmails: mockRegisteredEmails,

  validateEmailFormat: (email: string): boolean => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  },

  checkEmailExists: (email: string): boolean => {
    const { registeredEmails } = get();
    return registeredEmails.includes(email.toLowerCase());
  },

  checkAccountLockout: (email: string): { isLocked: boolean; remainingTime?: number } => {
    // In a real app, this would check the database for lockout status
    // For demo purposes, we'll simulate lockout logic
    const { authenticationLogs } = get();
    const recentFailedAttempts = authenticationLogs.filter(
      log => log.email === email && 
             log.action === 'login_failed' && 
             log.timestamp > new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
    );

    if (recentFailedAttempts.length >= 5) {
      const lastAttempt = recentFailedAttempts[recentFailedAttempts.length - 1];
      const lockoutEnd = new Date(lastAttempt.timestamp.getTime() + 15 * 60 * 1000); // 15 minute lockout
      const now = new Date();
      
      if (now < lockoutEnd) {
        return {
          isLocked: true,
          remainingTime: Math.ceil((lockoutEnd.getTime() - now.getTime()) / 1000 / 60) // minutes
        };
      }
    }

    return { isLocked: false };
  },

  incrementLoginAttempts: (email: string): void => {
    // In a real app, this would update the database
    console.log(`Incrementing login attempts for ${email}`);
  },

  resetLoginAttempts: (email: string): void => {
    // In a real app, this would reset the counter in the database
    console.log(`Resetting login attempts for ${email}`);
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    
    const clientIP = getClientIP();
    const userAgent = navigator.userAgent;

    try {
      // Validate email format
      if (!get().validateEmailFormat(email)) {
        throw new Error('Please enter a valid email address.');
      }

      // Check for account lockout
      const lockoutStatus = get().checkAccountLockout(email);
      if (lockoutStatus.isLocked) {
        get().logAuthenticationAttempt({
          email,
          action: 'login_failed',
          reason: 'Account temporarily locked due to multiple failed attempts',
          ipAddress: clientIP,
          userAgent,
          success: false,
          metadata: { lockoutRemainingMinutes: lockoutStatus.remainingTime }
        });
        
        throw new Error(`Account temporarily locked due to multiple failed login attempts. Please try again in ${lockoutStatus.remainingTime} minutes.`);
      }

      // Check if email exists in registered users
      if (!get().checkEmailExists(email)) {
        get().logAuthenticationAttempt({
          email,
          action: 'login_failed',
          reason: 'Email address not registered',
          ipAddress: clientIP,
          userAgent,
          success: false,
          metadata: { attemptedEmail: email }
        });

        get().incrementLoginAttempts(email);
        
        throw new Error('No account found with this email address. Please check your email or create a new account.');
      }

      // Check if this email belongs to a deleted account
      const deletedAccount = get().checkDeletedAccount(email);
      if (deletedAccount) {
        get().logAuthenticationAttempt({
          email,
          action: 'login_failed',
          reason: 'Attempted login with deleted account',
          ipAddress: clientIP,
          userAgent,
          success: false,
          metadata: { deletedAccountId: deletedAccount.id }
        });

        // Log the login attempt for audit purposes
        get().addDeletionAuditEntry(deletedAccount.id, {
          action: 'reregistration_attempted',
          performedBy: 'anonymous',
          details: `Login attempt with deleted account email: ${email}`,
          ipAddress: clientIP,
          userAgent
        });
        
        throw new Error('This account has been permanently deleted and cannot be restored. Please contact support if you believe this is an error.');
      }

      // Simulate password validation (in real app, this would be server-side)
      if (password.length < 6) {
        get().logAuthenticationAttempt({
          email,
          action: 'login_failed',
          reason: 'Invalid password',
          ipAddress: clientIP,
          userAgent,
          success: false
        });

        get().incrementLoginAttempts(email);
        
        throw new Error('Invalid email or password. Please try again.');
      }

      // Mock successful authentication
      const mockUser: User = {
        id: '1',
        email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'founder',
        company: 'TechStart Inc.',
        phone: '+1 (555) 123-4567',
        avatar: '',
        createdAt: new Date(),
        subscription: 'pro',
        quotesUsed: 2,
        quotesLimit: 15,
        preferences: defaultPreferences,
        status: 'active',
        emailVerified: true,
        lastLoginAt: new Date(),
        loginAttempts: 0
      };

      // Log successful login
      get().logAuthenticationAttempt({
        email,
        action: 'login_success',
        ipAddress: clientIP,
        userAgent,
        userId: mockUser.id,
        success: true,
        metadata: { loginMethod: 'email_password' }
      });

      // Reset login attempts on successful login
      get().resetLoginAttempts(email);
      
      set({ 
        user: mockUser, 
        isAuthenticated: true, 
        isLoading: false 
      });

    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    const { user } = get();
    if (user) {
      get().logAuthenticationAttempt({
        email: user.email,
        action: 'login_success', // Using login_success for logout tracking
        reason: 'User logout',
        ipAddress: getClientIP(),
        userAgent: navigator.userAgent,
        userId: user.id,
        success: true,
        metadata: { action: 'logout' }
      });
    }

    set({ 
      user: null, 
      isAuthenticated: false 
    });
  },

  sendEmailVerification: async (email: string): Promise<void> => {
    const token = generateVerificationToken();
    const verification: EmailVerification = {
      id: `verify_${Date.now()}`,
      email,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      createdAt: new Date(),
      verified: false,
      attempts: 0
    };

    set(state => ({
      emailVerifications: [...state.emailVerifications, verification]
    }));

    // In a real app, send email here
    console.log(`Verification email sent to ${email} with token: ${token}`);
  },

  verifyEmail: async (token: string): Promise<boolean> => {
    const { emailVerifications } = get();
    const verification = emailVerifications.find(v => v.token === token && !v.verified);

    if (!verification) {
      return false;
    }

    if (verification.expiresAt < new Date()) {
      return false;
    }

    // Mark as verified
    set(state => ({
      emailVerifications: state.emailVerifications.map(v =>
        v.id === verification.id
          ? { ...v, verified: true, verifiedAt: new Date() }
          : v
      )
    }));

    return true;
  },

  resendEmailVerification: async (email: string): Promise<void> => {
    // Invalidate existing tokens for this email
    set(state => ({
      emailVerifications: state.emailVerifications.map(v =>
        v.email === email ? { ...v, expiresAt: new Date() } : v
      )
    }));

    // Send new verification
    await get().sendEmailVerification(email);
  },

  register: async (userData) => {
    set({ isLoading: true });
    
    const clientIP = getClientIP();
    const userAgent = navigator.userAgent;

    try {
      // Validate email format
      if (!get().validateEmailFormat(userData.email)) {
        throw new Error('Please enter a valid email address.');
      }

      // Check if email already exists
      if (get().checkEmailExists(userData.email)) {
        get().logAuthenticationAttempt({
          email: userData.email,
          action: 'registration_attempt',
          reason: 'Email already registered',
          ipAddress: clientIP,
          userAgent,
          success: false,
          metadata: { attemptedEmail: userData.email }
        });

        throw new Error('An account with this email address already exists. Please use a different email or try logging in.');
      }

      // Check if this email or phone belongs to a deleted account
      const deletedAccount = get().checkDeletedAccount(userData.email, userData.phone);
      if (deletedAccount) {
        // Log the registration attempt
        const attemptId = `attempt_${Date.now()}`;
        const attempt: RegistrationAttempt = {
          id: attemptId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          attemptedAt: new Date(),
          ipAddress: clientIP,
          userAgent,
          blocked: true,
          blockReason: 'Email/phone associated with permanently deleted account',
          deletedAccountId: deletedAccount.id
        };
        
        get().logRegistrationAttempt(attempt);
        
        get().logAuthenticationAttempt({
          email: userData.email,
          action: 'registration_attempt',
          reason: 'Attempted registration with deleted account credentials',
          ipAddress: clientIP,
          userAgent,
          success: false,
          metadata: { deletedAccountId: deletedAccount.id }
        });
        
        // Add audit entry to the deleted account
        get().addDeletionAuditEntry(deletedAccount.id, {
          action: 'reregistration_attempted',
          performedBy: 'anonymous',
          details: `Registration attempt with deleted account credentials. Email: ${userData.email}${userData.phone ? `, Phone: ${userData.phone}` : ''}`,
          ipAddress: clientIP,
          userAgent
        });

        throw new Error('This email address or phone number is associated with a permanently deleted account and cannot be used for registration. Please use different credentials or contact support.');
      }

      // Check for similar personal information (additional security measure)
      const similarAccount = get().deletedAccounts.find(deleted => 
        deleted.firstName.toLowerCase() === userData.firstName.toLowerCase() &&
        deleted.lastName.toLowerCase() === userData.lastName.toLowerCase() &&
        (deleted.phone === userData.phone || deleted.email === userData.email)
      );

      if (similarAccount) {
        // Log suspicious registration attempt
        const attemptId = `attempt_${Date.now()}`;
        const attempt: RegistrationAttempt = {
          id: attemptId,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          attemptedAt: new Date(),
          ipAddress: clientIP,
          userAgent,
          blocked: true,
          blockReason: 'Similar personal information to deleted account',
          deletedAccountId: similarAccount.id
        };
        
        get().logRegistrationAttempt(attempt);
        
        get().logAuthenticationAttempt({
          email: userData.email,
          action: 'registration_attempt',
          reason: 'Similar personal information to deleted account',
          ipAddress: clientIP,
          userAgent,
          success: false,
          metadata: { similarAccountId: similarAccount.id }
        });
        
        get().addDeletionAuditEntry(similarAccount.id, {
          action: 'reregistration_attempted',
          performedBy: 'anonymous',
          details: `Registration attempt with similar personal information to deleted account`,
          ipAddress: clientIP,
          userAgent
        });

        throw new Error('Registration blocked due to security policies. Please contact support for assistance.');
      }

      // Log successful registration attempt (not blocked)
      const attemptId = `attempt_${Date.now()}`;
      const attempt: RegistrationAttempt = {
        id: attemptId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        attemptedAt: new Date(),
        ipAddress: clientIP,
        userAgent,
        blocked: false
      };
      
      get().logRegistrationAttempt(attempt);

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        company: userData.company,
        phone: userData.phone,
        avatar: '',
        createdAt: new Date(),
        subscription: 'freemium',
        quotesUsed: 0,
        quotesLimit: 3,
        preferences: defaultPreferences,
        status: 'pending_verification',
        emailVerified: false,
        loginAttempts: 0
      };

      // Add email to registered emails list
      set(state => ({
        registeredEmails: [...state.registeredEmails, userData.email.toLowerCase()]
      }));

      // Send email verification
      await get().sendEmailVerification(userData.email);

      // Log successful registration
      get().logAuthenticationAttempt({
        email: userData.email,
        action: 'registration_attempt',
        ipAddress: clientIP,
        userAgent,
        userId: newUser.id,
        success: true,
        metadata: { 
          registrationMethod: 'email_password',
          emailVerificationSent: true
        }
      });
      
      set({ 
        user: newUser, 
        isAuthenticated: true, 
        isLoading: false 
      });

    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateUser: (userData: Partial<User>) => {
    const { user } = get();
    if (user) {
      set({ 
        user: { ...user, ...userData } 
      });
    }
  },

  updatePreferences: (preferences: Partial<UserPreferences>) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          preferences: {
            ...user.preferences,
            ...preferences,
            notifications: {
              ...user.preferences.notifications,
              ...preferences.notifications,
            },
            communication: {
              ...user.preferences.communication,
              ...preferences.communication,
            },
            dashboard: {
              ...user.preferences.dashboard,
              ...preferences.dashboard,
            },
          },
        },
      });
    }
  },

  deleteAccount: async (reason: string) => {
    const { user } = get();
    if (!user) throw new Error('No user to delete');

    const clientIP = getClientIP();
    const userAgent = navigator.userAgent;

    try {
      // Create deleted account record
      const deletedAccount: DeletedAccount = {
        id: `del_${Date.now()}`,
        originalUserId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        deletedAt: new Date(),
        deletionReason: reason,
        deletedBy: user.id,
        ipAddress: clientIP,
        userAgent,
        dataRetentionUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year retention
        auditTrail: [
          {
            id: `audit_${Date.now()}`,
            timestamp: new Date(),
            action: 'account_deleted',
            performedBy: user.id,
            details: `User initiated account deletion. Reason: ${reason}`,
            ipAddress: clientIP,
            userAgent
          }
        ]
      };

      // Remove email from registered emails list
      set(state => ({
        registeredEmails: state.registeredEmails.filter(email => email !== user.email.toLowerCase())
      }));

      // Add to deleted accounts registry
      set(state => ({
        deletedAccounts: [...state.deletedAccounts, deletedAccount]
      }));

      // Log account deletion
      get().logAuthenticationAttempt({
        email: user.email,
        action: 'login_success', // Using for general account actions
        reason: 'Account deletion completed',
        ipAddress: clientIP,
        userAgent,
        userId: user.id,
        success: true,
        metadata: { 
          action: 'account_deletion',
          reason: reason
        }
      });

      // Mark user as deleted
      set({
        user: {
          ...user,
          status: 'deleted',
          deletedAt: new Date(),
          deletionReason: reason
        }
      });

    } catch (error) {
      throw new Error('Failed to delete account. Please try again.');
    }
  },

  checkDeletedAccount: (email: string, phone?: string): DeletedAccount | null => {
    const { deletedAccounts } = get();
    
    return deletedAccounts.find(deleted => 
      deleted.email.toLowerCase() === email.toLowerCase() ||
      (phone && deleted.phone === phone)
    ) || null;
  },

  logAuthenticationAttempt: (log: Omit<AuthenticationLog, 'id' | 'timestamp'>) => {
    const fullLog: AuthenticationLog = {
      ...log,
      id: `auth_${Date.now()}`,
      timestamp: new Date()
    };

    set(state => ({
      authenticationLogs: [...state.authenticationLogs, fullLog]
    }));

    // In a real app, this would also send to server for security monitoring
    console.log('Authentication Log:', fullLog);
  },

  logRegistrationAttempt: (attempt: Omit<RegistrationAttempt, 'id' | 'attemptedAt'>) => {
    const fullAttempt: RegistrationAttempt = {
      ...attempt,
      id: `attempt_${Date.now()}`,
      attemptedAt: new Date()
    };

    set(state => ({
      registrationAttempts: [...state.registrationAttempts, fullAttempt]
    }));
  },

  addDeletionAuditEntry: (deletedAccountId: string, entry: Omit<DeletionAuditEntry, 'id' | 'timestamp'>) => {
    const fullEntry: DeletionAuditEntry = {
      ...entry,
      id: `audit_${Date.now()}`,
      timestamp: new Date()
    };

    set(state => ({
      deletedAccounts: state.deletedAccounts.map(account =>
        account.id === deletedAccountId
          ? { ...account, auditTrail: [...account.auditTrail, fullEntry] }
          : account
      )
    }));
  }
}));