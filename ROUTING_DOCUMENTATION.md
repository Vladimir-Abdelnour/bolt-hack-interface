# FactoryLink - UI Routing Logic Documentation

## Overview
FactoryLink is a React-based manufacturing sourcing platform that uses React Router for client-side routing. The application follows a modular architecture with clear separation of concerns between layout, content, and state management.

## Application Architecture

### Main App Structure
```
App.tsx (Router Provider)
├── Header.tsx (Global Navigation & User Controls)
├── Navigation.tsx (Sidebar Navigation)
└── Route Components (Main Content Area)
    ├── InteractiveMap.tsx
    ├── ManufacturerDataTable.tsx (NEW)
    ├── QuoteManagement.tsx
    ├── CommunicationHub.tsx
    ├── AccountPage.tsx
    └── Settings Pages
```

## Routing Configuration

### Primary Routes
The application uses React Router v6 with the following route structure:

| Route | Component | Description | Access Level |
|-------|-----------|-------------|--------------|
| `/` | Navigate to `/map` | Root redirect | Authenticated |
| `/map` | InteractiveMap | Interactive manufacturer map view | Authenticated |
| `/database` | ManufacturerDataTable | Advanced data table with filters | Authenticated |
| `/quotes` | QuoteManagement | Quote management and comparison | Authenticated |
| `/conversations` | CommunicationHub | Messaging and communication center | Authenticated |
| `/account` | AccountPage | User account management | Authenticated |
| `/settings` | SettingsPage | General settings overview | Authenticated |
| `/settings/notifications` | NotificationSettings | Notification preferences | Authenticated |
| `/settings/communications` | CommunicationSettings | Communication preferences | Authenticated |

### Authentication Flow
```typescript
// Authentication check in App.tsx
if (!isAuthenticated) {
  return <AuthModal /> // Blocks access to all routes
}

// Authenticated users see the full application
return (
  <Router>
    <Header />
    <Navigation />
    <Routes>
      {/* Route definitions */}
    </Routes>
  </Router>
)
```

## Navigation Logic

### Header Navigation (`Header.tsx`)
**Purpose**: Global application header with user controls and notifications

**Key Features**:
- Logo and brand identity with uploaded image fallback
- Voice session toggle button with real-time status
- Notifications dropdown with real-time updates and priority indicators
- Settings dropdown with quick access links to all settings pages
- User profile dropdown with account actions and usage metrics

**Navigation Links**:
- Settings dropdown → `/account`, `/settings/notifications`, `/settings/communications`, `/settings`
- User profile dropdown → `/account`, `/settings`

**State Management**:
- Uses `useAppStore` for voice session state and notifications
- Uses `useAuthStore` for user authentication and profile data
- Manages local state for dropdown visibility and interactions

### Sidebar Navigation (`Navigation.tsx`)
**Purpose**: Primary navigation sidebar for main application sections

**Navigation Items**:
```typescript
const navItems = [
  { id: 'map', label: 'Interactive Map', icon: Map, path: '/map' },
  { id: 'database', label: 'Manufacturer Database', icon: Database, path: '/database' },
  { id: 'quotes', label: 'Quote Management', icon: FileText, path: '/quotes' },
  { id: 'conversations', label: 'Communications', icon: MessageSquare, path: '/conversations' },
  { id: 'account', label: 'Account', icon: User, path: '/account' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]
```

**Active State Logic**:
- Uses `useLocation()` hook to determine current route
- Highlights active navigation item based on current pathname
- Special handling for settings routes (highlights parent when on sub-routes)
- Animated active indicator with Framer Motion

**Responsive Behavior**:
- Fixed width sidebar on desktop (w-64)
- Hidden on mobile/tablet with responsive design
- Hover animations for better user experience
- Status indicators and version information

## Page Components Logic

### InteractiveMap (`/map`)
**Purpose**: Main manufacturing facility discovery interface

**Key Features**:
- Real-time map with manufacturer locations using React Leaflet
- Interactive markers with facility information popups
- Filtering capabilities by capacity, capabilities, and location
- Multiple map view modes (street, satellite, terrain)
- Responsive design with mobile-friendly controls
- Custom marker icons based on capacity levels

**State Management**:
- Local state for map view preferences and filters
- Integration with global manufacturer data from `useAppStore`
- Real-time updates when manufacturer data changes

