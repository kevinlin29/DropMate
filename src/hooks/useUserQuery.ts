import { useQuery } from '@tanstack/react-query';
import { userService } from '@/api/userService';
import { userKeys } from '@/api/queryKeys';
import { useAppSelector } from '@/store/hooks';

/**
 * Hook to fetch the current user's profile
 */
export const useUserProfileQuery = () => {
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === 'authenticated';

  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const profile = await userService.getProfile();
      console.log('[useUserProfileQuery] Profile fetched:', {
        id: profile.id,
        email: profile.email,
        role: profile.role
      });
      return profile;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated, // Only fetch when authenticated
  });
};

/**
 * Hook to fetch the current user's statistics
 */
export const useUserStatsQuery = () => {
  const authStatus = useAppSelector((state) => state.auth.status);
  const isAuthenticated = authStatus === 'authenticated';

  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => userService.getStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: isAuthenticated, // Only fetch when authenticated
  });
};
