import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ROUTES } from '@/constants/routes';
import { t } from '@/i18n/i18n';
import { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme/ThemeProvider';
import { useAppDispatch } from '@/store/hooks';
import { completeOnboarding } from '@/store/slices/uiSlice';

const hero = require('@/../assets/images/onboarding-hero.png');

type TutorialProps = NativeStackScreenProps<RootStackParamList, 'Tutorial'>;

export const TutorialScreen: React.FC<TutorialProps> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();

  const handleCompleteOnboarding = () => {
    dispatch(completeOnboarding());
  };

  const handleContinue = () => {
    handleCompleteOnboarding();
    navigation.replace(ROUTES.Login);
  };

  const handleSkip = () => {
    handleCompleteOnboarding();
    navigation.replace(ROUTES.Login);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.semantic.background }]}>
      <View style={styles.wrapper}>
        <Pressable onPress={handleSkip} style={styles.skip} accessibilityRole="button">
          <Text style={[styles.skipText, { color: theme.colors.accent }]}>{t('tutorial.skip')}</Text>
        </Pressable>
        <Image source={hero} style={styles.hero} resizeMode="contain" />
        <View style={styles.copy}>
          <Text style={[styles.title, { color: theme.semantic.text }]}>{t('tutorial.headline')}</Text>
          <Text style={[styles.body, { color: theme.semantic.textMuted }]}>{t('tutorial.body')}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: theme.colors.primaryTeal,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text style={styles.primaryLabel}>{t('tutorial.next')}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  skip: {
    alignSelf: 'flex-end',
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  hero: {
    width: '80%',
    maxWidth: 320,
    height: 240,
  },
  copy: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
