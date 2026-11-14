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
  /** Background of the big streak card on the Today screen. */
  hero: string;
}

export interface ThemeDef {
  id: string;
  name: string;
  emoji: string;
  dark: boolean;
  /** Emoji shown on the streak card. */
  mascot: string;
  /** Best streak (days) needed to unlock this theme. Unset = free. */
  unlock?: number;
  /** Animated effect drawn over the app. */
  fx?: 'petals' | 'stars' | 'bubbles' | 'aurora' | 'rainbow';
  colors: Palette;
}

const base = { success: '#2EB67D', warn: '#F5A524', danger: '#E5484D', refillBg: '#FFF4D6', refillBorder: '#F5D98B' };
const darkBase = { success: '#3DD598', warn: '#FFB84D', danger: '#FF6B70', refillBg: '#3A3020', refillBorder: '#6B5A2E' };

export const THEMES: ThemeDef[] = [
  {
    id: 'sunrise', name: 'Sunrise', emoji: '🌅', mascot: '🔥', dark: false,
    colors: { ...base, bg: '#FFE3CC', card: '#FFFFFF', text: '#2B2233', muted: '#7C7287', primary: '#FF7A45', primaryDark: '#E4592A', accent: '#6C5CE7', border: '#F7D9C4', chipBg: '#FFE2CF', hero: '#FF7A45' },
  },
  {
    id: 'bubblegum', name: 'Bubblegum', emoji: '🍬', mascot: '🍭', dark: false,
    colors: { ...base, bg: '#FFD0E8', card: '#FFF8FC', text: '#4A1D3A', muted: '#9A6683', primary: '#F2428C', primaryDark: '#C91D6B', accent: '#9B5CF6', border: '#F9B8D6', chipBg: '#FFCFE6', hero: '#F2428C' },
  },
  {
    id: 'ocean', name: 'Ocean', emoji: '🌊', mascot: '🐳', dark: false,
    colors: { ...base, bg: '#C4E6FF', card: '#F5FAFF', text: '#0F2A44', muted: '#5C7A94', primary: '#1E78E6', primaryDark: '#1458B5', accent: '#00A99D', border: '#A9D2F5', chipBg: '#BFE0FF', hero: '#1E78E6' },
  },
  {
    id: 'mint', name: 'Mint', emoji: '🍃', mascot: '🌿', dark: false,
    colors: { ...base, bg: '#C9F7DE', card: '#F6FFF9', text: '#12382A', muted: '#5C8070', primary: '#12A064', primaryDark: '#0B7B4A', accent: '#E69A0C', border: '#A8E3C4', chipBg: '#C4F0D8', hero: '#12A064' },
  },
  {
    id: 'lavender', name: 'Lavender', emoji: '🔮', mascot: '🦄', dark: false,
    colors: { ...base, bg: '#DDD0FF', card: '#FAF7FF', text: '#2A2058', muted: '#7A6FAE', primary: '#7050F2', primaryDark: '#5233D1', accent: '#F2548F', border: '#CDBFF7', chipBg: '#DBCFFF', hero: '#7050F2' },
  },
  {
    id: 'sunflower', name: 'Sunflower', emoji: '🌻', mascot: '🌻', dark: false,
    colors: { ...base, bg: '#FFEC8A', card: '#FFFDF0', text: '#3D2F00', muted: '#8A7420', primary: '#F0A500', primaryDark: '#C27E00', accent: '#5B7B2E', border: '#F2DA6A', chipBg: '#FFE98A', hero: '#F0A500' },
  },
  {
    id: 'cherry', name: 'Cherry', emoji: '🍒', mascot: '🍒', dark: false,
    colors: { ...base, bg: '#FFDADA', card: '#FFF6F6', text: '#430E14', muted: '#9A5A60', primary: '#D7263D', primaryDark: '#A81527', accent: '#2E8B7A', border: '#F5B0B5', chipBg: '#FFC4C8', hero: '#D7263D' },
  },
  {
    id: 'cotton', name: 'Cotton Candy', emoji: '☁️', mascot: '🦋', dark: false,
    colors: { ...base, bg: '#E3F1FF', card: '#FFF7FC', text: '#31305E', muted: '#807FB0', primary: '#FF7EB6', primaryDark: '#E0529A', accent: '#6BC5F5', border: '#D3D4F7', chipBg: '#F4DDF7', hero: '#8AA8FF' },
  },
  {
    id: 'forest', name: 'Forest', emoji: '🌲', mascot: '🦌', dark: true,
    colors: { ...darkBase, bg: '#0F1F17', card: '#18301F', text: '#E6F5EA', muted: '#8FB59C', primary: '#4ADE80', primaryDark: '#22C55E', accent: '#F5C84B', border: '#27492F', chipBg: '#1F3D29', hero: '#1F7A45' },
  },
  {
    id: 'midnight', name: 'Midnight', emoji: '🌙', mascot: '🌙', dark: true,
    colors: { ...darkBase, bg: '#120F24', card: '#1F1A38', text: '#F4EFFF', muted: '#A59BC8', primary: '#F26B3A', primaryDark: '#D9531F', accent: '#8F7CFF', border: '#352D58', chipBg: '#2A2348', hero: '#4B3BA8' },
  },
  {
    id: 'galaxy', name: 'Galaxy', emoji: '🪐', mascot: '🚀', dark: true,
    colors: { ...darkBase, bg: '#070B1F', card: '#111836', text: '#E8ECFF', muted: '#8F9AD0', primary: '#B388FF', primaryDark: '#8E5CF0', accent: '#4DD0E1', border: '#222B5C', chipBg: '#1A2250', hero: '#5E35B1' },
  },
  {
    id: 'noir', name: 'Noir', emoji: '🖤', mascot: '🐈‍⬛', dark: true,
    colors: { ...darkBase, bg: '#0B0B0D', card: '#17171B', text: '#F2F2F4', muted: '#9A9AA5', primary: '#FF4D6D', primaryDark: '#E02E51', accent: '#FFD166', border: '#2A2A31', chipBg: '#202026', hero: '#2B2B33' },
  },
  {
    id: 'rainbow', name: 'Rainbow', emoji: '🌈', mascot: '🌈', dark: false,
    colors: { ...base, bg: '#FFF6A8', card: '#FFFFFF', text: '#2B1B4D', muted: '#7A5FA8', primary: '#FF2D95', primaryDark: '#D40F77', accent: '#00BFFF', border: '#FFD54D', chipBg: '#FFE066', hero: '#8A3FFC' },
  },
  {
    id: 'tiedye', name: 'Tie-Dye', emoji: '🌀', mascot: '🌀', dark: false,
    colors: { ...base, bg: '#EBC8FF', card: '#FFF5FF', text: '#3A0F5C', muted: '#8A4FB5', primary: '#FF4DA6', primaryDark: '#D92B86', accent: '#14D8C8', border: '#D79BFF', chipBg: '#FFC2EE', hero: '#7B2FF7' },
  },
  {
    id: 'groovy', name: 'Groovy 70s', emoji: '☮️', mascot: '✌️', dark: false,
    colors: { ...base, bg: '#FFDB8A', card: '#FFF6DE', text: '#4A2000', muted: '#9A6A2A', primary: '#FF6A00', primaryDark: '#D14E00', accent: '#00A88F', border: '#F2B84B', chipBg: '#FFC95C', hero: '#D9480F' },
  },
  {
    id: 'flowerpower', name: 'Flower Power', emoji: '🌼', mascot: '🌼', dark: false,
    colors: { ...base, bg: '#D6FF8F', card: '#FAFFEA', text: '#1B3500', muted: '#58802A', primary: '#FF3DA0', primaryDark: '#D11E80', accent: '#FFAA00', border: '#A8E64D', chipBg: '#BFF560', hero: '#2FAE2F' },
  },
  {
    id: 'sunsethaze', name: 'Sunset Haze', emoji: '🌇', mascot: '🌇', dark: false,
    colors: { ...base, bg: '#FFC9D6', card: '#FFF3F6', text: '#4A0E2E', muted: '#A55A78', primary: '#FF5A36', primaryDark: '#D93C1A', accent: '#8A3FFC', border: '#FF9DB8', chipBg: '#FFB1C6', hero: '#FF4E7E' },
  },
  {
    id: 'chillzone', name: 'Chill Zone', emoji: '🌿', mascot: '🍃', dark: true,
    colors: { ...darkBase, bg: '#08170D', card: '#12301B', text: '#EAFFE0', muted: '#8FC48A', primary: '#1DB954', primaryDark: '#0F9A3E', accent: '#FF6AD5', border: '#20502C', chipBg: '#194024', hero: '#1B9A3C' },
  },
  {
    id: 'trippy', name: 'Trippy', emoji: '🍄', mascot: '🍄', dark: true,
    colors: { ...darkBase, bg: '#1A0838', card: '#2D1259', text: '#FFF0FF', muted: '#C79BFF', primary: '#FF2EC4', primaryDark: '#D60FA2', accent: '#27F5E3', border: '#4B2090', chipBg: '#3A1773', hero: '#7B1FA2' },
  },
  {
    id: 'sakura', name: 'Sakura Drift', emoji: '🌸', mascot: '🌸', dark: false, unlock: 3, fx: 'petals',
    colors: { ...base, bg: '#FFE3EE', card: '#FFF8FB', text: '#4A1530', muted: '#A76A87', primary: '#F0589A', primaryDark: '#D23880', accent: '#7BC6A4', border: '#F8BDD6', chipBg: '#FFD0E3', hero: '#F4709F' },
  },
  {
    id: 'aurora', name: 'Aurora', emoji: '🌌', mascot: '🦉', dark: true, unlock: 7, fx: 'aurora',
    colors: { ...darkBase, bg: '#07162B', card: '#0F2440', text: '#E6FFF7', muted: '#86B7C9', primary: '#14B88A', primaryDark: '#0E8F6B', accent: '#8C7CFF', border: '#1B3A5E', chipBg: '#14304F', hero: '#0F9D8A' },
  },
  {
    id: 'starfall', name: 'Starfall', emoji: '🌠', mascot: '⭐', dark: true, unlock: 14, fx: 'stars',
    colors: { ...darkBase, bg: '#0A0820', card: '#171340', text: '#F2F0FF', muted: '#A9A4E0', primary: '#7C5CFF', primaryDark: '#5B3DE0', accent: '#FFD24D', border: '#2A2468', chipBg: '#201A58', hero: '#4B2FB8' },
  },
  {
    id: 'lavalamp', name: 'Lava Lamp', emoji: '🫠', mascot: '🔮', dark: true, unlock: 30, fx: 'bubbles',
    colors: { ...darkBase, bg: '#2A0A3D', card: '#431563', text: '#FFF1E6', muted: '#E0A8D0', primary: '#FF6B35', primaryDark: '#E04F1B', accent: '#FFD23F', border: '#6A2A8F', chipBg: '#521A78', hero: '#C2185B' },
  },
  {
    id: 'rainbowwave', name: 'Rainbow Wave', emoji: '🏳️‍🌈', mascot: '🌈', dark: false, unlock: 60, fx: 'rainbow',
    colors: { ...base, bg: '#FFF3FF', card: '#FFFFFF', text: '#2B1B4D', muted: '#7A5FA8', primary: '#FF2D95', primaryDark: '#D40F77', accent: '#00BFFF', border: '#F2C6F2', chipBg: '#FFE0FA', hero: '#7C3AED' },
  },
];

