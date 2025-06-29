import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Star, 
  Clock, 
  Package, 
  DollarSign,
  Filter,
  Search,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Quote } from '../../types';
import { motion } from 'framer-motion';

export const QuoteManagement: React.FC = () => {
  const { quotes, selectedQuotes, selectQuoteForComparison, removeQuoteFromComparison } = useAppStore();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'received' | 'comparison'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'leadTime' | 'score'>('date');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filteredQuotes = quotes.filter(quote => {
    if (activeTab !== 'all' && quote.status !== activeTab) return false;
    if (searchQuery && !quote.manufacturerId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return (a.pricePerUnit || 0) - (b.pricePerUnit || 0);
      case 'leadTime':
        return (a.leadTimeDays || 0) - (b.leadTimeDays || 0);
      case 'score':
        return (b.score || 0) - (a.score || 0);
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'received':
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-error-500" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'received':
        return 'bg-success-100 text-success-800';
      case 'pending':
        return 'bg-warning-100 text-warning-800';
      case 'rejected':
        return 'bg-error-100 text-error-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (activeTab === 'comparison') {
    return <QuoteComparison quotes={selectedQuotes} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Quote Management</h2>
          <p className="text-gray-600 mt-1">
            Automated quote extraction and comparison system
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Quotes</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', label: 'All Quotes', count: quotes.length },
            { id: 'pending', label: 'Pending', count: quotes.filter(q => q.status === 'pending').length },
            { id: 'received', label: 'Received', count: quotes.filter(q => q.status === 'received').length },
            { id: 'comparison', label: 'Comparison', count: selectedQuotes.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="date">Sort by Date</option>
            <option value="price">Sort by Price</option>
            <option value="leadTime">Sort by Lead Time</option>
            <option value="score">Sort by Score</option>
          </select>
        </div>
      </div>

      {/* Quotes List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quote
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price/Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MOQ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedQuotes.map((quote, index) => (
                <motion.tr
                  key={quote.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          Quote #{quote.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          Manufacturer ID: {quote.manufacturerId}
                        </div>
                        <div className="text-xs text-gray-400">
                          {quote.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(quote.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                      {quote.pricePerUnit ? `$${quote.pricePerUnit.toFixed(2)}` : 'Pending'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Clock className="w-4 h-4 text-gray-400 mr-1" />
                      {quote.leadTimeDays ? `${quote.leadTimeDays} days` : 'TBD'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Package className="w-4 h-4 text-gray-400 mr-1" />
                      {quote.moq ? quote.moq.toLocaleString() : 'TBD'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {quote.score ? (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{quote.score}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not scored</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => selectQuoteForComparison(quote)}
                        disabled={selectedQuotes.length >= 5 || selectedQuotes.some(q => q.id === quote.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedQuotes.some(q => q.id === quote.id)
                            ? 'bg-green-100 text-green-600'
                            : selectedQuotes.length >= 5
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                        }`}
                        title={
                          selectedQuotes.some(q => q.id === quote.id)
                            ? 'Added to comparison'
                            : selectedQuotes.length >= 5
                            ? 'Comparison limit reached (max 5)'
                            : 'Add to comparison'
                        }
                      >
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      
                      <button className="p-2 bg-secondary-100 text-secondary-600 rounded-lg hover:bg-secondary-200 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button className="p-2 bg-accent-100 text-accent-600 rounded-lg hover:bg-accent-200 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sortedQuotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'all' 
              ? 'Upload quote documents to get started with automated extraction and comparison.'
              : `No ${activeTab} quotes available.`
            }
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Upload your first quote
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <QuoteUploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
};

const QuoteComparison: React.FC<{ quotes: Quote[] }> = ({ quotes }) => {
  const { removeQuoteFromComparison } = useAppStore();

  if (quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes selected for comparison</h3>
        <p className="text-gray-500">
          Select quotes from the main list to compare them side by side.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">
          Quote Comparison ({quotes.length}/5)
        </h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Download className="w-4 h-4" />
          <span>Export Comparison</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criteria
                </th>
                {quotes.map((quote) => (
                  <th key={quote.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-between">
                      <span>Quote #{quote.id}</span>
                      <button
                        onClick={() => removeQuoteFromComparison(quote.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Price per Unit
                </td>
                {quotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {quote.pricePerUnit ? `$${quote.pricePerUnit.toFixed(2)}` : 'Pending'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Lead Time
                </td>
                {quotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {quote.leadTimeDays ? `${quote.leadTimeDays} days` : 'TBD'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  MOQ
                </td>
                {quotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {quote.moq ? quote.moq.toLocaleString() : 'TBD'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Score
                </td>
                {quotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {quote.score ? (
                      <div className="flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span>{quote.score}</span>
                      </div>
                    ) : (
                      'Not scored'
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Status
                </td>
                {quotes.map((quote) => (
                  <td key={quote.id} className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                      {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const QuoteUploadModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      console.log('Files dropped:', e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-8 w-full max-w-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Upload Quote Documents</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop quote files here or click to browse
          </h3>
          <p className="text-gray-500 mb-4">
            Supports PDF, DOC, DOCX, XLS, XLSX files up to 10MB
          </p>
          <button className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Select Files
          </button>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Automated Extraction Features:
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span>Price per unit extraction</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span>Lead time identification</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span>MOQ detection</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span>Terms and conditions parsing</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Helper function moved outside component
const getStatusColor = (status: Quote['status']) => {
  switch (status) {
    case 'received':
      return 'bg-success-100 text-success-800';
    case 'pending':
      return 'bg-warning-100 text-warning-800';
    case 'rejected':
      return 'bg-error-100 text-error-800';
    case 'expired':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};