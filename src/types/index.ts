export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'founder' | 'procurement_manager';
  company?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  linkedin?: string;
  createdAt: Date;
  subscription: 'freemium' | 'pro';
  quotesUsed: number;
  quotesLimit: number;
  preferences: UserPreferences;
  status: 'active' | 'suspended' | 'deleted' | 'pending_verification';
  deletedAt?: Date;
  deletionReason?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

export interface AuthenticationLog {
  id: string;
  email: string;
  action: 'login_success' | 'login_failed' | 'registration_attempt' | 'password_reset' | 'email_verification';
  reason?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  userId?: string;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface EmailVerification {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  verified: boolean;
  verifiedAt?: Date;
  attempts: number;
}

export interface DeletedAccount {
  id: string;
  originalUserId: string;
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  deletedAt: Date;
  deletionReason: string;
  deletedBy: string; // user ID who performed the deletion
  ipAddress?: string;
  userAgent?: string;
  dataRetentionUntil?: Date; // for GDPR compliance
  auditTrail: DeletionAuditEntry[];
}

export interface DeletionAuditEntry {
  id: string;
  timestamp: Date;
  action: 'account_deleted' | 'data_anonymized' | 'reregistration_attempted' | 'data_purged';
  performedBy: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RegistrationAttempt {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  attemptedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  blocked: boolean;
  blockReason?: string;
  deletedAccountId?: string;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    quoteUpdates: boolean;
    messages: boolean;
    statusChanges: boolean;
  };
  communication: {
    preferredMethod: 'email' | 'phone' | 'portal';
    timezone: string;
    businessHours: {
      start: string;
      end: string;
    };
  };
  dashboard: {
    defaultView: 'map' | 'list';
    autoRefresh: boolean;
    compactMode: boolean;
  };
}

export interface Manufacturer {
  // Basic Identification
  id: string;
  manufacturerID: string;
  name: string;
  
  // Geographic Information
  headquartersAddress: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  
  // Industry Classification
  naicsCode: string;
  sicCode: string;
  
  // Company Information
  yearEstablished: number;
  numberOfEmployees: number;
  annualRevenue: number;
  website: string;
  phone: string;
  email: string;
  industryKeywords: string;
  primaryApplications: string;
  ownershipType: string;
  parentCompany: string | null;
  numberOfBranches: number;
  
  // Factory Information
  factoryName: string;
  factoryAddress: string;
  productionCapacity: string;
  
  // Manufacturing Capabilities
  capabilities: string[];
  materials: string[];
  equipment: string[];
  certifications: string[];
  isoCertifications: string;
  environmentalPermits: string;
  rawMaterialSources: string;
  workforceSkills: string;
  safetyIncidentCount: number;
  keyProducts: string;
  contactPerson: string;
  contactEmail: string;
  factoryFloorArea: string;
  
  // Business Metrics
  moq: number;
  leadTimeDays: number;
  typicalPriceRange: string;
  diversityFlag: boolean;
  sustainabilityScore: number;
  lastVerifiedAt: Date;
  rating: number;
  distance?: number;
  
  // Additional Information
  photos: string[];
  description: string;
  foundedYear: number;
  employeeCount: string;
  specializations: string[];
  currentCapacity: number;
  maxCapacity: number;
  qualityCertifications: string[];
  historicalPerformance: {
    onTimeDelivery: number;
    qualityScore: number;
    communicationRating: number;
  };
}

export interface Quote {
  id: string;
  manufacturerId: string;
  projectId: string;
  status: 'pending' | 'received' | 'accepted' | 'rejected' | 'expired';
  pricePerUnit?: number;
  totalPrice?: number;
  leadTimeDays?: number;
  moq?: number;
  validUntil?: Date;
  files: QuoteFile[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  extractedData?: ExtractedQuoteData;
  score?: number;
}

export interface QuoteFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface ExtractedQuoteData {
  pricePerUnit: number;
  leadTime: number;
  moq: number;
  certifications: string[];
  paymentTerms: string;
  shippingTerms: string;
  warranty: string;
}

export interface Conversation {
  id: string;
  manufacturerId: string;
  userId: string;
  type: 'email' | 'direct_message' | 'portal' | 'voice';
  subject: string;
  status: 'active' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastMessageAt: Date;
  messages: Message[];
  tags: string[];
  assignedTo?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'manufacturer' | 'system';
  content: string;
  type: 'text' | 'file' | 'voice' | 'system';
  timestamp: Date;
  read: boolean;
  files?: MessageFile[];
}

export interface MessageFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'quote_update' | 'message' | 'status_change' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface VoiceSession {
  id: string;
  userId: string;
  agentId: string;
  transcript: string;
  status: 'active' | 'completed' | 'paused' | 'error';
  startedAt: Date;
  endedAt?: Date;
  duration?: number;
  extractedData?: any;
}

export interface ProjectIntake {
  userId: string;
  timestamp: Date;
  category: string;
  material: string;
  volume: number;
  targetCost: number;
  leadTimeGoal: number;
  certificationRequirements: string[];
  additionalRequirements?: string;
  location?: string;
}

export interface SearchFilters {
  capabilities: string[];
  materials: string[];
  certifications: string[];
  maxDistance: number;
  minMoq: number;
  maxMoq: number;
  maxLeadTime: number;
  minRating: number;
  diversityFlag?: boolean;
  sustainabilityScore?: number;
  minCapacity?: number;
}

export interface ResponseTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export interface PerformanceMetrics {
  responseTime: number;
  resolutionRate: number;
  customerSatisfaction: number;
  activeConversations: number;
  pendingQuotes: number;
  completedDeals: number;
}