import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { InteractiveMap } from './components/map/InteractiveMap';
import { ElevenLabsVoice } from './components/voice/ElevenLabsVoice';
import { QuoteManagement } from './components/quotes/QuoteManagement';
import { CommunicationHub } from './components/communications/CommunicationHub';
import { ManufacturerDataTable } from './components/manufacturers/ManufacturerDataTable';
import { AccountPage } from './components/account/AccountPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { NotificationSettings } from './components/settings/NotificationSettings';
import { CommunicationSettings } from './components/settings/CommunicationSettings';
import { AuthModal } from './components/auth/AuthModal';
import { useAppStore } from './store/appStore';
import { useAuthStore } from './store/authStore';
import { 
  mockManufacturers, 
  mockQuotes, 
  mockConversations, 
  mockNotifications,
  mockResponseTemplates,
  mockPerformanceMetrics
} from './data/mockData';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

function App() {
  const { 
    setManufacturers,
    projectIntake,
    setProjectIntake,
    quotes,
    addQuote,
    conversations,
    notifications,
    addNotification,
    responseTemplates,
    addResponseTemplate,
    updatePerformanceMetrics
  } = useAppStore();
  
  const { isAuthenticated } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  React.useEffect(() => {
    // Load mock data
    setManufacturers(mockManufacturers);
    
    // Load quotes if not already loaded
    if (quotes.length === 0) {
      mockQuotes.forEach(quote => addQuote(quote));
    }
    
    // Load notifications if not already loaded
    if (notifications.length === 0) {
      mockNotifications.forEach(notification => addNotification(notification));
    }
    
    // Load response templates if not already loaded
    if (responseTemplates.length === 0) {
      mockResponseTemplates.forEach(template => addResponseTemplate(template));
    }
    
    // Load performance metrics
    updatePerformanceMetrics(mockPerformanceMetrics);
    
    // Set mock project intake for demo
    if (!projectIntake) {
      setProjectIntake({
        userId: '1',
        timestamp: new Date(),
        category: 'Electronics',
        material: 'Aluminum',
        volume: 10000,
        targetCost: 50,
        leadTimeGoal: 30,
        certificationRequirements: ['UL Listed', 'FCC'],
        additionalRequirements: 'IoT sensor hub with wireless connectivity',
        location: 'San Francisco, CA'
      });
    }
  }, [setManufacturers, projectIntake, setProjectIntake, quotes.length, addQuote, notifications.length, addNotification, responseTemplates.length, addResponseTemplate, updatePerformanceMetrics]);

  React.useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-bold text-3xl">F</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FactoryLink</h1>
            <p className="text-gray-600 mb-8">
              Connect with verified U.S. manufacturers
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        <Toaster position="top-right" />
      </>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <Header />
        
        {/* Main Layout */}
        <div className="flex">
          {/* Navigation Sidebar */}
          <Navigation />
          
          {/* Main Content */}
          <div className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Navigate to="/map" replace />} />
              <Route path="/map" element={<InteractiveMap />} />
              <Route path="/database" element={<ManufacturerDataTable />} />
              <Route path="/quotes" element={<QuoteManagement />} />
              <Route path="/conversations" element={<CommunicationHub />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/notifications" element={<NotificationSettings />} />
              <Route path="/settings/communications" element={<CommunicationSettings />} />
            </Routes>
          </div>
        </div>

        {/* Voice Interface */}
        <ElevenLabsVoice />
      </div>
    </Router>
  );
}

export default App;