### ManufacturerDataTable (`/database`) - NEW
**Purpose**: Advanced data table interface for detailed manufacturer analysis

**Key Features**:
- **Responsive Sidebar Filter System**:
  - Collapsible filter sections with visual feedback
  - Multi-select capabilities for complex filtering
  - Real-time filter application with debouncing
  - Active filter count and clear all functionality
  - Mobile-friendly collapse/expand functionality

- **Advanced Data Table**:
  - Sortable columns with visual sort indicators
  - Multi-row selection with select all functionality
  - Pagination with configurable page sizes
  - Responsive table design with horizontal scrolling
  - Row hover effects and selection highlighting

- **Export Functionality**:
  - CSV export of selected manufacturer data
  - Configurable export fields and formatting
  - Progress indicators for export operations
  - Error handling for failed exports

- **Accessibility Features**:
  - WCAG 2.1 AA compliance
  - Keyboard navigation support
  - Screen reader friendly labels and descriptions
  - High contrast mode support
  - Focus management for complex interactions

**Filter Categories**:
- **Search**: Full-text search across all manufacturer fields
- **Capabilities**: Multi-select from available manufacturing capabilities
- **Materials**: Multi-select from materials worked with
- **Certifications**: Multi-select from quality and industry certifications
- **Geographic**: State-based filtering
- **Company Size**: Employee count ranges
- **Revenue**: Annual revenue ranges
- **Capacity**: Current capacity utilization levels
- **Rating**: Minimum rating thresholds
- **Diversity**: Diversity certification status
- **Sustainability**: Minimum sustainability scores
- **Experience**: Years in business ranges

**State Management**:
- Complex local state for filters, sorting, and pagination
- Memoized data processing for performance
- Debounced search and filter updates
- Persistent selection state across pagination

### QuoteManagement (`/quotes`)
**Purpose**: Quote request and comparison management

**Key Features**:
- Tabbed interface for different quote statuses
- Quote comparison functionality with side-by-side analysis
- File upload for quote documents with drag-and-drop
- Search and filtering capabilities
- Responsive table design with mobile adaptations
- Export functionality for quote data

### CommunicationHub (`/conversations`)
**Purpose**: Centralized communication management

**Key Features**:
- Split-pane layout (conversation list + detail view)
- Real-time message updates with WebSocket integration
- Message composition with template support
- File attachment capabilities
- Responsive design that stacks on mobile
- Priority-based conversation sorting

### AccountPage (`/account`)
**Purpose**: User profile and account management

**Key Features**:
- Editable profile information with form validation
- Avatar upload functionality with image preview
- Account statistics and usage metrics
- Subscription management and upgrade options
- Responsive form layout with progressive disclosure
- Account action buttons for data export and deletion

### Settings Pages
**Purpose**: Application and user preference configuration

**Structure**:
- **SettingsPage** (`/settings`): Overview with quick settings and navigation to sub-pages
- **NotificationSettings** (`/settings/notifications`): Comprehensive notification preferences
- **CommunicationSettings** (`/settings/communications`): Communication methods and availability

## State Management Integration

### Global State (Zustand Stores)

#### AppStore (`useAppStore`)
**Purpose**: Application-wide state management

**Key State**:
- `manufacturers`: Comprehensive manufacturer database with filtering
- `quotes`: Quote management and comparison functionality
- `conversations`: Communication threads and real-time messaging
- `notifications`: System notifications with priority levels
- `voiceSession`: Voice interface state and transcript management

#### AuthStore (`useAuthStore`)
**Purpose**: User authentication and profile management

**Key State**:
- `user`: Complete user profile with preferences and usage metrics
- `isAuthenticated`: Authentication status and session management
- `preferences`: Detailed user preferences for notifications, communication, and dashboard

### Route-Level State Management
Each route component manages its own local state for:
- UI interactions (modals, dropdowns, form states, filter panels)
- Temporary data (search queries, filters, sort preferences)
- Component-specific preferences (table pagination, view modes)
- Selection states (multi-select, comparison sets)

## Responsive Design Strategy

### Breakpoint System
The application uses Tailwind CSS responsive utilities with a mobile-first approach:
- `sm:` - 640px and up (small tablets)
- `md:` - 768px and up (tablets)
- `lg:` - 1024px and up (laptops)
- `xl:` - 1280px and up (desktops)

### Layout Adaptations
- **Mobile (< 768px)**: 
  - Stacked layouts with full-width components
  - Hidden sidebar navigation
  - Simplified filter interfaces
  - Touch-optimized interactions
  
