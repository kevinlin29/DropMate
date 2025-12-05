import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';

export type FormTextInputProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  containerStyle?: StyleProp<ViewStyle>;
  leftAccessory?: React.ReactNode;
  rightAccessory?: React.ReactNode;
};

export const FormTextInput = forwardRef<TextInput, FormTextInputProps>(
  ({
    label,
    helperText,
    errorMessage,
    containerStyle,
    leftAccessory,
    rightAccessory,
    style,
    ...rest
  }, ref) => {
    const theme = useTheme();
    const hasError = Boolean(errorMessage);

    return (
      <View style={containerStyle}>
        {label ? (
          <Text style={[styles.label, { color: theme.semantic.text || tokens.colors.textPrimary }]}>
            {label}
          </Text>
        ) : null}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.semantic.surface || tokens.colors.surface,
              borderColor: hasError 
                ? (theme.semantic.error || tokens.colors.error)
                : (theme.semantic.border || tokens.colors.border),
            },
          ]}
        >
          {leftAccessory ? <View style={styles.accessory}>{leftAccessory}</View> : null}
          <TextInput
            ref={ref}
            placeholderTextColor={theme.semantic.textMuted || tokens.colors.textTertiary}
            style={[
              styles.input, 
              { color: theme.semantic.text || tokens.colors.textPrimary }, 
              style
            ]}
            {...rest}
          />
          {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
        </View>
        {hasError ? (
          <Text style={[styles.error, { color: theme.semantic.error || tokens.colors.error }]}>
            {errorMessage}
          </Text>
        ) : helperText ? (
          <Text style={[styles.helper, { color: theme.semantic.textMuted || tokens.colors.textSecondary }]}>
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  },
);

FormTextInput.displayName = 'FormTextInput';

const styles = StyleSheet.create({
  label: {
    marginBottom: tokens.spacing.xxs,
    ...tokens.typography.smallMedium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.radii.input,
    borderWidth: 1,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.sm - 2,
    gap: tokens.spacing.xs,
    minHeight: 48,
  },
  input: {
    flex: 1,
    ...tokens.typography.body,
    padding: 0,
  },
  accessory: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    marginTop: tokens.spacing.xxs,
    ...tokens.typography.caption,
  },
  helper: {
    marginTop: tokens.spacing.xxs,
    ...tokens.typography.caption,
  },
});