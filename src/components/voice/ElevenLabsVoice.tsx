import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, Phone, MessageSquare, AlertCircle, Settings, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface ElevenLabsConfig {
  apiKey: string;
  agentId: string;
}

interface ConversationState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
  microphonePermission: 'granted' | 'denied' | 'prompt' | 'checking';
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  wsConnectionState: 'closed' | 'connecting' | 'open' | 'closing';
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  startTime: string;
  messageCount: number;
  topicsDiscussed: string[];
}

export const ElevenLabsVoice: React.FC = () => {
  const { 
    isVoiceActive, 
    voiceSession, 
    startVoiceSession, 
    endVoiceSession,
    updateVoiceTranscript 
  } = useAppStore();

  const [config] = useState<ElevenLabsConfig>({
    apiKey: import.meta.env.VITE_ELEVEN_API_KEY || '',
    agentId: import.meta.env.VITE_ELEVEN_AGENT_ID || 'agent_01jxea051nek1svtgdx4px1hcq'
  });

  const [conversationState, setConversationState] = useState<ConversationState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    error: null,
    microphonePermission: 'prompt',
    connectionStatus: 'disconnected',
    wsConnectionState: 'closed'
  });

  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    userId: 'user_123',
    sessionId: `session_${Date.now()}`,
    startTime: new Date().toISOString(),
    messageCount: 0,
    topicsDiscussed: []
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showPermissionHelp, setShowPermissionHelp] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioLevelIntervalRef = useRef<number | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Add debug logging
  const addDebugLog = (message: string) => {
    console.log(`🔧 [ElevenLabs Debug] ${message}`);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Test microphone access with better error handling
  const testMicrophoneAccess = async (): Promise<boolean> => {
    addDebugLog('Testing microphone access...');
    
    try {
      setConversationState(prev => ({ ...prev, microphonePermission: 'checking' }));
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Request microphone access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        } 
      });
      
      addDebugLog('✅ Microphone access granted');
      setConversationState(prev => ({ ...prev, microphonePermission: 'granted', error: null }));
      toast.success('🎤 Microphone access granted');
      
      // Test audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      addDebugLog(`🔊 AudioContext created: ${audioContext.state}`);
      
      // Clean up test stream
      stream.getTracks().forEach(track => track.stop());
      audioContext.close();
      
      return true;
    } catch (error: any) {
      addDebugLog(`❌ Microphone access failed: ${error.message}`);
      
      if (error.name === 'NotAllowedError') {
        setConversationState(prev => ({ 
          ...prev, 
          error: 'Microphone access denied. Please allow microphone access in your browser settings.',
          microphonePermission: 'denied',
          connectionStatus: 'error'
        }));
        toast.error('🚫 Microphone access denied');
        setShowPermissionHelp(true);
      } else if (error.name === 'NotFoundError') {
        setConversationState(prev => ({ 
          ...prev, 
          error: 'No microphone found. Please connect a microphone and try again.',
          connectionStatus: 'error'
        }));
        toast.error('🎤 No microphone found');
      } else if (error.name === 'NotSupportedError') {
        setConversationState(prev => ({ 
          ...prev, 
          error: 'Your browser does not support microphone access.',
          connectionStatus: 'error'
        }));
        toast.error('🌐 Browser not supported');
      } else {
        setConversationState(prev => ({ 
          ...prev, 
          error: `Microphone error: ${error.message}`,
          connectionStatus: 'error'
        }));
        toast.error('🎤 Microphone setup failed');
      }
      return false;
    }
  };

  // Validate configuration with better error messages
  const validateConfiguration = (): boolean => {
    addDebugLog('Validating ElevenLabs configuration...');
    
    if (!config.apiKey) {
      const errorMsg = 'ElevenLabs API key not found. Please check your .env file contains VITE_ELEVEN_API_KEY.';
      setConversationState(prev => ({ 
        ...prev, 
        error: errorMsg,
        connectionStatus: 'error'
      }));
      addDebugLog(`❌ ${errorMsg}`);
      toast.error('⚙️ API key missing');
      return false;
    }

    if (!config.agentId) {
      const errorMsg = 'ElevenLabs Agent ID not found. Please check your .env file contains VITE_ELEVEN_AGENT_ID.';
      setConversationState(prev => ({ 
        ...prev, 
        error: errorMsg,
        connectionStatus: 'error'
      }));
      addDebugLog(`❌ ${errorMsg}`);
      toast.error('⚙️ Agent ID missing');
      return false;
    }

    addDebugLog('✅ Configuration valid');
    return true;
  };

  // Initialize audio interface with better error handling
  const initializeAudioInterface = async (): Promise<MediaStream> => {
    try {
      addDebugLog('Initializing audio interface...');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        } 
      });
      
      mediaStreamRef.current = stream;
      addDebugLog('✅ Media stream acquired');

      // Initialize AudioContext
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });

      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        addDebugLog('🔄 AudioContext resumed');
      }

      // Create gain node for volume control
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);

      // Setup audio level monitoring
      setupAudioLevelMonitoring(stream);
      
      addDebugLog('✅ Audio interface initialized');
      return stream;
    } catch (error: any) {
      addDebugLog(`❌ Failed to initialize audio interface: ${error.message}`);
      throw error;
    }
  };

  // Setup audio level monitoring for visual feedback
  const setupAudioLevelMonitoring = (stream: MediaStream) => {
    if (!audioContextRef.current) return;

    const source = audioContextRef.current.createMediaStreamSource(stream);
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    
    source.connect(analyserRef.current);

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (analyserRef.current && conversationState.isListening) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average / 255); // Normalize to 0-1
      }
      if (conversationState.isListening) {
        audioLevelIntervalRef.current = requestAnimationFrame(updateAudioLevel);
      }
    };
    
    updateAudioLevel();
    addDebugLog('🎚️ Audio level monitoring started');
  };

  // Create real ElevenLabs WebSocket connection
  const createElevenLabsWebSocket = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        addDebugLog('Creating ElevenLabs WebSocket connection...');
        
        // ElevenLabs Conversational AI WebSocket URL
        const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${config.agentId}`;
        
        setConversationState(prev => ({ ...prev, wsConnectionState: 'connecting' }));
        
        wsRef.current = new WebSocket(wsUrl);
        
        wsRef.current.onopen = () => {
          addDebugLog('✅ WebSocket connection opened');
          setConversationState(prev => ({ 
            ...prev, 
            isConnected: true, 
            connectionStatus: 'connected',
            wsConnectionState: 'open',
            error: null
          }));
          
          // Send authentication
          const authMessage = {
            type: 'auth',
            api_key: config.apiKey
          };
          
          wsRef.current?.send(JSON.stringify(authMessage));
          addDebugLog('🔐 Authentication sent');
          
          resolve();
        };

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            addDebugLog(`📨 Received message: ${data.type}`);
            
            switch (data.type) {
              case 'auth_success':
                addDebugLog('✅ Authentication successful');
                toast.success('🤖 Connected to voice agent');
                
                // Start listening after successful auth
                setConversationState(prev => ({ 
                  ...prev, 
                  isListening: true 
                }));
                
                // Send initial greeting
                setTimeout(() => {
                  const greeting = "Hello! I'm your AI sourcing agent. I'll help you find the perfect U.S. manufacturer for your project. What type of product are you looking to manufacture?";
                  handleAgentResponse(greeting);
                }, 1000);
                break;
                
              case 'auth_error':
                addDebugLog(`❌ Authentication failed: ${data.message}`);
                setConversationState(prev => ({ 
                  ...prev, 
                  error: `Authentication failed: ${data.message}`,
                  connectionStatus: 'error'
                }));
                break;
                
              case 'audio':
                // Handle incoming audio from agent
                if (data.audio_base64 && !isMuted) {
                  playAudioFromBase64(data.audio_base64);
                }
                break;
                
              case 'transcript':
                // Handle transcript updates
                if (data.text) {
                  handleAgentResponse(data.text);
                }
                break;
                
              case 'error':
                addDebugLog(`❌ WebSocket error: ${data.message}`);
                setConversationState(prev => ({ 
                  ...prev, 
                  error: data.message,
                  connectionStatus: 'error'
                }));
                break;
            }
          } catch (error) {
            addDebugLog(`❌ Error parsing WebSocket message: ${error}`);
          }
        };

        wsRef.current.onerror = (error) => {
          addDebugLog(`❌ WebSocket error: ${error}`);
          setConversationState(prev => ({ 
            ...prev, 
            error: 'WebSocket connection failed',
            connectionStatus: 'error',
            wsConnectionState: 'closed'
          }));
          reject(error);
        };

        wsRef.current.onclose = (event) => {
          addDebugLog(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
          setConversationState(prev => ({ 
            ...prev, 
            isConnected: false,
            wsConnectionState: 'closed'
          }));
          
          // Attempt to reconnect if not intentionally closed
          if (event.code !== 1000 && isVoiceActive) {
            addDebugLog('🔄 Attempting to reconnect...');
            reconnectTimeoutRef.current = window.setTimeout(() => {
              createElevenLabsWebSocket().catch(console.error);
            }, 3000);
          }
        };

      } catch (error) {
        addDebugLog(`❌ Failed to create WebSocket: ${error}`);
        reject(error);
      }
    });
  };

  // Play audio from base64 data
  const playAudioFromBase64 = async (audioBase64: string) => {
    try {
      if (!audioContextRef.current) return;
      
      const audioData = atob(audioBase64);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      
      if (gainNodeRef.current) {
        source.connect(gainNodeRef.current);
      } else {
        source.connect(audioContextRef.current.destination);
      }
      
      setConversationState(prev => ({ 
        ...prev, 
        isSpeaking: true, 
        isListening: false 
      }));
      
      source.onended = () => {
        setConversationState(prev => ({ 
          ...prev, 
          isSpeaking: false, 
          isListening: true 
        }));
      };
      
      source.start();
      addDebugLog('🔊 Playing audio response');
      
    } catch (error) {
      addDebugLog(`❌ Error playing audio: ${error}`);
      // Fallback to text-to-speech
      setConversationState(prev => ({ 
        ...prev, 
        isSpeaking: false, 
        isListening: true 
      }));
    }
  };

  // Initialize ElevenLabs Conversational AI
  const initializeElevenLabsConversation = async () => {
    addDebugLog('🚀 Starting ElevenLabs conversation initialization...');
    
    if (!validateConfiguration()) return;

    setIsInitializing(true);
    setConversationState(prev => ({ 
      ...prev, 
      error: null, 
      connectionStatus: 'connecting' 
    }));

    try {
      // Step 1: Test microphone access
      const microphoneOk = await testMicrophoneAccess();
      if (!microphoneOk) {
        throw new Error('Microphone access failed');
      }

      // Step 2: Initialize audio interface
      await initializeAudioInterface();
      
      // Step 3: Create WebSocket connection
      await createElevenLabsWebSocket();
      
      addDebugLog('✅ ElevenLabs conversation initialized successfully');
      
    } catch (error: any) {
      addDebugLog(`❌ Failed to initialize ElevenLabs conversation: ${error.message}`);
      setConversationState(prev => ({ 
        ...prev, 
        connectionStatus: 'error',
        error: error.message
      }));
      toast.error('Failed to initialize voice session');
    } finally {
      setIsInitializing(false);
    }
  };

  // Handle agent responses
  const handleAgentResponse = (response: string) => {
    addDebugLog(`🤖 Agent: ${response.substring(0, 50)}...`);
    
    const currentTranscript = voiceSession?.transcript || '';
    updateVoiceTranscript(`${currentTranscript}\n\nAI: ${response}`);
    
    // Update conversation context
    setConversationContext(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1
    }));
    
    // Speak the response if not muted (fallback TTS)
    if (!isMuted && !conversationState.isSpeaking) {
      speakText(response);
    }
  };

  // Handle user transcripts
  const handleUserTranscript = (transcript: string) => {
    addDebugLog(`👤 User: ${transcript.substring(0, 50)}...`);
    
    const currentTranscript = voiceSession?.transcript || '';
    updateVoiceTranscript(`${currentTranscript}\n\nYou: ${transcript}`);
    
    // Send to ElevenLabs WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'user_audio_chunk',
        audio_base64: '', // Would need to implement audio encoding
        text: transcript // Send text for now
      };
      wsRef.current.send(JSON.stringify(message));
    }
    
    // Update conversation context
    setConversationContext(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1,
      topicsDiscussed: extractTopics(transcript, prev.topicsDiscussed)
    }));
    
    setConversationState(prev => ({ 
      ...prev, 
      isListening: false 
    }));
  };

  // Extract topics from user messages
  const extractTopics = (content: string, existingTopics: string[]): string[] => {
    const words = content.toLowerCase().split(/\s+/);
    const newTopics = [...existingTopics];
    
    if (words.some(word => ['manufacturing', 'supplier', 'factory', 'production'].includes(word))) {
      if (!newTopics.includes('manufacturing')) {
        newTopics.push('manufacturing');
      }
    }
    
    if (words.some(word => ['electronics', 'pcb', 'circuit', 'sensor'].includes(word))) {
      if (!newTopics.includes('electronics')) {
        newTopics.push('electronics');
      }
    }
    
    return newTopics;
  };

  // Text-to-speech implementation (fallback)
  const speakText = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setConversationState(prev => ({ 
        ...prev, 
        isSpeaking: true, 
        isListening: false 
      }));
    };

    utterance.onend = () => {
      setConversationState(prev => ({ 
        ...prev, 
        isSpeaking: false, 
        isListening: true 
      }));
    };

    speechSynthesis.speak(utterance);
    addDebugLog('🗣️ Using fallback TTS');
  };

  // Cleanup function
  const endConversationSession = () => {
    addDebugLog('🛑 Ending conversation session...');
    
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Stop audio level monitoring
    if (audioLevelIntervalRef.current) {
      cancelAnimationFrame(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close(1000, 'Session ended by user');
      wsRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop any ongoing speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    setConversationState({
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      error: null,
      microphonePermission: 'prompt',
      connectionStatus: 'disconnected',
      wsConnectionState: 'closed'
    });
    setAudioLevel(0);
    
    addDebugLog('✅ Conversation session ended');
  };

  // Main toggle function
  const handleVoiceToggle = async () => {
    if (isVoiceActive) {
      endVoiceSession();
      endConversationSession();
    } else {
      startVoiceSession();
      await initializeElevenLabsConversation();
    }
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      // Stop any ongoing speech
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      toast.success('🔇 Audio muted');
    } else {
      toast.success('🔊 Audio unmuted');
    }
  };

  const handleRetry = () => {
    setConversationState(prev => ({ ...prev, error: null }));
    initializeElevenLabsConversation();
  };

  // Mock conversation responses for demo
  const mockResponses = [
    "Great! You're looking to manufacture electronics. What material will your product primarily be made from?",
    "Excellent choice with aluminum. What's your expected annual production volume?",
    "Perfect! 10,000 units annually is a good volume. What's your target cost per unit?",
    "Got it, $50 per unit. What's your ideal lead time for production?",
    "30 days is reasonable. Do you need any specific certifications like ISO 9001, UL listing, or others?",
    "Wonderful! I've gathered all the information I need. Let me search our database of verified U.S. manufacturers for you. This will take just a moment...",
  ];

  const [responseIndex, setResponseIndex] = useState(0);

  const handleMockUserResponse = (response: string) => {
    if (!voiceSession) return;
    
    handleUserTranscript(response);
    
    setTimeout(() => {
      if (responseIndex < mockResponses.length) {
        const aiResponse = mockResponses[responseIndex];
        handleAgentResponse(aiResponse);
        setResponseIndex(prev => prev + 1);
        
        if (responseIndex >= mockResponses.length - 1) {
          setTimeout(() => {
            endVoiceSession();
            endConversationSession();
          }, 3000);
        }
      }
    }, 1000);
  };

  // Test audio permissions on component mount
  useEffect(() => {
    addDebugLog('🎬 ElevenLabsVoice component mounted');
    
    return () => {
      addDebugLog('🎬 ElevenLabsVoice component unmounting');
      endConversationSession();
    };
  }, []);

  if (!isVoiceActive || !voiceSession) {
    return null;
  }

  const getStatusText = () => {
    if (isInitializing) return 'Initializing...';
    if (conversationState.error) return 'Connection Error';
    if (conversationState.microphonePermission === 'denied') return 'Microphone Denied';
    if (conversationState.microphonePermission === 'checking') return 'Requesting Microphone...';
    if (conversationState.connectionStatus === 'connecting') return 'Connecting...';
    if (!conversationState.isConnected) return 'Disconnected';
    if (conversationState.isSpeaking) return 'AI Speaking...';
    if (conversationState.isListening) return 'Listening...';
    return 'Ready';
  };

  const getStatusColor = () => {
    if (conversationState.error || conversationState.microphonePermission === 'denied') return 'bg-error-500';
    if (conversationState.connectionStatus === 'connecting' || conversationState.microphonePermission === 'checking') return 'bg-warning-500';
    if (conversationState.isListening) return 'bg-primary-600';
    if (conversationState.isSpeaking) return 'bg-secondary-600';
    if (conversationState.isConnected) return 'bg-success-500';
    return 'bg-gray-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-96 max-w-sm z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full animate-pulse ${getStatusColor()}`} />
          <span className="text-sm font-medium text-gray-900">
            ElevenLabs Voice Agent
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMute}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          {conversationState.error && (
            <button
              onClick={handleRetry}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Retry connection"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Status Display */}
      <div className="text-center mb-4">
        <div className="relative inline-block">
          <motion.div
            animate={{
              scale: conversationState.isListening || conversationState.isSpeaking ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: (conversationState.isListening || conversationState.isSpeaking) ? Infinity : 0,
            }}
            className={`w-16 h-16 rounded-full flex items-center justify-center ${getStatusColor()}`}
          >
            {isInitializing ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : conversationState.error || conversationState.microphonePermission === 'denied' ? (
              <AlertCircle className="w-8 h-8 text-white" />
            ) : conversationState.isListening ? (
              <Mic className="w-8 h-8 text-white" />
            ) : conversationState.isSpeaking ? (
              <Volume2 className="w-8 h-8 text-white" />
            ) : (
              <MessageSquare className="w-8 h-8 text-white" />
            )}
          </motion.div>
          
          {(conversationState.isListening || conversationState.isSpeaking) && (
            <div className="absolute inset-0 rounded-full border-2 border-current opacity-30 animate-ping" />
          )}

          {/* Audio Level Indicator */}
          {conversationState.isListening && audioLevel > 0.1 && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-3 rounded-full transition-all duration-100 ${
                      audioLevel * 5 > i ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                    style={{
                      height: `${Math.max(4, audioLevel * 20)}px`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-3">
          <div className="text-sm font-medium text-gray-900">
            {getStatusText()}
          </div>
          <div className="text-xs text-gray-500">
            {conversationState.error ? 'Check configuration and try again' :
             conversationState.microphonePermission === 'denied' ? 'Allow microphone access' :
             conversationState.isListening ? 'Speak now' :
             conversationState.isSpeaking ? 'AI is responding' :
             isInitializing ? 'Setting up connection...' :
             'Voice session active'}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {conversationState.error && (
        <div className="mb-4 p-3 bg-error-50 border border-error-200 rounded-lg">
          <p className="text-sm text-error-700">{conversationState.error}</p>
          <button
            onClick={handleRetry}
            className="mt-2 text-xs text-error-600 hover:text-error-800 font-medium"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Mock Response Buttons (for demo) */}
      {conversationState.isListening && !conversationState.error && conversationState.microphonePermission === 'granted' && (
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

      {/* Debug Info */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
        <div className="grid grid-cols-2 gap-2">
          <div>API Key: {config.apiKey ? '✅ Set' : '❌ Missing'}</div>
          <div>Agent ID: {config.agentId ? '✅ Set' : '❌ Missing'}</div>
          <div>Microphone: {conversationState.microphonePermission === 'granted' ? '✅' : '❌'}</div>
          <div>WebSocket: {conversationState.wsConnectionState}</div>
        </div>
        
        {debugInfo.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-gray-400">Debug Log</summary>
            <div className="mt-1 max-h-20 overflow-y-auto text-xs font-mono">
              {debugInfo.map((log, i) => (
                <div key={i} className="text-gray-400">{log}</div>
              ))}
            </div>
          </details>
        )}
      </div>
    </motion.div>
  );
};