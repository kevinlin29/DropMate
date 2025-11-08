import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { tokens } from '@/theme/tokens';
import { Checkpoint } from '@/types';
import { formatAbsoluteTime } from '@/utils/format';

export type TimelineProps = {
  checkpoints: Checkpoint[];
  activeStatus: Checkpoint['code'];
  compact?: boolean;
};

export const Timeline: React.FC<TimelineProps> = ({ checkpoints, activeStatus, compact }) => {
  const theme = useTheme();

  const activeIndex = useMemo(() => {
    const idx = checkpoints.findIndex((checkpoint) => checkpoint.code === activeStatus);
    if (idx === -1) {
      return checkpoints.length - 1;
    }

    return idx;
  }, [activeStatus, checkpoints]);

  return (
    <View
      accessible
      accessibilityRole="list"
      style={[styles.container, compact ? styles.compactContainer : undefined]}
    >
      {checkpoints.map((checkpoint, index) => {
        const isCompleted = index <= activeIndex;
        const isLast = index === checkpoints.length - 1;
        const bulletColor = isCompleted 
          ? (theme.semantic.accent || tokens.colors.timelineActive)
          : (theme.semantic.border || tokens.colors.timelineInactive);

        return (
          <View
            key={`${checkpoint.code}-${checkpoint.timeIso}`}
            accessibilityRole="text"
            accessibilityLabel={`${checkpoint.label} ${formatAbsoluteTime(checkpoint.timeIso)}`}
            style={[styles.row, compact ? styles.rowCompact : undefined]}
          >
            <View style={styles.markerColumn}>
              <View
                style={[
                  styles.bullet,
                  {
                    borderColor: bulletColor,
                    backgroundColor: isCompleted 
                      ? bulletColor 
                      : (theme.semantic.surface || tokens.colors.surface),
                  },
                ]}
              />
              {!isLast ? (
                <View
                  style={[
                    styles.connector,
                    {
                      backgroundColor: isCompleted
                        ? (theme.semantic.accent || tokens.colors.timelineActive)
                        : (theme.semantic.border || tokens.colors.timelineInactive),
                    },
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.contentColumn}>
              <Text 
                style={[
                  styles.label, 
                  { color: theme.semantic.text || tokens.colors.textPrimary }
                ]}
              >
                {checkpoint.label}
              </Text>
              {!compact ? (
                <Text 
                  style={[
                    styles.meta, 
                    { color: theme.semantic.textMuted || tokens.colors.textSecondary }
                  ]}
                >
                  {checkpoint.location ?? '—'} · {formatAbsoluteTime(checkpoint.timeIso)}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: tokens.spacing.md,
  },
  compactContainer: {
    gap: tokens.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: tokens.spacing.md,
  },
  rowCompact: {
    gap: tokens.spacing.sm,
  },
  markerColumn: {
    alignItems: 'center',
  },
  bullet: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  connector: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  contentColumn: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...tokens.typography.bodyMedium,
  },
  meta: {
    ...tokens.typography.caption,
  },
});