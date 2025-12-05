# DropMate Mobile (Expo)

DropMate is an Expo + React Native frontend that delivers the end-to-end parcel tracking experience defined in the v1 product spec. The current build ships a fully mocked client: data comes from bundled seed files and persists to AsyncStorage so flows behave like production while we finish the backend.

## Getting Started

```bash
npm install
npx expo install react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context @react-native-masked-view/masked-view react-native-maps expo-secure-store expo-constants expo-status-bar react-native-svg react-native-worklets
npx expo start
```

> The `expo install` step keeps every native module on the Expo SDK 54 matrix. After an `rm -rf node_modules`, rerun both commands before development.

## Project Structure

```
src/
  api/                # repository pattern (interfaces + mock + HTTP stub)
  components/         # reusable UI building blocks
  constants/          # route names & deep link patterns
  features/           # feature slices (notifications mock)
  hooks/              # react-query + local hooks
  navigation/         # stack/tab navigator setup
  screens/            # Splash, Tutorial, Login, Home, Track, Map, Profile, Details, Add sheet
  stores/             # zustand stores for auth + UI prefs
  theme/              # tokens + provider + status helpers
  utils/              # formatting, map helpers, async helpers
```

Assets live under `assets/` with placeholder art that can be swapped when the final Figma drops.

## Data Layer & Swapping to HTTP

The data layer follows a repository/service pattern:

- `IShipmentsService` defines the contract used across hooks/screens.
- `LocalShipmentsService` seeds `shipments.json` + `routes.json` into AsyncStorage and simulates latency for realistic UX.
- `HttpShipmentsService` is a drop-in stub that already calls through the axios client. TODO comments show where to wire §14 endpoints.
- `serviceFactory.ts` decides which service to return.

Switch between local storage and the HTTP stub by setting an Expo env var before bundling:

```bash
# use the HTTP stub
EXPO_PUBLIC_USE_HTTP=true npx expo start
```

You can also add `"USE_HTTP": true` to `expo.extra` in `app.json` for a permanent toggle. No screen files need changes either way.

## Theming & Design Tokens

- Tokens (color, spacing, radii, typography) live in `src/theme/tokens.ts` and follow the spec palette.
- `ThemeProvider` merges tokens into semantic colors, honors the device theme, and exposes a hook for components.
- `useUI` stores the user’s theme preference (`system`, `light`, `dark`).

## Mock Auth & Notifications

- `useAuth` manages a fake token with Expo SecureStore and provides hydration/sign-in/sign-out helpers.
- `NotificationsGate` is a no-op UI. Enabling the toggle unlocks a mock “Delivered” trigger that updates React Query caches and, when running the local service, Syncs AsyncStorage via `markAsDelivered`.

## Maps Abstraction

`MapViewWrapper` wraps `react-native-maps` and expects normalized `LatLng[]`. Need Mapbox later? Swap the implementation while keeping the same props – screens won’t change.

## Testing & Next Steps

- Use the built-in demo credentials (`admin` / `admin`) on the login screen to bypass email validation when testing flows locally.
- Run `npm run lint` and `npm run typecheck` after installing dependencies to ensure TypeScript + ESLint stay green.
- Replace placeholder art in `assets/images` with final exports.
- Wire real endpoints inside `HttpShipmentsService` once the backend is ready.
- Hook push notifications into the real Expo Notifications API when backend topics exist.
