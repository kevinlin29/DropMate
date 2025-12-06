/**
 * Design Tokens - Modular token system
 * 
 * This is the main export for all design tokens. The tokens are organized
 * into separate files for better maintainability:
 * 
 * - colors.ts      - All color definitions
 * - spacing.ts     - Spacing scale & layout values  
 * - typography.ts  - Font styles & text formatting
 * - radii.ts       - Border radius values
 * - shadows.ts     - Shadow definitions
 * - gradients.ts   - Background gradients
 * - animations.ts  - Animation duration & easing
 * 
 * Usage:
 * import { tokens } from '@/theme/tokens';
 * 
 * const textColor = tokens.colors.textPrimary;
 * const spacing = tokens.spacing.md;
 */

// Import all token categories
export { colors } from './colors';
export { spacing } from './spacing';
export { typography } from './typography';
export { radii } from './radii';
export { shadows } from './shadows';
export { gradients } from './gradients';
export { animations } from './animations';

// Re-import for combined export
import { colors } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';
import { radii } from './radii';
import { shadows } from './shadows';
import { gradients } from './gradients';
import { animations } from './animations';

// Combined tokens object (maintains backward compatibility)
export const tokens = {
  colors,
  spacing,
  typography,
  radii,
  shadows,
  gradients,
  animations,
} as const;

// TypeScript types
export type TokensType = typeof tokens;