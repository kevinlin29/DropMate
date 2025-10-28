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
        {label ? <Text style={[styles.label, { color: theme.semantic.text }]}>{label}</Text> : null}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.semantic.surface,
              borderColor: hasError ? theme.colors.error : theme.semantic.border,
            },
          ]}
        >
          {leftAccessory ? <View style={styles.accessory}>{leftAccessory}</View> : null}
          <TextInput
            ref={ref}
            placeholderTextColor={theme.semantic.textMuted}
            style={[styles.input, { color: theme.semantic.text }, style]}
            {...rest}
          />
          {rightAccessory ? <View style={styles.accessory}>{rightAccessory}</View> : null}
        </View>
        {hasError ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>{errorMessage}</Text>
        ) : helperText ? (
          <Text style={[styles.helper, { color: theme.semantic.textMuted }]}>{helperText}</Text>
        ) : null}
      </View>
    );
  },
);

FormTextInput.displayName = 'FormTextInput';

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  accessory: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    marginTop: 4,
    fontSize: 13,
  },
  helper: {
    marginTop: 4,
    fontSize: 13,
  },
});
