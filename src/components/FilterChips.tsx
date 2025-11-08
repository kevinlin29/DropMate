import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';

export type FilterChipOption<Value extends string = string> = {
  label: string;
  value: Value;
};

export type FilterChipsProps<Value extends string = string> = {
  options: FilterChipOption<Value>[];
  value: Value;
  onChange: (next: Value) => void;
  style?: StyleProp<ViewStyle>;
  chipStyle?: StyleProp<ViewStyle>;
};

export const FilterChips = <Value extends string = string>({
  options,
  value,
  onChange,
  style,
  chipStyle,
}: FilterChipsProps<Value>) => {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scroll, style]}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.chip,
              chipStyle,
              {
                backgroundColor: selected 
                  ? (theme.semantic.text || tokens.colors.textPrimary)
                  : (theme.semantic.surface || tokens.colors.surface),
                borderColor: selected 
                  ? (theme.semantic.text || tokens.colors.textPrimary)
                  : (theme.semantic.border || tokens.colors.border),
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <Text 
              style={[
                styles.label, 
                { 
                  color: selected 
                    ? tokens.colors.surface 
                    : (theme.semantic.text || tokens.colors.textPrimary) 
                }
              ]} 
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexShrink: 1,
    minHeight: 48,
    maxHeight: 56,
    paddingHorizontal: tokens.spacing.xxs,
  },
  container: {
    flexDirection: 'row',
    gap: tokens.spacing.sm,
    alignItems: 'center',
    minHeight: 48,
  },
  chip: {
    borderWidth: 1,
    borderRadius: tokens.radii.pill,
    paddingHorizontal: tokens.spacing.lg - 2,
    paddingVertical: tokens.spacing.sm - 2,
    minHeight: 44,
    minWidth: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...tokens.typography.bodyMedium,
    lineHeight: 18,
  },
});