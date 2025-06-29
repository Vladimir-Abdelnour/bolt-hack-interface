import React, { useState, useMemo, useCallback } from 'react';
import { 
  Filter, 
  Search, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Star,
  MapPin,
  Package,
  Clock,
  Building,
  Users,
  Award,
  Zap
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Manufacturer } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { capabilities, materials, certifications } from '../../data/mockData';
import toast from 'react-hot-toast';

/**
 * Filter state interface for type safety
 */
interface FilterState {
  search: string;
  capabilities: string[];
  materials: string[];
  certifications: string[];
  states: string[];
  employeeRange: string;
  revenueRange: string;
  capacityRange: string;
  ratingRange: string;
  diversityFlag: boolean | null;
  sustainabilityMin: number;
  yearEstablishedRange: string;
}

/**
 * Sort configuration interface
 */
interface SortConfig {
  key: keyof Manufacturer | null;
  direction: 'asc' | 'desc';
}

/**
 * Pagination configuration
 */
interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

/**
 * ManufacturerDataTable Component
 * 
 * A comprehensive data table with advanced filtering, sorting, and pagination
 * Features:
 * - Responsive sidebar filter system
 * - Sortable columns with visual indicators
 * - Multi-select functionality
 * - Export capabilities
 * - Loading and error states
 * - WCAG 2.1 accessibility compliance
 */