- **Tablet (768px - 1024px)**: 
  - Two-column layouts where appropriate
  - Condensed navigation elements
  - Collapsible sidebar filters
  - Optimized table scrolling
  
- **Desktop (> 1024px)**: 
  - Multi-column layouts with sidebar navigation
  - Full filter panel visibility
  - Expanded content areas
  - Advanced interaction patterns

### Component Responsiveness
Each component implements responsive design through:
- **Flexible Grid Systems**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Responsive Spacing**: `space-y-4 md:space-y-6 lg:space-y-8`
- **Adaptive Text Sizes**: `text-sm md:text-base lg:text-lg`
- **Conditional Rendering**: Mobile vs desktop feature sets
- **Touch-Friendly Targets**: Minimum 44px touch targets on mobile

## Accessibility Implementation

### WCAG 2.1 AA Compliance
- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Screen Reader Support**: Proper ARIA labels, roles, and descriptions
- **Color Contrast**: Minimum 4.5:1 contrast ratio for all text
- **Focus Management**: Visible focus indicators and logical tab order
- **Alternative Text**: Descriptive alt text for all images and icons

### Accessibility Features
- **High Contrast Mode**: Support for `prefers-contrast: high`
- **Reduced Motion**: Respect for `prefers-reduced-motion: reduce`
- **Font Scaling**: Support for user font size preferences
- **Voice Navigation**: Compatible with voice control software
- **Screen Magnification**: Proper zoom behavior up to 200%

## Performance Considerations

### Code Splitting and Optimization
- **Route-Based Splitting**: Lazy loading for route components
- **Component-Level Splitting**: Dynamic imports for heavy features
- **Bundle Analysis**: Regular monitoring of bundle sizes
- **Tree Shaking**: Elimination of unused code

### State Optimization
- **Zustand Efficiency**: Minimal re-renders with selective subscriptions
- **Memoization**: React.memo and useMemo for expensive calculations
- **Debouncing**: Search and filter input debouncing
- **Virtual Scrolling**: For large data sets in tables

### Asset and Data Optimization
- **Image Optimization**: WebP format with fallbacks
- **Icon Optimization**: SVG sprites and icon fonts
- **Data Pagination**: Server-side pagination for large datasets
- **Caching Strategies**: Intelligent data caching and invalidation

## Error Handling and Loading States

### Route Protection and Error Boundaries
- **Authentication Guards**: Route-level authentication checks
- **Error Boundaries**: Graceful error handling with fallback UIs
- **404 Handling**: Custom not found pages with navigation
- **Network Error Handling**: Offline state management

### Loading and Feedback States
- **Skeleton Screens**: Better perceived performance during loading
- **Progress Indicators**: Clear feedback for long-running operations
- **Toast Notifications**: Success, error, and warning messages
- **Loading Spinners**: Context-appropriate loading indicators

### Navigation Feedback
- **Active State Highlighting**: Clear indication of current location
- **Hover States**: Interactive feedback for all clickable elements
- **Loading States**: Navigation loading indicators
- **Breadcrumbs**: Navigation context for deep pages

## Future Enhancements

### Planned Routing Improvements
1. **Nested Routes**: Complex section routing with sub-navigation
2. **Route Guards**: Role-based access control and permissions
3. **Deep Linking**: Shareable URLs with application state
4. **Route Transitions**: Smooth page transitions with Framer Motion
5. **Breadcrumb Navigation**: Hierarchical navigation support

### Advanced Features
1. **Progressive Web App**: Offline functionality and app-like experience
2. **Real-time Updates**: WebSocket integration for live data
3. **Advanced Search**: Full-text search with faceted filtering
4. **Data Visualization**: Interactive charts and analytics
5. **Collaboration Tools**: Multi-user features and sharing

### Mobile Enhancements
1. **Bottom Navigation**: Mobile-first navigation pattern
2. **Swipe Gestures**: Touch-friendly interactions and navigation
3. **Pull-to-Refresh**: Mobile data refresh patterns
4. **Push Notifications**: Mobile notification integration
5. **Offline Support**: PWA capabilities with route caching

This documentation provides a comprehensive overview of the routing logic, navigation patterns, and architectural decisions used throughout the FactoryLink application, with special emphasis on the new ManufacturerDataTable component and its advanced filtering capabilities.