export interface Accent { id: string; name: string; color: string; dark: string }
/** null id = "use the theme's own color". */
export const ACCENTS: Accent[] = [
  { id: 'coral', name: 'Coral', color: '#FF6B6B', dark: '#E04848' },
  { id: 'orange', name: 'Orange', color: '#FF8A3D', dark: '#E36A1B' },
  { id: 'gold', name: 'Gold', color: '#F2B01E', dark: '#C98A00' },
  { id: 'lime', name: 'Lime', color: '#7BC62D', dark: '#5C9C14' },
  { id: 'teal', name: 'Teal', color: '#14B8A6', dark: '#0E8F80' },
  { id: 'sky', name: 'Sky', color: '#38A9F5', dark: '#1B86D0' },
  { id: 'blue', name: 'Blue', color: '#4F6BF2', dark: '#3149D1' },
  { id: 'violet', name: 'Violet', color: '#8B5CF6', dark: '#6D3DDB' },
  { id: 'pink', name: 'Pink', color: '#F2579B', dark: '#D03380' },
  { id: 'rose', name: 'Rose', color: '#E11D48', dark: '#B80F37' },
];

export type Corners = 'sharp' | 'soft' | 'round';
export const CORNER_SETS: Record<Corners, { sm: number; md: number; lg: number }> = {
  sharp: { sm: 4, md: 6, lg: 10 },
  soft: { sm: 10, md: 16, lg: 24 },
  round: { sm: 16, md: 26, lg: 34 },
};

export const DEFAULT_THEME_ID = 'sunrise';

/** Live palette. Values are swapped in place by applyLook(); screens read it while rendering. */
export const colors: Palette = { ...THEMES[0].colors };
/** Live corner radii (also swapped in place). */
export const radius = { ...CORNER_SETS.soft };

let version = 0;
let currentKey = '';

export function getTheme(id: string): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export interface Look { theme: string; accent: string | null; corners: string }

export function applyLook(look: Look): ThemeDef {
  const t = getTheme(look.theme);
  const key = `${t.id}|${look.accent ?? ''}|${look.corners}`;
  if (key !== currentKey) {
    Object.assign(colors, t.colors);
    const ac = ACCENTS.find((x) => x.id === look.accent);
    if (ac) {
      colors.primary = ac.color;
      colors.primaryDark = ac.dark;
      colors.hero = ac.color;
    }
    Object.assign(radius, CORNER_SETS[(look.corners as Corners) in CORNER_SETS ? (look.corners as Corners) : 'soft']);
    currentKey = key;
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

