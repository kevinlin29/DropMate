import React from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { QrCode, Search } from 'lucide-react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';

export type SearchBarProps = TextInputProps & {
  onScanPress?: () => void;
};

export const SearchBar: React.FC<SearchBarProps> = ({ onScanPress, style, ...textInputProps }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.semantic.surface || tokens.colors.surface,
        },
        style,
      ]}
    >
      <Search 
        color={theme.semantic.textMuted || tokens.colors.textTertiary} 
        size={20} 
        strokeWidth={2}
      />
      <TextInput
        style={[
          styles.input, 
          { color: theme.semantic.text || tokens.colors.textPrimary }
        ]}
        placeholderTextColor={theme.semantic.textMuted || tokens.colors.textTertiary}
        placeholder="Search"
        returnKeyType="search"
        {...textInputProps}
      />
      {onScanPress ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onScanPress}
          style={({ pressed }) => [
            styles.scanButton,
            {
              backgroundColor: pressed 
                ? tokens.colors.pressed 
                : 'transparent',
            },
          ]}
        >
          <QrCode 
            color={theme.semantic.text || tokens.colors.textPrimary} 
            size={20}
            strokeWidth={2}
          />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.radii.input,
    paddingHorizontal: tokens.spacing.md,
    gap: tokens.spacing.sm,
    minHeight: 52,
    ...tokens.shadows.sm,
  },
  input: {
    flex: 1,
    ...tokens.typography.body,
    paddingVertical: tokens.spacing.sm,
  },
  scanButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
});