import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft } from 'lucide-react-native';

import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { RootStackParamList } from '@/navigation/types';
import { ROUTES } from '@/constants/routes';

export const MessagesScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.semantic.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Pressable 
            onPress={handleGoBack}
            style={styles.backButton}
            hitSlop={8}
          >
            <ChevronLeft color={theme.semantic.text} size={28} />
          </Pressable>
          <Text style={[styles.heading, { color: theme.semantic.text }]}>Messages</Text>
        </View>
      </View>
      
      <View style={styles.emptyContainer}>
        <EmptyState
          title="No messages yet"
          description="You don't have any messages at the moment. Check back later for updates and notifications."
          actionLabel="Go to Home"
          onActionPress={handleGoBack}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: tokens.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: tokens.spacing.md,
    marginBottom: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  backButton: {
    marginLeft: -tokens.spacing.xs,
    padding: tokens.spacing.xxs,
  },
  heading: {
    ...tokens.typography.h2,
  },
  emptyContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
  },
});
