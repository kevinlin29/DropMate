import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';

type Percentage = `${number}%`;

export type SkeletonProps = {
  width?: number | Percentage;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'circular' | 'rounded';
};

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%' as Percentage,
  height = 16,
  borderRadius,
  style,
  variant = 'default',
}) => {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  // Determine border radius based on variant
  const resolvedBorderRadius = React.useMemo(() => {
    if (borderRadius !== undefined) return borderRadius;
    
    switch (variant) {
      case 'circular':
        return typeof height === 'number' ? height / 2 : 999;
      case 'rounded':
        return tokens.radii.md;
      default:
        return tokens.radii.xs;
    }
  }, [borderRadius, variant, height]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.6,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        {
          width,
          height,
          borderRadius: resolvedBorderRadius,
          backgroundColor: theme.semantic.border || tokens.colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});