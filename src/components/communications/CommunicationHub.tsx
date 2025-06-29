import React, { useState } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Video, 
  Search, 
  Filter,
  Plus,
  Star,
  Clock,
  AlertCircle,
  CheckCircle,
  Send,
  Paperclip,
  MoreVertical
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Conversation, Message } from '../../types';
import { motion } from 'framer-motion';

export const CommunicationHub: React.FC = () => {
  const { 
    conversations, 
    activeConversation, 
    setActiveConversation,
    addMessage,
    markConversationAsRead 
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'email' | 'direct_message' | 'portal' | 'voice'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');

  const filteredConversations = conversations.filter(conv => {
    if (filterType !== 'all' && conv.type !== filterType) return false;
    if (filterPriority !== 'all' && conv.priority !== filterPriority) return false;
    if (searchQuery && !conv.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-error-100 text-error-800';
      case 'high':
        return 'bg-warning-100 text-warning-800';
      case 'medium':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'direct_message':
        return <MessageSquare className="w-4 h-4" />;
      case 'portal':
        return <CheckCircle className="w-4 h-4" />;
      case 'voice':
        return <Phone className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Conversations List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Communications</h2>
            <button className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="direct_message">Direct Message</option>
              <option value="portal">Portal</option>
              <option value="voice">Voice</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => {
            const unreadCount = conversation.messages.filter(m => !m.read && m.senderType !== 'user').length;
            const isActive = activeConversation?.id === conversation.id;
            
            return (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-primary-50 border-primary-200' : ''
                }`}
                onClick={() => {
                  setActiveConversation(conversation);
                  if (unreadCount > 0) {
                    markConversationAsRead(conversation.id);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    conversation.priority === 'urgent' ? 'bg-error-100 text-error-600' :
                    conversation.priority === 'high' ? 'bg-warning-100 text-warning-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getTypeIcon(conversation.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium truncate ${
                        unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {conversation.subject}
                      </h3>
                      {unreadCount > 0 && (
                        <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(conversation.priority)}`}>
                        {conversation.priority}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        conversation.status === 'active' ? 'bg-success-100 text-success-800' :
                        conversation.status === 'pending' ? 'bg-warning-100 text-warning-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {conversation.status}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {conversation.lastMessageAt.toLocaleString()}
                    </p>
                    
                    {conversation.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {conversation.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {conversation.tags.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{conversation.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {filteredConversations.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Detail */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <ConversationDetail conversation={activeConversation} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p>Choose a conversation from the list to view messages and respond.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ConversationDetail: React.FC<{ conversation: Conversation }> = ({ conversation }) => {
  const { addMessage } = useAppStore();
  const [newMessage, setNewMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      conversationId: conversation.id,
      senderId: '1', // Current user ID
      senderType: 'user',
      content: newMessage,
      type: 'text',
      timestamp: new Date(),
      read: true
    };

    addMessage(conversation.id, message);
    setNewMessage('');
  };

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{conversation.subject}</h2>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-500">
                Manufacturer ID: {conversation.manufacturerId}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                conversation.status === 'active' ? 'bg-success-100 text-success-800' :
                conversation.status === 'pending' ? 'bg-warning-100 text-warning-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {conversation.status}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                conversation.priority === 'urgent' ? 'bg-error-100 text-error-800' :
                conversation.priority === 'high' ? 'bg-warning-100 text-warning-800' :
                conversation.priority === 'medium' ? 'bg-primary-100 text-primary-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {conversation.priority} priority
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {conversation.messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.senderType === 'user'
                ? 'bg-primary-600 text-white'
                : message.senderType === 'manufacturer'
                ? 'bg-gray-100 text-gray-900'
                : 'bg-secondary-100 text-secondary-900'
            }`}>
              <div className="text-sm">{message.content}</div>
              <div className={`text-xs mt-1 ${
                message.senderType === 'user' ? 'text-primary-200' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleString()}
              </div>
              
              {message.files && message.files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.files.map((file) => (
                    <div key={file.id} className="flex items-center space-x-2 text-xs">
                      <Paperclip className="w-3 h-3" />
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-6 border-t border-gray-200 bg-white">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Use Template
                </button>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};