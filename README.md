# DropMate - Parcel Delivery Tracking Application

**ECE1778 Mobile Application Development - Final Project**

---

## Table of Contents
1. [Team Information](#team-information)
2. [Motivation](#motivation)
3. [Objectives](#objectives)
4. [Technical Stack](#technical-stack)
5. [Features](#features)
6. [User Guide](#user-guide)
7. [Development Guide](#development-guide)
8. [Deployment Information](#deployment-information)
9. [Individual Contributions](#individual-contributions)
10. [Lessons Learned](#lessons-learned)

---

## Team Information

**Team Members:**
- Kevin Lin - qw.lin@mail - 1012495104
- Liz Zhu - liz.zhu@mail.utoronto.ca - 1011844943
- Yuhao Cao - davidyh.cao@mail.utoronto.ca - 1004145329

**GitHub Repository:** https://github.com/kevinlin29/DropMate

---

## Motivation

In today's fast-paced world, efficient package delivery tracking is essential for both customers and delivery drivers. However, many existing solutions lack real-time updates, intuitive interfaces, or proper coordination between customers and drivers. 

Our team was motivated to create **DropMate** to address these pain points by building a mobile application that provides:
- **Real-time tracking** of package locations and delivery status
- **Seamless communication** between customers and drivers
- **Dual-role functionality** allowing users to be both customers and drivers
- **Intelligent notifications** to keep users informed at every step

This project demonstrates practical implementation of mobile development concepts learned in ECE1778, including state management, real-time data synchronization, and mobile-specific APIs.

---

## Objectives

The main objectives of this project are:

1. **Build a production-quality mobile application** using React Native and Expo that works on both Android and iOS devices

2. **Implement comprehensive delivery tracking** with features like:
   - Real-time shipment status updates
   - Interactive maps with live driver locations
   - Package search and filtering capabilities
   - Order creation and management

3. **Demonstrate proficiency in modern mobile development** by:
   - Using TypeScript for type-safe code
   - Implementing proper state management patterns
   - Integrating with backend APIs and real-time services
   - Following React Native best practices

4. **Create an intuitive user experience** that allows users to:
   - Easily track their packages
   - Switch between customer and driver roles
   - Receive timely notifications about deliveries
   - View delivery routes on interactive maps

5. **Fulfill all course requirements** including navigation, state management, notifications, backend integration, and advanced features

---

## Technical Stack

### Core Technologies

**Framework & Language:**
- **React Native** - Cross-platform mobile framework
- **Expo SDK** - Development and build toolchain
- **TypeScript** - Type-safe JavaScript for better code quality

**Navigation:**
- **React Navigation** - Industry-standard navigation library
  - `@react-navigation/native-stack` - Native stack navigator for screen transitions
  - `@react-navigation/bottom-tabs` - Tab navigation for main app sections
  - Full TypeScript support with typed navigation props and route parameters
  - Deep linking support via `expo-linking`

**State Management (Multi-layered Approach):**

1. **Redux Toolkit** - Global application state
   - `authSlice` - User authentication and session management
   - `notificationsSlice` - Notification preferences and push tokens
   - `driverSlice` - Driver-specific state (active deliveries, status)
   - `uiSlice` - UI preferences (theme, onboarding completion)
   - **Redux Persist** - Persist auth and UI state across app restarts using AsyncStorage

2. **TanStack Query (React Query)** - Server state management
   - Smart caching and automatic background refetching
   - Query invalidation for data consistency
   - Integration with WebSocket for real-time updates
   - Handles loading and error states automatically

3. **Context API** - Theme management
   - `ThemeProvider` - Light/dark/system theme switching
   - Token-based design system

4. **React Hooks** - Component-level state
   - `useState`, `useEffect`, `useRef` for local state
   - Custom hooks (`useShipmentsQuery`, `usePushNotifications`, etc.)

**Data Persistence:**
- **AsyncStorage** - Local storage for:
  - Redux persist hydration (auth state, UI preferences)
  - Cached API responses
  - User settings
- **Expo Secure Store** - Secure storage for:
  - Authentication tokens (Firebase ID tokens)
  - Push notification tokens
  - Sensitive credentials

**Backend Integration:**

1. **REST API** (Axios)
   - Custom backend at `api.dropmate.ca`
   - Axios interceptors for automatic token injection
   - Error handling with retry logic
   - Supports both mock (local) and production modes

2. **Firebase**
   - **Firebase Authentication** - Email/password login
   - Token refresh and session management
   - Integrated with Redux for auth state

3. **WebSocket Real-time** (Socket.IO Client)
   - Real-time shipment status updates
   - Live driver location tracking
   - Automatic reconnection on network loss
   - Custom Redux middleware for WebSocket state synchronization

**Notifications:**
- **Expo Notifications**
  - Local notifications (daily reminders, shipment updates)
  - Push notification support with Expo Push Tokens
  - Android notification channels with priority levels
  - Notification tap handling for deep linking

**Location & Maps:**
- **React Native Maps** - Interactive maps
- **Expo Location** - Geolocation services
  - Real-time location tracking for drivers
  - Permission handling (foreground/background)
  - Distance calculation and ETA estimation
- **Google Maps Platform**
  - Places API for address autocomplete
  - Geocoding for address validation

**UI & Animations:**
- **React Native Reanimated** - High-performance animations
  - Smooth screen transitions
  - Tab indicator animations
  - Loading skeleton effects
- **Lucide React Native** - Icon library
- **React Native Gesture Handler** - Touch gestures

**Form Handling:**
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- Type-safe form validation with error handling

**Development Tools:**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript strict mode** - Type checking

### Project Architecture

```
DropMate/
├── src/
│   ├── api/                    # Backend integration
│   │   ├── client.ts          # Axios configuration
│   │   ├── IShipmentsService.ts   # Service interface
│   │   ├── HttpShipmentsService.ts # REST implementation
│   │   ├── LocalShipmentsService.ts # Mock service
│   │   ├── notificationClient.ts   # WebSocket client
│   │   └── userService.ts     # User API
│   ├── components/            # Reusable UI components
│   │   ├── AddressAutocomplete.tsx
│   │   ├── ShipmentCard.tsx
│   │   └── driver/            # Driver-specific components
│   ├── hooks/                 # Custom React hooks
│   │   ├── useShipmentsQuery.ts   # Data fetching
│   │   ├── usePushNotifications.ts
│   │   └── useRealtimeSync.ts
│   ├── navigation/            # Navigation setup
│   │   ├── RootNavigator.tsx  # Main navigator
│   │   ├── AnimatedTabs.tsx   # Customer tabs
│   │   └── DriverTabs.tsx     # Driver tabs
│   ├── screens/               # Screen components
│   │   ├── Login.tsx
│   │   ├── Home.tsx
│   │   ├── Track.tsx
│   │   ├── Map.tsx
│   │   ├── PlaceOrder.tsx
│   │   └── driver/            # Driver screens
│   ├── store/                 # Redux store
│   │   ├── slices/            # Redux slices
│   │   └── middleware/        # Custom middleware
│   ├── services/              # Business logic
│   │   ├── notificationService.ts
│   │   └── googleMapsService.ts
│   └── theme/                 # Design system
│       └── tokens.ts          # Design tokens
├── App.tsx                    # App entry point
├── app.json                   # Expo configuration
└── package.json               # Dependencies
```

---

## Features

### Core Features (Required)

#### 1. Multi-Screen Application (12+ Screens)

**Customer Screens:**
- **Splash Screen** - App loading with animated logo
- **Login/Signup** - Firebase authentication with email/password
- **Forgot Password** - Password reset functionality
- **Home** - Dashboard with shipment overview and quick actions
- **Track/Order History** - List of all shipments with search and filter
- **Map** - Interactive map showing delivery locations and routes
- **Shipment Details** - Detailed view of individual shipment with timeline
- **Add Tracking** - Modal sheet for adding tracking numbers
- **Place Order** - Multi-step form for creating new orders
- **Settings** - User preferences, theme, and notifications
- **Profile** - User information and statistics

**Driver Screens:**
- **Driver Home** - Driver dashboard with earnings and stats
- **Driver Deliveries** - List of assigned deliveries
- **Delivery Details** - Detailed delivery info with navigation
- **Driver Map** - Live map with route optimization
- **Driver Registration** - Onboarding for new drivers
- **Driver Settings** - Driver-specific preferences

All screens use TypeScript-typed props and navigation parameters for type-safe routing. The navigation system defines parameter lists that specify which data each screen expects to receive, ensuring compile-time safety when navigating between screens.

#### 2. Navigation Implementation

**React Navigation with TypeScript:**
- Stack navigation for hierarchical screens
- Tab navigation for main sections (Home, Track, Map, Profile)
- Modal presentations for sheets (Add Tracking, Time Picker)
- Deep linking support (`dropmate://shipment/12345`)
- Type-safe navigation with route parameters
- Custom transition animations

Navigation is implemented using typed hooks that provide compile-time type checking for route names and parameters. When navigating to a screen, the system ensures that all required parameters are provided and correctly typed, preventing runtime errors from missing or incorrect data.

#### 3. State Management & Persistence

**Redux Toolkit for Global State:**
- Authentication state with automatic persistence
- User preferences (theme, language)
- Notification settings
- Driver status and active deliveries

**React Query for Server State:**
- Smart caching of API responses
- Automatic background refetching
- Optimistic updates
- Loading and error state handling

**Data Persistence:**
- User login persists across app restarts
- Theme preference saved locally
- Notification tokens securely stored
- Recent searches cached

**Redux Implementation:**
Authentication is handled through Redux Toolkit async thunks that interface with Firebase Authentication. When a user logs in, the system validates credentials with Firebase, retrieves an authentication token, and stores both the user information and token in the Redux store. The token is then used for all subsequent API calls to the backend.

#### 4. Local Notifications

**Expo Notifications Implementation:**
- **Daily Reminders** - Scheduled notifications at user-set times
- **Shipment Updates** - Local notifications for status changes
- **Driver Proximity** - Alerts when driver is nearby
- Android notification channels with different priorities

**Implementation:**
The notification system uses Expo's Notifications API to schedule recurring local notifications. Users can set their preferred reminder time in Settings, and the app schedules daily notifications using trigger objects that specify the hour and minute. These notifications repeat automatically and can be configured or disabled by the user at any time.

**Features:**
- User can configure reminder times in Settings
- Notifications navigate to relevant screens when tapped
- Permission handling with user-friendly prompts
- Badge count management

#### 5. Backend Integration

**REST API with Custom Backend:**
- Fetch shipment list with filters (`GET /api/shipments`)
- Get shipment details (`GET /api/shipments/:id`)
- Create new orders (`POST /api/shipments`)
- User authentication (`POST /api/auth/login`)
- Driver package management

**Error Handling:**
- Loading states with skeleton screens
- Error messages for failed requests
- Retry mechanisms with exponential backoff
- 401 handling with automatic token refresh

**Dynamic UI Updates:**
React Query is used to fetch data from the backend with built-in loading and error states. The system automatically displays skeleton loading screens while data is being fetched, and shows error messages with retry options if requests fail. When data is successfully retrieved, it's automatically cached and displayed in the UI. This pattern is used consistently throughout the app for all backend data fetching.

**Backend Toggle:**
The app can switch between local mock data (for development without backend) and production backend APIs using environment variables. This is configured through the `EXPO_PUBLIC_USE_HTTP` environment variable.

### Advanced Features (6 Implemented)

#### 1. User Authentication (Firebase)

**Implementation:**
- Firebase Authentication with email/password
- Secure token storage using Expo Secure Store
- Automatic token refresh
- Password reset via email
- Role-based access (customer vs. driver)

**Features:**
- Login/Signup screens with form validation
- Session persistence across app restarts
- Logout with token cleanup
- Protected routes (authentication required)

**Technical Details:**
User signup is implemented using Redux Toolkit async thunks that create new user accounts in Firebase Authentication. The system creates the user account, retrieves an authentication token, and stores it securely in Expo Secure Store for persistent authentication. The user data and token are then returned to the Redux store for immediate use throughout the app.

#### 2. Real-Time Updates (WebSocket)

**Implementation:**
- Socket.IO client connecting to `notify.dropmate.ca`
- Real-time shipment status updates
- Live driver location updates
- Automatic reconnection on network loss

**Technical Details:**
WebSocket events are integrated with both Redux and React Query through custom middleware. When a shipment status update is received via WebSocket, the system dispatches Redux actions to update the global state and simultaneously invalidates React Query cache entries. This dual approach ensures that both the Redux store and cached API data remain synchronized with real-time server updates, providing instant UI updates without manual refresh.

**Features:**
- UI updates instantly without manual refresh
- WebSocket connection status indicator
- Event subscription for specific shipments
- Background updates when app is in foreground

#### 3. Location Services (Expo Location)

**Implementation:**
- Real-time GPS tracking for drivers
- Interactive maps with React Native Maps
- Route visualization with polylines
- Distance and ETA calculation

**Permission Handling:**
The app implements a permission request system that checks and requests location permissions before accessing GPS data. If permission is denied, the user is shown an alert explaining why the permission is needed. The system differentiates between foreground and background location access, requesting only what's necessary for the current feature.

**Features:**
- Driver location updates every 5 seconds
- Customer can see driver approaching on map
- Address autocomplete using Google Places API
- Geocoding for address validation

#### 4. Push Notifications (Expo Push)

**Implementation:**
- Expo Push Token registration with backend
- Remote notifications for critical events
- Notification channels for Android
- Permission opt-in/opt-out flow

**Technical Details:**
The app obtains an Expo Push Token from the device and registers it with the backend server. This token uniquely identifies the device and allows the backend to send targeted push notifications. The registration process includes error handling and retry logic to ensure successful token transmission even on unstable networks.

**Notification Types:**
- Shipment status changes (sent by backend)
- Driver proximity alerts
- Delivery confirmations

#### 5. Custom Animations (React Native Reanimated)

**Implementation:**
- Smooth tab indicator sliding animation
- Screen transition effects
- Loading skeleton pulsing animation
- Pull-to-refresh animation

**Technical Details:**
Animations are implemented using React Native Reanimated's shared values and animated styles. The tab indicator uses a shared value for position that updates when tabs change, creating smooth sliding transitions. All animations run on the native thread (not JavaScript thread) for optimal 60fps performance, using the library's `useSharedValue` and `useAnimatedStyle` hooks.

**Features:**
- 60fps animations using native driver
- Spring physics for natural motion
- Interactive gesture-based animations

#### 6. External API Integration (Google Maps)

**Implementation:**
- Google Places API for address autocomplete
- Geocoding API for coordinate conversion
- Distance Matrix API for ETA calculation

**Technical Details:**
Address autocomplete is implemented by making asynchronous requests to the Google Places API. As users type, the app sends the input text to the API and receives a list of matching address predictions. These predictions are then displayed in a dropdown for the user to select from. The implementation includes debouncing (800ms delay) to reduce API calls and improve performance.

**Features:**
- Smart address input with debouncing (800ms)
- Address validation and formatting
- Route optimization for deliveries

---

## User Guide

### Getting Started

#### 1. Installation
Download and install the APK file on your Android device (minimum Android 6.0).

#### 2. First Launch
- Grant location and notification permissions when prompted
- View the tutorial screens explaining key features
- Create an account or login

### Customer Features

#### Creating an Account
1. Tap "Sign Up" on the login screen
2. Enter your email, password, and name
3. Tap "Create Account"
4. You're now logged in!

#### Tracking Packages
1. Navigate to the "Track" tab
2. View all your shipments with status indicators:
   - 📋 Pending (awaiting pickup)
   - 🚚 In Transit (on the way)
   - ✅ Delivered (completed)
3. Use the search bar to find specific packages
4. Filter by status using the chips at the top

#### Viewing Shipment Details
1. Tap on any shipment card
2. View detailed information:
   - Tracking number
   - Current status with timeline
   - Sender and receiver information
   - Estimated delivery time
3. Tap "View on Map" to see the delivery route

#### Creating a New Order
1. Tap the "+" button on the Home screen or Track screen
2. Fill in the order form:
   - **Sender Address**: Start typing and select from autocomplete
   - **Receiver Address**: Use address autocomplete
   - **Package Details**: Weight and description
   - **Pickup Time**: Select preferred time slot
3. Review and tap "Place Order"
4. Your new shipment appears in the Track list

#### Using the Map
1. Navigate to the "Map" tab
2. View all active deliveries on an interactive map
3. Tap markers to see shipment information
4. Watch driver locations update in real-time
5. Use zoom controls to adjust view

#### Managing Notifications
1. Go to Settings (Profile tab → Settings)
2. Toggle "Enable Notifications"
3. Configure:
   - Daily reminder time
   - Shipment status updates
   - Driver proximity alerts
4. Permissions are requested automatically

### Driver Features

#### Becoming a Driver
1. Go to Settings
2. Tap "Become a Driver"
3. Fill in driver registration form:
   - Vehicle information
   - License details
   - Banking information for payments
4. Submit for approval

#### Driver Dashboard
After approval, switch to driver mode:
1. Tap the driver icon in navigation
2. View your driver dashboard:
   - Today's earnings
   - Active deliveries count
   - Performance stats
3. Toggle "Available" status to receive packages

#### Managing Deliveries
1. Navigate to "Deliveries" tab
2. View assigned packages
3. Filter by status (Pending, In Progress, Completed)
4. Tap a delivery to see details
5. Use "Start Delivery" to begin
6. Track progress with built-in navigation

#### Completing a Delivery
1. Arrive at destination
2. Tap "Mark as Delivered"
3. Optionally add a photo proof
4. Customer receives notification
5. Earnings are updated immediately

---

## Development Guide

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Expo CLI** (installed globally)
- **Android Studio** (for Android development) or **Xcode** (for iOS)
- **Physical device** or emulator for testing

### Initial Setup

1. **Clone the repository:**
```bash
git clone https://github.com/kevinlin29/DropMate.git
cd DropMate
```

2. **Install dependencies:**
```bash
npm install
```

3. **Install Expo native modules:**
```bash
npx expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-masked-view/masked-view react-native-maps expo-secure-store expo-constants expo-status-bar react-native-svg react-native-worklets
```

4. **Set up environment variables:**

Create a `.env` file in the root directory:
```bash
# Backend Configuration
EXPO_PUBLIC_USE_HTTP=true
EXPO_PUBLIC_API_URL=https://api.dropmate.ca

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# Google Maps API Key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

**Note:** Contact team members for actual API keys. Never commit `.env` to git.

5. **Configure Firebase:**
- Create a Firebase project at https://console.firebase.google.com
- Enable Email/Password authentication
- Copy configuration to `.env` file
- See `src/config/firebase.ts` for implementation

6. **Configure Google Maps:**
- Get an API key from https://console.cloud.google.com
- Enable Places API and Geocoding API
- Add key to `.env` file
- Update `app.json` with the key placeholder

### Running the App

**Development mode:**
```bash
# Start Expo development server
npx expo start

# Or with cache cleared
npx expo start --clear
```

Then:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator
- Scan QR code with Expo Go app for physical device testing

**Run on specific platform:**
```bash
# Android
npm run android

# iOS (macOS only)
npm run ios
```

### Project Structure

```
DropMate/
├── src/
│   ├── api/                # Backend service layer
│   │   ├── client.ts       # Axios configuration
│   │   ├── serviceFactory.ts  # Service provider
│   │   └── ...
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   ├── store/              # Redux store and slices
│   ├── services/           # Business logic
│   └── theme/              # Design system
├── assets/                 # Images, fonts, sounds
├── App.tsx                 # App entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript configuration
```

### Development Workflow

**1. Feature Development:**
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
# ...

# Test locally
npm run typecheck
npm run lint

# Commit and push
git add .
git commit -m "Add my feature"
git push origin feature/my-feature
```

**2. Testing:**
```bash
# TypeScript type checking
npm run typecheck

# Linting
npm run lint

# Run on device for manual testing
npx expo start
```

**3. Switching Between Mock and Production:**

The app supports two data modes:

**Mock Mode (Local Data):**
```bash
# In .env
EXPO_PUBLIC_USE_HTTP=false
```
- Uses seed data from `src/api/seed/`
- Simulates API latency
- Good for UI development without backend

**Production Mode (Real Backend):**
```bash
# In .env
EXPO_PUBLIC_USE_HTTP=true
```
- Connects to actual backend APIs
- Real-time updates via WebSocket
- Requires backend to be running

### Common Development Tasks

**Adding a New Screen:**
1. Create screen component in `src/screens/`
2. Add route definition to `src/constants/routes.ts`
3. Add TypeScript types to `src/navigation/types.ts`
4. Register in `RootNavigator.tsx`

Example:
```typescript
// src/screens/NewScreen.tsx
export const NewScreen: React.FC = () => {
  return <View><Text>New Screen</Text></View>;
};

// src/navigation/RootNavigator.tsx
<Stack.Screen name={ROUTES.NewScreen} component={NewScreen} />
```

**Adding a New Redux Slice:**
1. Create slice in `src/store/slices/`
2. Register in `src/store/index.ts`
3. Add types to store configuration

**Creating a Custom Hook:**
1. Create hook in `src/hooks/`
2. Use React Query for data fetching
3. Include TypeScript types for parameters and return values

### Debugging

**View Logs:**
```bash
# Expo logs
npx expo start

# React Native logs
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

**Debug Menu:**
- Shake device or press `Cmd+D` (iOS) / `Cmd+M` (Android)
- Enable "Remote JS Debugging" for Chrome DevTools
- Use "Toggle Inspector" to inspect UI elements

**Common Issues:**

1. **Metro bundler errors:**
```bash
# Clear cache and restart
rm -rf node_modules/.cache
npx expo start --clear
```

2. **TypeScript errors:**
```bash
# Regenerate types
npm run typecheck
```

3. **Native module issues:**
```bash
# Reinstall native modules
npx expo install --fix
```

### Code Style

The project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript strict mode** for type safety

Format code before committing:
```bash
npm run lint -- --fix
```

---

## Deployment Information

Android APK is uploaded to the current repo.

---

## Individual Contributions

**Kevin Lin:**
- Implemented authentication system with Firebase
- Developed components and screens for both user and driver app
- Implemented Expo notification for deliver/daily notification


**Liz Zhu:**
- Designed the mobile app UI using Canvas
- Developed components and screens for both user and driver app
- Implemented custom animations each screens

**Yuhao Cao:**
- Developed components and screens for both user and driver app
- Implemented Redux Toolkit + Async storage for the mobile app
- Conducted QA testing and bugfixing for the mobile app

---

## Lessons Learned

### 1. Maintain a Clean and Well-Structured Git Repository

At the start of the project, our team placed both the frontend and backend code in a single repository and primarily worked from the same branch. This led to a cluttered structure and frequent merge conflicts, especially when multiple members pushed changes simultaneously. Resolving these conflicts consumed valuable time and highlighted the importance of proper branching strategies, clear repository organization, and consistent commit practices.

**Future improvement:** In the future, we will adopt a clearer repository structure (e.g., separate repos or submodules) and enforce branching conventions such as feature branches and regular pull requests. This will help maintain a clean history and reduce conflict resolution time.

### 2. Do Not Underestimate the Effort Required for QA

We began formal QA too close to the deadline, which exposed numerous issues—bugs, platform-specific inconsistencies, and usability problems—that required significantly more time to resolve than expected. This experience reinforced that QA should be integrated early and continuously throughout the development cycle, rather than treated as a final checkpoint.

**Future improvement:** Going forward, we plan to introduce iterative QA cycles, including automated tests where possible and earlier compatibility checks across platforms. This will allow us to identify issues sooner and reduce last-minute pressure.

### 3. Prioritize Features from a User-Centric Perspective

Some features we built were technically interesting but provided limited value to the end user. In hindsight, these features increased system complexity and introduced additional opportunities for errors without meaningfully improving the user experience. This emphasized the need to evaluate functionality through the lens of user impact, balancing technical ambition with practical value.

**Future improvement:** In future projects, we will apply stricter prioritization frameworks—such as user stories, value vs. effort matrices, and early user feedback sessions—to ensure we focus development resources on features with real impact.

---

### Concluding Remarks

Building DropMate was an excellent learning experience that demonstrated the complexities of modern mobile app development. The project successfully implements all required features and showcases practical application of concepts learned in ECE1778.

Key achievements:
- ✅ Full-stack mobile app with 12+ screens
- ✅ Production-quality codebase with TypeScript
- ✅ Real-time features with WebSocket
- ✅ Complex state management with Redux and React Query
- ✅ Firebase authentication integration
- ✅ Location tracking and mapping
- ✅ Push and local notifications
- ✅ Successfully deployed Android build

The project proves that with proper planning, modern tools, and effective teamwork, students can build production-quality mobile applications that solve real-world problems.

