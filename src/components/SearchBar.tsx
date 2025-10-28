import React from 'react';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { QrCode, Search } from 'lucide-react-native';

import { useTheme } from '@/theme/ThemeProvider';

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
          backgroundColor: theme.semantic.surface,
          borderColor: theme.semantic.border,
        },
        style,
      ]}
    >
      <Search color={theme.semantic.textMuted} size={20} />
      <TextInput
        style={[styles.input, { color: theme.semantic.text }]}
        placeholderTextColor={theme.semantic.textMuted}
        returnKeyType="search"
        {...textInputProps}
      />
      {onScanPress ? (
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onScanPress}
          style={styles.scanButton}
        >
          <QrCode color={theme.colors.accent} size={20} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    gap: 12,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  scanButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
    width: 44,
    borderRadius: 22,
  },
});
