import { create } from 'zustand';
import { 
  Manufacturer, 
  ProjectIntake, 
  SearchFilters, 
  VoiceSession, 
  Quote, 
  Conversation, 
  Notification,
  ResponseTemplate,
  PerformanceMetrics
} from '../types';

interface AppState {
  // Project and search state
  projectIntake: ProjectIntake | null;
  manufacturers: Manufacturer[];
  filteredManufacturers: Manufacturer[];
  selectedManufacturer: Manufacturer | null;
  shortlist: Manufacturer[];
  searchFilters: SearchFilters;
  
  // UI state
  activeTab: 'matches' | 'map';
  isProfilePanelOpen: boolean;
  isVoiceActive: boolean;
  isLoading: boolean;
  
  // Voice session
  voiceSession: VoiceSession | null;
  
  // Quotes
  quotes: Quote[];
  selectedQuotes: Quote[];
  
  // Conversations
  conversations: Conversation[];
  activeConversation: Conversation | null;
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Templates
  responseTemplates: ResponseTemplate[];
  
  // Performance
  performanceMetrics: PerformanceMetrics | null;
  
  // Actions
  setProjectIntake: (intake: ProjectIntake) => void;
  setManufacturers: (manufacturers: Manufacturer[]) => void;
  setSelectedManufacturer: (manufacturer: Manufacturer | null) => void;
  addToShortlist: (manufacturer: Manufacturer) => void;
  removeFromShortlist: (manufacturerId: string) => void;
  clearShortlist: () => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  setActiveTab: (tab: 'matches' | 'map') => void;
  setProfilePanelOpen: (isOpen: boolean) => void;
  setVoiceActive: (isActive: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  startVoiceSession: () => void;
  endVoiceSession: () => void;
  updateVoiceTranscript: (transcript: string) => void;
  searchManufacturers: (query?: string) => void;
  
  // Quote actions
  addQuote: (quote: Quote) => void;
  updateQuote: (quoteId: string, updates: Partial<Quote>) => void;
  selectQuoteForComparison: (quote: Quote) => void;
  removeQuoteFromComparison: (quoteId: string) => void;
  
  // Conversation actions
  setActiveConversation: (conversation: Conversation | null) => void;
  addMessage: (conversationId: string, message: any) => void;
  markConversationAsRead: (conversationId: string) => void;
  
  // Notification actions
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Template actions
  addResponseTemplate: (template: ResponseTemplate) => void;
  updateResponseTemplate: (templateId: string, updates: Partial<ResponseTemplate>) => void;
  deleteResponseTemplate: (templateId: string) => void;
  
  // Performance actions
  updatePerformanceMetrics: (metrics: PerformanceMetrics) => void;
}

const defaultFilters: SearchFilters = {
  capabilities: [],
  materials: [],
  certifications: [],
  maxDistance: 500,
  minMoq: 0,
  maxMoq: 100000,
  maxLeadTime: 365,
  minRating: 0,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  projectIntake: null,
  manufacturers: [],
  filteredManufacturers: [],
  selectedManufacturer: null,
  shortlist: [],
  searchFilters: defaultFilters,
  activeTab: 'matches',
  isProfilePanelOpen: false,
  isVoiceActive: false,
  isLoading: false,
  voiceSession: null,
  quotes: [],
  selectedQuotes: [],
  conversations: [],
  activeConversation: null,
  notifications: [],
  unreadCount: 0,
  responseTemplates: [],
  performanceMetrics: null,

  // Actions
  setProjectIntake: (intake) => set({ projectIntake: intake }),
  
  setManufacturers: (manufacturers) => {
    set({ 
      manufacturers,
      filteredManufacturers: manufacturers,
    });
  },
  
  setSelectedManufacturer: (manufacturer) => {
    set({ 
      selectedManufacturer: manufacturer,
      isProfilePanelOpen: !!manufacturer,
    });
  },
  
  addToShortlist: (manufacturer) => {
    const { shortlist } = get();
    if (shortlist.length < 5 && !shortlist.find(m => m.id === manufacturer.id)) {
      set({ shortlist: [...shortlist, manufacturer] });
    }
  },
  
  removeFromShortlist: (manufacturerId) => {
    const { shortlist } = get();
    set({ shortlist: shortlist.filter(m => m.id !== manufacturerId) });
  },
  
  clearShortlist: () => set({ shortlist: [] }),
  
  setSearchFilters: (filters) => {
    const { searchFilters } = get();
    const newFilters = { ...searchFilters, ...filters };
    set({ searchFilters: newFilters });
    get().searchManufacturers();
  },
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  setProfilePanelOpen: (isOpen) => set({ isProfilePanelOpen: isOpen }),
  setVoiceActive: (isActive) => set({ isVoiceActive: isActive }),
  setLoading: (isLoading) => set({ isLoading: isLoading }),
  
  startVoiceSession: () => {
    const session: VoiceSession = {
      id: Date.now().toString(),
      userId: '1',
      agentId: 'agent_01jxea051nek1svtgdx4px1hcq',
      transcript: '',
      status: 'active',
      startedAt: new Date(),
    };
    set({ 
      voiceSession: session,
      isVoiceActive: true,
    });
  },
  
  endVoiceSession: () => {
    const { voiceSession } = get();
    if (voiceSession) {
      set({
        voiceSession: {
          ...voiceSession,
          status: 'completed',
          endedAt: new Date(),
          duration: Date.now() - voiceSession.startedAt.getTime(),
        },
        isVoiceActive: false,
      });
    }
  },
  
  updateVoiceTranscript: (transcript) => {
    const { voiceSession } = get();
    if (voiceSession) {
      set({
        voiceSession: {
          ...voiceSession,
          transcript,
        },
      });
    }
  },
  
  searchManufacturers: (query) => {
    const { manufacturers, searchFilters } = get();
    let filtered = [...manufacturers];
    
    // Apply filters
    if (searchFilters.capabilities.length > 0) {
      filtered = filtered.filter(m => 
        searchFilters.capabilities.some(cap => m.capabilities.includes(cap))
      );
    }
    
    if (searchFilters.materials.length > 0) {
      filtered = filtered.filter(m => 
        searchFilters.materials.some(mat => m.materials.includes(mat))
      );
    }
    
    if (searchFilters.certifications.length > 0) {
      filtered = filtered.filter(m => 
        searchFilters.certifications.some(cert => m.certifications.includes(cert))
      );
    }
    
    filtered = filtered.filter(m => {
      return (
        (m.distance || 0) <= searchFilters.maxDistance &&
        m.moq >= searchFilters.minMoq &&
        m.moq <= searchFilters.maxMoq &&
        m.leadTimeDays <= searchFilters.maxLeadTime &&
        m.rating >= searchFilters.minRating
      );
    });
    
    if (searchFilters.diversityFlag !== undefined) {
      filtered = filtered.filter(m => m.diversityFlag === searchFilters.diversityFlag);
    }
    
    if (searchFilters.minCapacity !== undefined) {
      filtered = filtered.filter(m => m.currentCapacity >= searchFilters.minCapacity);
    }
    
    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm) ||
        m.city.toLowerCase().includes(searchTerm) ||
        m.state.toLowerCase().includes(searchTerm) ||
        m.capabilities.some(cap => cap.toLowerCase().includes(searchTerm)) ||
        m.materials.some(mat => mat.toLowerCase().includes(searchTerm))
      );
    }
    
    set({ filteredManufacturers: filtered });
  },
  
  // Quote actions
  addQuote: (quote) => {
    const { quotes } = get();
    set({ quotes: [...quotes, quote] });
  },
  
  updateQuote: (quoteId, updates) => {
    const { quotes } = get();
    set({
      quotes: quotes.map(q => q.id === quoteId ? { ...q, ...updates } : q)
    });
  },
  
  selectQuoteForComparison: (quote) => {
    const { selectedQuotes } = get();
    if (selectedQuotes.length < 5 && !selectedQuotes.find(q => q.id === quote.id)) {
      set({ selectedQuotes: [...selectedQuotes, quote] });
    }
  },
  
  removeQuoteFromComparison: (quoteId) => {
    const { selectedQuotes } = get();
    set({ selectedQuotes: selectedQuotes.filter(q => q.id !== quoteId) });
  },
  
  // Conversation actions
  setActiveConversation: (conversation) => set({ activeConversation: conversation }),
  
  addMessage: (conversationId, message) => {
    const { conversations } = get();
    set({
      conversations: conversations.map(c => 
        c.id === conversationId 
          ? { ...c, messages: [...c.messages, message], lastMessageAt: new Date() }
          : c
      )
    });
  },
  
  markConversationAsRead: (conversationId) => {
    const { conversations } = get();
    set({
      conversations: conversations.map(c => 
        c.id === conversationId 
          ? { 
              ...c, 
              messages: c.messages.map(m => ({ ...m, read: true }))
            }
          : c
      )
    });
  },
  
  // Notification actions
  addNotification: (notification) => {
    const { notifications, unreadCount } = get();
    set({ 
      notifications: [notification, ...notifications],
      unreadCount: unreadCount + 1
    });
  },
  
  markNotificationAsRead: (notificationId) => {
    const { notifications, unreadCount } = get();
    set({
      notifications: notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, unreadCount - 1)
    });
  },
  
  markAllNotificationsAsRead: () => {
    const { notifications } = get();
    set({
      notifications: notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    });
  },
  
  // Template actions
  addResponseTemplate: (template) => {
    const { responseTemplates } = get();
    set({ responseTemplates: [...responseTemplates, template] });
  },
  
  updateResponseTemplate: (templateId, updates) => {
    const { responseTemplates } = get();
    set({
      responseTemplates: responseTemplates.map(t => 
        t.id === templateId ? { ...t, ...updates } : t
      )
    });
  },
  
  deleteResponseTemplate: (templateId) => {
    const { responseTemplates } = get();
    set({
      responseTemplates: responseTemplates.filter(t => t.id !== templateId)
    });
  },
  
  // Performance actions
  updatePerformanceMetrics: (metrics) => set({ performanceMetrics: metrics }),
}));