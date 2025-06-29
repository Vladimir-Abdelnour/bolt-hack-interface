import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { 
  MapPin, 
  Star, 
  Package, 
  Clock, 
  Filter,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  List
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Factory location data for map display
 * In production, this would come from an API
 */
const factoryLocations = [
  {
    id: 'factory-1',
    name: 'Precision Manufacturing Co.',
    lat: 40.7128,
    lng: -74.0060,
    city: 'New York',
    state: 'NY',
    capabilities: ['CNC Machining', 'Sheet Metal'],
    currentCapacity: 75,
    rating: 4.8,
    moq: 100,
    leadTime: 21
  },
  {
    id: 'factory-2',
    name: 'West Coast Electronics',
    lat: 34.0522,
    lng: -118.2437,
    city: 'Los Angeles',
    state: 'CA',
    capabilities: ['PCB Assembly', 'Testing'],
    currentCapacity: 82,
    rating: 4.6,
    moq: 50,
    leadTime: 14
  },
  {
    id: 'factory-3',
    name: 'Midwest Steel Works',
    lat: 41.8781,
    lng: -87.6298,
    city: 'Chicago',
    state: 'IL',
    capabilities: ['Welding', 'Fabrication'],
    currentCapacity: 68,
    rating: 4.5,
    moq: 500,
    leadTime: 28
  },
  {
    id: 'factory-4',
    name: 'Texas Precision Casting',
    lat: 29.7604,
    lng: -95.3698,
    city: 'Houston',
    state: 'TX',
    capabilities: ['Investment Casting', 'Machining'],
    currentCapacity: 91,
    rating: 4.7,
    moq: 250,
    leadTime: 35
  },
  {
    id: 'factory-5',
    name: 'Pacific Northwest Composites',
    lat: 47.6062,
    lng: -122.3321,
    city: 'Seattle',
    state: 'WA',
    capabilities: ['Composite Manufacturing', 'Autoclave'],
    currentCapacity: 73,
    rating: 4.9,
    moq: 25,
    leadTime: 42
  },
  {
    id: 'factory-6',
    name: 'Rocky Mountain Machining',
    lat: 39.7392,
    lng: -104.9903,
    city: 'Denver',
    state: 'CO',
    capabilities: ['CNC Machining', 'Swiss Turning'],
    currentCapacity: 85,
    rating: 4.8,
    moq: 10,
    leadTime: 18
  },
  {
    id: 'factory-7',
    name: 'Florida Aerospace Components',
    lat: 28.5383,
    lng: -81.3792,
    city: 'Orlando',
    state: 'FL',
    capabilities: ['Aerospace Parts', 'Testing'],
    currentCapacity: 79,
    rating: 4.6,
    moq: 5,
    leadTime: 21
  },
  {
    id: 'factory-8',
    name: 'Carolina Textiles',
    lat: 35.2271,
    lng: -80.8431,
    city: 'Charlotte',
    state: 'NC',
    capabilities: ['Weaving', 'Dyeing'],
    currentCapacity: 88,
    rating: 4.4,
    moq: 5000,
    leadTime: 45
  },
  {
    id: 'factory-9',
    name: 'Great Lakes Foundry',
    lat: 43.0389,
    lng: -87.9065,
    city: 'Milwaukee',
    state: 'WI',
    capabilities: ['Iron Casting', 'Machining'],
    currentCapacity: 71,
    rating: 4.3,
    moq: 100,
    leadTime: 28
  },
  {
    id: 'factory-10',
    name: 'Silicon Valley Plastics',
    lat: 37.3382,
    lng: -121.8863,
    city: 'San Jose',
    state: 'CA',
    capabilities: ['Injection Molding', 'Assembly'],
    currentCapacity: 94,
    rating: 4.9,
    moq: 1000,
    leadTime: 28
  }
];

/**
 * InteractiveMap Component
 * 
 * Main map interface for discovering manufacturing facilities
 * 
 * Features:
 * - Interactive map with real manufacturer locations
 * - Multiple map view modes (street, satellite, terrain)
 * - Filtering by capabilities and capacity
 * - Responsive design for all screen sizes
 * - Custom markers with capacity-based color coding
 * 
 * Responsive Design:
 * - Adapts controls layout for mobile/tablet/desktop
 * - Touch-friendly interactions
 * - Collapsible filter panel
 */
export const InteractiveMap: React.FC = () => {
  const { setSelectedManufacturer } = useAppStore();
  
  // Local state for map controls
  const [mapView, setMapView] = useState<'satellite' | 'terrain' | 'street'>('street');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedFilters, setSelectedFilters] = useState({
    capabilities: [] as string[],
    capacity: 'all' as 'all' | 'high' | 'medium' | 'low'
  });

  /**
   * Filter factories based on selected criteria
   */
  const filteredFactories = factoryLocations.filter(factory => {
    // Filter by capabilities
    if (selectedFilters.capabilities.length > 0) {
      if (!selectedFilters.capabilities.some(cap => factory.capabilities.includes(cap))) {
        return false;
      }
    }
    
    // Filter by capacity
    if (selectedFilters.capacity !== 'all') {
      const capacity = factory.currentCapacity;
      if (selectedFilters.capacity === 'high' && capacity < 80) return false;
      if (selectedFilters.capacity === 'medium' && (capacity < 50 || capacity >= 80)) return false;
      if (selectedFilters.capacity === 'low' && capacity >= 50) return false;
    }
    
    return true;
  });

  /**
   * Handle capability filter toggle
   */
  const handleCapabilityFilter = (capability: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  /**
   * Get tile layer URL based on selected map view
   */
  const getTileLayerUrl = () => {
    switch (mapView) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  /**
   * Create custom marker icon based on factory capacity
   */
  const createCustomIcon = (capacity: number) => {
    const color = capacity >= 80 ? '#ef4444' : capacity >= 50 ? '#f59e0b' : '#22c55e';
    
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      className: 'custom-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header with Controls - Responsive layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
            Interactive Manufacturing Map
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {filteredFactories.length} facilities
          </span>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Map View Toggle - Only show in map mode */}
          {viewMode === 'map' && (
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
              {(['street', 'satellite', 'terrain'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setMapView(view)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    mapView === view
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          )}
          
          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 lg:px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(selectedFilters.capabilities.length > 0 || selectedFilters.capacity !== 'all') && (
              <span className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                {selectedFilters.capabilities.length + (selectedFilters.capacity !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Panel - Responsive design */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {/* Capabilities Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Capabilities</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {['CNC Machining', 'Sheet Metal', 'PCB Assembly', 'Welding', 'Injection Molding', 'Casting'].map((capability) => (
                    <label key={capability} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFilters.capabilities.includes(capability)}
                        onChange={() => handleCapabilityFilter(capability)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{capability}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Capacity Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Current Capacity</h3>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Levels' },
                    { value: 'high', label: 'High (80%+)' },
                    { value: 'medium', label: 'Medium (50-79%)' },
                    { value: 'low', label: 'Low (<50%)' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="capacity"
                        value={option.value}
                        checked={selectedFilters.capacity === option.value}
                        onChange={(e) => setSelectedFilters(prev => ({ ...prev, capacity: e.target.value as any }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content - Map or List View */}
      {viewMode === 'map' ? (
        /* Map Container - Responsive height */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-64 sm:h-80 lg:h-96 relative">
            <MapContainer
              center={[39.8283, -98.5795]} // Center of US
              zoom={4}
              style={{ height: '100%', width: '100%' }}
              className="z-10"
            >
              <TileLayer
                url={getTileLayerUrl()}
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {filteredFactories.map((factory) => (
                <Marker
                  key={factory.id}
                  position={[factory.lat, factory.lng]}
                  icon={createCustomIcon(factory.currentCapacity)}
                >
                  <Popup>
                    <div className="p-2 min-w-48">
                      <h3 className="font-medium text-gray-900 mb-2">{factory.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{factory.city}, {factory.state}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 mr-1" />
                          <span className="text-gray-700">{factory.rating}</span>
                        </div>
                        <div className="flex items-center">
                          <Package className="w-3 h-3 text-gray-400 mr-1" />
                          <span className="text-gray-700">{factory.moq.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 text-gray-400 mr-1" />
                          <span className="text-gray-700">{factory.leadTime}d</span>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            factory.currentCapacity >= 80 ? 'bg-red-500' :
                            factory.currentCapacity >= 50 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          <span className="text-gray-700">{factory.currentCapacity}%</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {factory.capabilities.slice(0, 2).map((cap) => (
                            <span
                              key={cap}
                              className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
                            >
                              {cap}
                            </span>
                          ))}
                          {factory.capabilities.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{factory.capabilities.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button className="w-full bg-primary-600 text-white text-xs py-2 px-3 rounded hover:bg-primary-700 transition-colors">
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Map Legend - Responsive layout */}
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Map Legend</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Low Capacity (&lt;50%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-700">Medium Capacity (50-79%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-700">High Capacity (80%+)</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  Showing {filteredFactories.length} of {factoryLocations.length} facilities
                </div>
                <div className="text-xs text-gray-500">
                  Click markers for detailed information
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List View - Responsive grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredFactories.map((factory, index) => (
            <motion.div
              key={factory.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 hover:border-primary-200 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedManufacturer(factory)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm lg:text-base font-medium text-gray-900 truncate">
                    {factory.name}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-500">
                    {factory.city}, {factory.state}
                  </p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  factory.currentCapacity >= 80 ? 'bg-red-500' :
                  factory.currentCapacity >= 50 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
              </div>
              
              <div className="grid grid-cols-3 gap-2 lg:gap-3 mb-3 text-xs lg:text-sm">
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="text-gray-700">{factory.rating}</span>
                </div>
                <div className="flex items-center">
                  <Package className="w-3 h-3 text-gray-400 mr-1" />
                  <span className="text-gray-700">{factory.moq.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 text-gray-400 mr-1" />
                  <span className="text-gray-700">{factory.leadTime}d</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {factory.capabilities.slice(0, 2).map((cap) => (
                  <span
                    key={cap}
                    className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
                  >
                    {cap}
                  </span>
                ))}
                {factory.capabilities.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{factory.capabilities.length - 2}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};