import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { motion } from 'framer-motion';

export const VoiceInterface: React.FC = () => {
  const { 
    isVoiceActive, 
    voiceSession, 
    setVoiceActive, 
    startVoiceSession, 
    endVoiceSession,
    updateVoiceTranscript 
  } = useAppStore();

  const [isListening, setIsListening] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(false);

  // Mock voice integration - replace with actual ElevenLabs integration
  const handleVoiceToggle = () => {
    if (isVoiceActive) {
      endVoiceSession();
      setIsListening(false);
      setIsSpeaking(false);
    } else {
      startVoiceSession();
      // Mock conversation start
      setTimeout(() => {
        updateVoiceTranscript("AI: Hello! I'm your sourcing agent. I'll help you find the perfect U.S. manufacturer for your project. Let's start with what type of product are you looking to manufacture?");
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 3000);
      }, 1000);
    }
  };

  const mockResponses = [
    "Great! You're looking to manufacture electronics. What material will your product primarily be made from?",
    "Excellent choice with aluminum. What's your expected annual production volume?",
    "Perfect! 10,000 units annually is a good volume. What's your target cost per unit?",
    "Got it, $50 per unit. What's your ideal lead time for production?",
    "30 days is reasonable. Do you need any specific certifications like ISO 9001, UL listing, or others?",
    "Wonderful! I've gathered all the information I need. Let me search our database of verified U.S. manufacturers for you. This will take just a moment...",
  ];

  const [responseIndex, setResponseIndex] = React.useState(0);

  const handleMockUserResponse = (response: string) => {
    if (!voiceSession) return;
    
    const updatedTranscript = voiceSession.transcript + `\n\nYou: ${response}`;
    updateVoiceTranscript(updatedTranscript);
    
    setIsListening(false);
    
    // Mock AI response
    setTimeout(() => {
      if (responseIndex < mockResponses.length) {
        const aiResponse = `\n\nAI: ${mockResponses[responseIndex]}`;
        updateVoiceTranscript(updatedTranscript + aiResponse);
        setResponseIndex(prev => prev + 1);
        setIsSpeaking(true);
        
        setTimeout(() => {
          setIsSpeaking(false);
          if (responseIndex < mockResponses.length - 1) {
            setIsListening(true);
          } else {
            // End voice session and trigger search
            setTimeout(() => {
              endVoiceSession();
              // Here you would trigger the actual manufacturer search
            }, 2000);
          }
        }, 2000);
      }
    }, 1000);
  };

  if (!isVoiceActive || !voiceSession) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-96 max-w-sm z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse-soft" />
          <span className="text-sm font-medium text-gray-900">Voice Session Active</span>
        </div>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Voice Status */}
      <div className="text-center mb-4">
        <div className="relative inline-block">
          <motion.div
            animate={{
              scale: isListening ? [1, 1.2, 1] : isSpeaking ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: (isListening || isSpeaking) ? Infinity : 0,
            }}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isListening 
                ? 'bg-primary-600' 
                : isSpeaking 
                ? 'bg-secondary-600' 
                : 'bg-gray-300'
            }`}
          >
            {isListening ? (
              <Mic className="w-8 h-8 text-white" />
            ) : isSpeaking ? (
              <Volume2 className="w-8 h-8 text-white" />
            ) : (
              <MessageSquare className="w-8 h-8 text-white" />
            )}
          </motion.div>
          
          {(isListening || isSpeaking) && (
            <div className="absolute inset-0 rounded-full border-2 border-current opacity-30 animate-ping" />
          )}
        </div>
        
        <div className="mt-2">
          <div className="text-sm font-medium text-gray-900">
            {isListening 
              ? 'Listening...' 
              : isSpeaking 
              ? 'Speaking...' 
              : 'Ready'
            }
          </div>
          <div className="text-xs text-gray-500">
            {isListening 
              ? 'Speak now' 
              : isSpeaking 
              ? 'AI is responding' 
              : 'Voice session active'
            }
          </div>
        </div>
      </div>

      {/* Mock User Response Buttons (for demo purposes) */}
      {isListening && (
        <div className="space-y-2 mb-4">
          <div className="text-xs text-gray-500 text-center mb-2">Quick responses (demo):</div>
          {responseIndex === 0 && (
            <button
              onClick={() => handleMockUserResponse("I'm developing a smart home device, an IoT sensor hub")}
              className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
            >
              "I'm developing a smart home device, an IoT sensor hub"
            </button>
          )}
          {responseIndex === 1 && (
            <button
              onClick={() => handleMockUserResponse("It will be primarily aluminum with some plastic components")}
              className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
            >
              "It will be primarily aluminum with some plastic components"
            </button>
          )}
          {responseIndex === 2 && (
            <button
              onClick={() => handleMockUserResponse("We're planning for about 10,000 units per year initially")}
              className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
            >
              "We're planning for about 10,000 units per year initially"
            </button>
          )}
          {responseIndex === 3 && (
            <button
              onClick={() => handleMockUserResponse("Our target is around $50 per unit")}
              className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
            >
              "Our target is around $50 per unit"
            </button>
          )}
          {responseIndex === 4 && (
            <button
              onClick={() => handleMockUserResponse("We need about 30 days lead time")}
              className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
            >
              "We need about 30 days lead time"
            </button>
          )}
          {responseIndex === 5 && (
            <button
              onClick={() => handleMockUserResponse("Yes, we need UL listing and FCC certification")}
              className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
            >
              "Yes, we need UL listing and FCC certification"
            </button>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={handleVoiceToggle}
          className="flex items-center space-x-2 px-4 py-2 bg-error-600 text-white rounded-lg hover:bg-error-700 transition-colors"
        >
          <MicOff className="w-4 h-4" />
          <span>End Session</span>
        </button>
      </div>

      {/* Session Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        Session started at {voiceSession.startedAt.toLocaleTimeString()}
      </div>
    </motion.div>
  );
};