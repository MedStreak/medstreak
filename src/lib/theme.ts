export interface Palette {
  bg: string;
  card: string;
  text: string;
  muted: string;
  primary: string;
  primaryDark: string;
  accent: string;
  success: string;
  warn: string;
  danger: string;
  border: string;
  chipBg: string;
  refillBg: string;
  refillBorder: string;
}

export interface ThemeDef {
  id: string;
  name: string;
  emoji: string;
  dark: boolean;
  colors: Palette;
}

const base = { success: '#2EB67D', warn: '#F5A524', danger: '#E5484D', refillBg: '#FFF4D6', refillBorder: '#F5D98B' };

export const THEMES: ThemeDef[] = [
  {
    id: 'sunrise', name: 'Sunrise', emoji: '🌅', dark: false,
    colors: { ...base, bg: '#FFF8F2', card: '#FFFFFF', text: '#2B2233', muted: '#7C7287', primary: '#FF7A45', primaryDark: '#E4592A', accent: '#6C5CE7', border: '#EFE4DA', chipBg: '#FFF0E6' },
  },
  {
    id: 'bubblegum', name: 'Bubblegum', emoji: '🍬', dark: false,
    colors: { ...base, bg: '#FFF0F6', card: '#FFFFFF', text: '#3A2535', muted: '#8C6F80', primary: '#F2428C', primaryDark: '#D0286F', accent: '#9B5CF6', border: '#F6D3E3', chipBg: '#FFE0EE' },
  },
  {
    id: 'ocean', name: 'Ocean', emoji: '🌊', dark: false,
    colors: { ...base, bg: '#EEF7FF', card: '#FFFFFF', text: '#1D2B3A', muted: '#6A7F93', primary: '#2B7FE8', primaryDark: '#1C62BD', accent: '#00A99D', border: '#CFE3F5', chipBg: '#DCEEFF' },
  },
  {
    id: 'mint', name: 'Mint', emoji: '🍃', dark: false,
    colors: { ...base, bg: '#EFFBF4', card: '#FFFFFF', text: '#1E3329', muted: '#668273', primary: '#17A06B', primaryDark: '#0F7D51', accent: '#E69A0C', border: '#CBEBD9', chipBg: '#DDF5E8' },
  },
  {
    id: 'lavender', name: 'Lavender', emoji: '🔮', dark: false,
    colors: { ...base, bg: '#F6F2FF', card: '#FFFFFF', text: '#2A2347', muted: '#7C73A0', primary: '#7456F5', primaryDark: '#573AD8', accent: '#F2548F', border: '#DDD2F7', chipBg: '#ECE5FF' },
  },
  {
    id: 'midnight', name: 'Midnight', emoji: '🌙', dark: true,
    colors: { success: '#3DD598', warn: '#FFB84D', danger: '#FF6B70', refillBg: '#3A3020', refillBorder: '#6B5A2E', bg: '#14111F', card: '#1F1A2E', text: '#F4EFFF', muted: '#A59BC0', primary: '#F26B3A', primaryDark: '#D9531F', accent: '#8F7CFF', border: '#342D4A', chipBg: '#2A2340' },
  },
];

export const DEFAULT_THEME_ID = 'sunrise';

/** Live palette. Values are swapped in place by applyTheme(); screens read it while rendering. */
export const colors: Palette = { ...THEMES[0].colors };

let version = 0;
let currentId = DEFAULT_THEME_ID;

export function getTheme(id: string): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function applyTheme(id: string): ThemeDef {
  const t = getTheme(id);
  if (t.id !== currentId) {
    Object.assign(colors, t.colors);
    currentId = t.id;
    version += 1;
  }
  return t;
}

/**
 * Like StyleSheet.create, but re-built whenever the theme changes.
 * Use `const styles = themedStyles(() => StyleSheet.create({ ... }))` and read `styles.x` while rendering.
 */
export function themedStyles<T extends object>(factory: () => T): T {
  let cached: T | null = null;
  let built = -1;
  return new Proxy({} as T, {
    get(_t, prop) {
      if (cached === null || built !== version) {
        cached = factory();
        built = version;
      }
      return (cached as Record<string | symbol, unknown>)[prop];
    },
  });
}

export const pillColors = ['#FF7A45', '#6C5CE7', '#2EB67D', '#3B82F6', '#EC4899', '#F5A524'];

export const radius = { sm: 10, md: 16, lg: 24 };
