export { colors, gradients } from './colors';
export { spacing } from './spacing';
export { radii } from './radii';
export { typography } from './typography';
export { shadows } from './shadows';
export { animations } from './animations';

import { colors, gradients } from './colors';
import { spacing } from './spacing';
import { radii } from './radii';
import { typography } from './typography';
import { shadows } from './shadows';
import { animations } from './animations';

export type ThemeTokens = {
  colors: typeof colors;
  gradients: typeof gradients;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  shadows: typeof shadows;
  animations: typeof animations;
};

export const tokens: ThemeTokens = {
  colors,
  gradients,
  spacing,
  radii,
  typography,
  shadows,
  animations,
};