export const ManufacturerDataTable: React.FC = () => {
  const { manufacturers, setSelectedManufacturer } = useAppStore();
  
  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  
  // Filter state with comprehensive options
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    capabilities: [],
    materials: [],
    certifications: [],
    states: [],
    employeeRange: 'all',
    revenueRange: 'all',
    capacityRange: 'all',
    ratingRange: 'all',
    diversityFlag: null,
    sustainabilityMin: 0,
    yearEstablishedRange: 'all'
  });
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationConfig>({
    currentPage: 1,
    itemsPerPage: 25,
    totalItems: 0,
    totalPages: 0
  });

  // Collapsible filter sections state
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  /**
   * Extract unique values for filter options
   */
  const filterOptions = useMemo(() => {
    const states = [...new Set(manufacturers.map(m => m.state))].sort();
    const employeeRanges = [
      { value: 'all', label: 'All Sizes' },
      { value: '1-25', label: '1-25 employees' },
      { value: '26-50', label: '26-50 employees' },
      { value: '51-100', label: '51-100 employees' },
      { value: '101-250', label: '101-250 employees' },
      { value: '251-500', label: '251-500 employees' },
      { value: '500+', label: '500+ employees' }
    ];
    
    const revenueRanges = [
      { value: 'all', label: 'All Revenue' },
      { value: '0-1M', label: 'Under $1M' },
      { value: '1M-10M', label: '$1M - $10M' },
      { value: '10M-50M', label: '$10M - $50M' },
      { value: '50M-100M', label: '$50M - $100M' },
      { value: '100M+', label: '$100M+' }
    ];

    return { states, employeeRanges, revenueRanges };
  }, [manufacturers]);

  /**
   * Apply filters and sorting to manufacturer data
   */
  const filteredAndSortedData = useMemo(() => {
    let filtered = manufacturers.filter(manufacturer => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          manufacturer.name,
          manufacturer.city,
          manufacturer.state,
          manufacturer.industryKeywords,
          manufacturer.primaryApplications,
          ...manufacturer.capabilities,
          ...manufacturer.materials
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }

      // Capabilities filter
      if (filters.capabilities.length > 0) {
        if (!filters.capabilities.some(cap => manufacturer.capabilities.includes(cap))) {
          return false;
        }
      }

      // Materials filter
      if (filters.materials.length > 0) {
        if (!filters.materials.some(mat => manufacturer.materials.includes(mat))) {
          return false;
        }
      }

      // Certifications filter
      if (filters.certifications.length > 0) {
        if (!filters.certifications.some(cert => manufacturer.certifications.includes(cert))) {
          return false;
        }
      }

      // States filter
      if (filters.states.length > 0) {
        if (!filters.states.includes(manufacturer.state)) return false;
      }

      // Employee range filter
      if (filters.employeeRange !== 'all') {
        const empCount = manufacturer.numberOfEmployees;
        switch (filters.employeeRange) {
          case '1-25': if (empCount < 1 || empCount > 25) return false; break;
          case '26-50': if (empCount < 26 || empCount > 50) return false; break;
          case '51-100': if (empCount < 51 || empCount > 100) return false; break;
          case '101-250': if (empCount < 101 || empCount > 250) return false; break;
          case '251-500': if (empCount < 251 || empCount > 500) return false; break;
          case '500+': if (empCount < 500) return false; break;
        }
      }

      // Revenue range filter
      if (filters.revenueRange !== 'all') {
        const revenue = manufacturer.annualRevenue;
        switch (filters.revenueRange) {
          case '0-1M': if (revenue >= 1000000) return false; break;
          case '1M-10M': if (revenue < 1000000 || revenue >= 10000000) return false; break;
          case '10M-50M': if (revenue < 10000000 || revenue >= 50000000) return false; break;
          case '50M-100M': if (revenue < 50000000 || revenue >= 100000000) return false; break;
          case '100M+': if (revenue < 100000000) return false; break;
        }
      }

      // Capacity range filter
      if (filters.capacityRange !== 'all') {
        const capacity = manufacturer.currentCapacity;
        switch (filters.capacityRange) {
          case 'low': if (capacity >= 50) return false; break;
          case 'medium': if (capacity < 50 || capacity >= 80) return false; break;
          case 'high': if (capacity < 80) return false; break;
        }
      }

      // Rating range filter
      if (filters.ratingRange !== 'all') {
        const rating = manufacturer.rating;
        switch (filters.ratingRange) {
          case '4.5+': if (rating < 4.5) return false; break;
          case '4.0+': if (rating < 4.0) return false; break;
          case '3.5+': if (rating < 3.5) return false; break;
        }
      }

      // Diversity flag filter
      if (filters.diversityFlag !== null) {
        if (manufacturer.diversityFlag !== filters.diversityFlag) return false;
      }

      // Sustainability filter
      if (filters.sustainabilityMin > 0) {
        if (manufacturer.sustainabilityScore < filters.sustainabilityMin) return false;
      }

      // Year established filter
      if (filters.yearEstablishedRange !== 'all') {
        const year = manufacturer.yearEstablished;
        const currentYear = new Date().getFullYear();
        switch (filters.yearEstablishedRange) {
          case '0-5': if (currentYear - year > 5) return false; break;
          case '6-15': if (currentYear - year <= 5 || currentYear - year > 15) return false; break;
          case '16-30': if (currentYear - year <= 15 || currentYear - year > 30) return false; break;
          case '30+': if (currentYear - year <= 30) return false; break;
        }
      }

      return true;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [manufacturers, filters, sortConfig]);

  /**
   * Paginated data for current page
   */
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    const data = filteredAndSortedData.slice(startIndex, endIndex);
    
    // Update pagination info
    const totalItems = filteredAndSortedData.length;
    const totalPages = Math.ceil(totalItems / pagination.itemsPerPage);
    
    setPagination(prev => ({
      ...prev,
      totalItems,
      totalPages
    }));

    return data;
  }, [filteredAndSortedData, pagination.currentPage, pagination.itemsPerPage]);

  /**
   * Handle filter updates
   */
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  }, []);

  /**
   * Handle multi-select filter updates
   */
  const toggleFilterArray = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  /**
   * Clear all filters
   */
  const clearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      capabilities: [],
      materials: [],
      certifications: [],
      states: [],
      employeeRange: 'all',
      revenueRange: 'all',
      capacityRange: 'all',
      ratingRange: 'all',
      diversityFlag: null,
      sustainabilityMin: 0,
      yearEstablishedRange: 'all'
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  /**
   * Handle sorting
   */
  const handleSort = useCallback((key: keyof Manufacturer) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  /**
   * Handle row selection
   */
  const toggleRowSelection = useCallback((id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  /**
   * Select all visible rows
   */
  const toggleSelectAll = useCallback(() => {
    const allVisible = new Set(paginatedData.map(m => m.id));
    const allSelected = paginatedData.every(m => selectedRows.has(m.id));
    
    if (allSelected) {
      // Deselect all visible
      setSelectedRows(prev => {
        const newSet = new Set(prev);
        allVisible.forEach(id => newSet.delete(id));
        return newSet;
      });
    } else {
      // Select all visible
      setSelectedRows(prev => new Set([...prev, ...allVisible]));
    }
  }, [paginatedData, selectedRows]);

  /**
   * Export selected data
   */
  const exportData = useCallback(async () => {
    if (selectedRows.size === 0) {
      toast.error('Please select rows to export');
      return;
    }

    setIsLoading(true);
    try {
      const selectedData = manufacturers.filter(m => selectedRows.has(m.id));
      const csvContent = generateCSV(selectedData);
      downloadCSV(csvContent, 'manufacturer-data.csv');
      toast.success(`Exported ${selectedData.length} manufacturers`);
    } catch (error) {
      toast.error('Failed to export data');
      setError('Export failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedRows, manufacturers]);

  /**
   * Generate CSV content
   */
  const generateCSV = (data: Manufacturer[]) => {
    const headers = [
      'Name', 'City', 'State', 'Industry', 'Employees', 'Revenue', 
      'Rating', 'MOQ', 'Lead Time', 'Capacity', 'Sustainability',
      'Founded', 'Capabilities', 'Materials', 'Certifications'
    ];
    
    const rows = data.map(m => [
      m.name,
      m.city,
      m.state,
      m.industryKeywords,
      m.numberOfEmployees,
      m.annualRevenue,
      m.rating,
      m.moq,
      m.leadTimeDays,
      m.currentCapacity,
      m.sustainabilityScore,
      m.yearEstablished,
      m.capabilities.join('; '),
      m.materials.join('; '),
      m.certifications.join('; ')
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  /**
   * Download CSV file
   */
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Toggle filter section collapse
   */
  const toggleSection = useCallback((section: string) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  /**
   * Get sort icon for column
   */
  const getSortIcon = (key: keyof Manufacturer) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-primary-600" />
      : <ArrowDown className="w-4 h-4 text-primary-600" />;
  };

  /**
   * Format currency values
   */
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  /**
   * Get active filter count
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    count += filters.capabilities.length;
    count += filters.materials.length;
    count += filters.certifications.length;
    count += filters.states.length;
    if (filters.employeeRange !== 'all') count++;
    if (filters.revenueRange !== 'all') count++;
    if (filters.capacityRange !== 'all') count++;
    if (filters.ratingRange !== 'all') count++;
    if (filters.diversityFlag !== null) count++;
    if (filters.sustainabilityMin > 0) count++;
    if (filters.yearEstablishedRange !== 'all') count++;
    return count;
  }, [filters]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Filters */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Active Filters Count */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}
                </span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Filters Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Search Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => updateFilter('search', e.target.value)}
                      placeholder="Search manufacturers..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      aria-label="Search manufacturers"
                    />
                  </div>
                </div>

                {/* Capabilities Filter */}
                <FilterSection
                  title="Capabilities"
                  isCollapsed={collapsedSections.has('capabilities')}
                  onToggle={() => toggleSection('capabilities')}
                  count={filters.capabilities.length}
                >
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {capabilities.slice(0, 20).map((capability) => (
                      <label key={capability} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.capabilities.includes(capability)}
                          onChange={() => toggleFilterArray('capabilities', capability)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{capability}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Materials Filter */}
                <FilterSection
                  title="Materials"
                  isCollapsed={collapsedSections.has('materials')}
                  onToggle={() => toggleSection('materials')}
                  count={filters.materials.length}
                >
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {materials.slice(0, 20).map((material) => (
                      <label key={material} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.materials.includes(material)}
                          onChange={() => toggleFilterArray('materials', material)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{material}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* States Filter */}
                <FilterSection
                  title="States"
                  isCollapsed={collapsedSections.has('states')}
                  onToggle={() => toggleSection('states')}
                  count={filters.states.length}
                >
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filterOptions.states.map((state) => (
                      <label key={state} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.states.includes(state)}
                          onChange={() => toggleFilterArray('states', state)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{state}</span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Company Size Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    value={filters.employeeRange}
                    onChange={(e) => updateFilter('employeeRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {filterOptions.employeeRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Revenue Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Revenue
                  </label>
                  <select
                    value={filters.revenueRange}
                    onChange={(e) => updateFilter('revenueRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {filterOptions.revenueRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capacity Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Capacity
                  </label>
                  <select
                    value={filters.capacityRange}
                    onChange={(e) => updateFilter('capacityRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="low">Low (&lt;50%)</option>
                    <option value="medium">Medium (50-79%)</option>
                    <option value="high">High (80%+)</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.ratingRange}
                    onChange={(e) => updateFilter('ratingRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Ratings</option>
                    <option value="4.5+">4.5+ Stars</option>
                    <option value="4.0+">4.0+ Stars</option>
                    <option value="3.5+">3.5+ Stars</option>
                  </select>
                </div>

                {/* Diversity Flag */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diversity Certification
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="diversity"
                        checked={filters.diversityFlag === null}
                        onChange={() => updateFilter('diversityFlag', null)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">All</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="diversity"
                        checked={filters.diversityFlag === true}
                        onChange={() => updateFilter('diversityFlag', true)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Certified Only</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="diversity"
                        checked={filters.diversityFlag === false}
                        onChange={() => updateFilter('diversityFlag', false)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Not Certified</span>
                    </label>
                  </div>
                </div>

                {/* Sustainability Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sustainability Score: {filters.sustainabilityMin}%+
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.sustainabilityMin}
                    onChange={(e) => updateFilter('sustainabilityMin', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Open filters"
                >
                  <Filter className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Manufacturer Database</h1>
                <p className="text-gray-600 mt-1">
                  {filteredAndSortedData.length} of {manufacturers.length} manufacturers
                  {selectedRows.size > 0 && ` • ${selectedRows.size} selected`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportData}
                disabled={selectedRows.size === 0 || isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Export Selected</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-error-50 border border-error-200 rounded-lg p-4 m-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-error-600 mr-2" />
              <p className="text-error-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-error-600 hover:text-error-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && paginatedData.every(m => selectedRows.has(m.id))}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      aria-label="Select all visible rows"
                    />
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Company</span>
                      {getSortIcon('name')}
                    </button>
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('state')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Location</span>
                      {getSortIcon('state')}
                    </button>
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('numberOfEmployees')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Size</span>
                      {getSortIcon('numberOfEmployees')}
                    </button>
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('annualRevenue')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Revenue</span>
                      {getSortIcon('annualRevenue')}
                    </button>
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('rating')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Rating</span>
                      {getSortIcon('rating')}
                    </button>
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('currentCapacity')}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>Capacity</span>
                      {getSortIcon('currentCapacity')}
                    </button>
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capabilities
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certifications
                  </th>
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((manufacturer, index) => (
                  <motion.tr
                    key={manufacturer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedRows.has(manufacturer.id) ? 'bg-primary-50' : ''
                    }`}
                    onClick={() => setSelectedManufacturer(manufacturer)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(manufacturer.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleRowSelection(manufacturer.id);
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        aria-label={`Select ${manufacturer.name}`}
                      />
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Building className="w-5 h-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {manufacturer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {manufacturer.industryKeywords}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                        <span>{manufacturer.city}, {manufacturer.state}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Users className="w-4 h-4 text-gray-400 mr-1" />
                        <span>{manufacturer.numberOfEmployees.toLocaleString()}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(manufacturer.annualRevenue)}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{manufacturer.rating}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          manufacturer.currentCapacity >= 80 ? 'bg-error-500' :
                          manufacturer.currentCapacity >= 50 ? 'bg-warning-500' :
                          'bg-success-500'
                        }`} />
                        <span className="text-sm text-gray-900">{manufacturer.currentCapacity}%</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {manufacturer.capabilities.slice(0, 2).map((capability) => (
                          <span
                            key={capability}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                          >
                            {capability}
                          </span>
                        ))}
                        {manufacturer.capabilities.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{manufacturer.capabilities.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {manufacturer.certifications.slice(0, 2).map((cert) => (
                          <span
                            key={cert}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                          >
                            <Award className="w-3 h-3 mr-1" />
                            {cert}
                          </span>
                        ))}
                        {manufacturer.certifications.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{manufacturer.certifications.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              
              <select
                value={pagination.itemsPerPage}
                onChange={(e) => setPagination(prev => ({ 
                  ...prev, 
                  itemsPerPage: parseInt(e.target.value),
                  currentPage: 1 
                }))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        pagination.currentPage === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * FilterSection Component
 * Collapsible filter section with count indicator
 */
interface FilterSectionProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  count?: number;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  isCollapsed,
  onToggle,
  count = 0,
  children
}) => {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={!isCollapsed}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900">{title}</span>
          {count > 0 && (
            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        {isCollapsed ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        )}
      </button>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3 pt-0 border-t border-gray-200">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};