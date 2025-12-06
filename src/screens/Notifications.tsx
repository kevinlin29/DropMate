import React from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  View,
  Pressable 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { EmptyState } from '@/components/EmptyState';
import { RootStackParamList } from '@/navigation/types';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.background || tokens.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.semantic.background || tokens.colors.background }]}>
        <Pressable 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          <ArrowLeft 
            color={theme.semantic.text || tokens.colors.textPrimary} 
            size={24} 
          />
        </Pressable>
        
        <Text style={[styles.headerTitle, { color: theme.semantic.text || tokens.colors.textPrimary }]}>
          Notifications
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <EmptyState
          title="No notifications yet"
          description="You'll receive updates about your shipments, deliveries, and account activity here."
          actionLabel="Go to Home"
          onActionPress={() => navigation.goBack()}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    borderBottomWidth: 0, // Remove border since background matches screen
  },
  backButton: {
    padding: tokens.spacing.xs,
    marginLeft: -tokens.spacing.xs, // Adjust for visual alignment
    marginRight: tokens.spacing.md, // Add space between back button and title
  },
  headerTitle: {
    ...tokens.typography.h3,
    flex: 1, // Take remaining space but align left
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.xl,
  },
});