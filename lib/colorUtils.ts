/**
 * Shared color utilities for Hoplix color handling.
 * Provides color name-to-hex mapping and parsing functions.
 */

// Map Hoplix color names to actual hex color codes
export const COLOR_HEX_MAP: Record<string, string> = {
  white: '#FFFFFF',
  black: '#000000',
  red: '#FF0000',
  navy: '#000080',
  darkgrey: '#555555',
  heathergrey: '#888888',
  lightblue: '#ADD8E6',
  kellygreen: '#4CBB17',
  yellow: '#FFFF00',
  orange: '#FFA500',
  bordeaux: '#800000',
  fuchsia: '#FF00FF',
  pink: '#FFC0CB',
  purple: '#800080',
  graymarble: '#AAAAAA',
  neonorange: '#FF6600',
  deepberry: '#8B0000',
  kiwi: '#86B404',
  bottlegreen: '#006400',
  blueroyal: '#4169E1',
  grey: '#808080',
  darkheather: '#444444',
  lightpink: '#FFB6C1',
  mint: '#98FF98',
  royal: '#4169E1',
  heather: '#9C9C9C',
  forest: '#228B22',
  burgundy: '#800020',
  charcoal: '#36454F',
  olive: '#808000',
  sportgrey: '#A9A9A9',
  ash: '#BEBEBE',
  silver: '#C0C0C0',
  gold: '#FFD700',
  brown: '#8B4513',
  teal: '#008080',
  cyan: '#00FFFF',
  maroon: '#800000',
  coral: '#FF7F50',
  lavender: '#E6E6FA',
  indigo: '#4B0082',
  violet: '#EE82EE',
  beige: '#F5F5DC',
  cream: '#FFFDD0',
  sand: '#C2B280',
};

export interface ColorInfo {
  name: string;
  code: string;      // Hex color code (e.g. "#FF0000")
  imageKey: string;  // Normalized key for image URL building
}

/**
 * Resolve a Hoplix color name to its hex code.
 * Falls back to '#CCCCCC' (grey) if the color is not found.
 */
export function getColorHex(colorName: string): string {
  const key = colorName.trim().toLowerCase().replace(/\s+/g, '');
  return COLOR_HEX_MAP[key] || COLOR_HEX_MAP[colorName.trim().toLowerCase()] || '#CCCCCC';
}

/**
 * Parse a comma-separated color string from Hoplix API (e.g. "black,red,blue")
 * into an array of ColorInfo objects with proper hex codes.
 */
export function parseColors(colorString: string): ColorInfo[] {
  if (!colorString) return [];

  return colorString
    .split(',')
    .map(name => name.trim())
    .filter(name => name && name.toLowerCase() !== 'nd') // "nd" = no color defined
    .map(name => {
      const normalized = name.toLowerCase().replace(/\s+/g, '');
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        code: getColorHex(normalized),
        imageKey: normalized,
      };
    });
}