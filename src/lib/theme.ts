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
  fx?: 'aurora' | 'rainbow' | 'lightning';
  /** Falling / rising / drifting particle id (see ThemeFx PARTICLES). */
  particle?: string;
  /** Particle speed multiplier (1 = normal). */
  speed?: number;
  /** Bundled font key (see fonts.ts). */
  font?: string;
  colors: Palette;
}

const base = { success: '#2EB67D', warn: '#F5A524', danger: '#E5484D', refillBg: '#FFF4D6', refillBorder: '#F5D98B' };
const darkBase = { success: '#3DD598', warn: '#FFB84D', danger: '#FF6B70', refillBg: '#3A3020', refillBorder: '#6B5A2E' };

/** Short palette builder for the newer themes: background, card, text, main color, button tint, border, hero. */
function pal(dark: boolean, bg: string, card: string, text: string, muted: string, primary: string, primaryDark: string, accent: string, chipBg: string, border: string, hero?: string): Palette {
  return { ...(dark ? darkBase : base), bg, card, text, muted, primary, primaryDark, accent, border, chipBg, hero: hero ?? primary };
}

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
    id: 'sakura', name: 'Sakura Drift', emoji: '🌸', mascot: '🌸', dark: false, unlock: 3, particle: 'petals', font: 'pacifico',
    colors: { ...base, bg: '#FFE3EE', card: '#FFF8FB', text: '#4A1530', muted: '#A76A87', primary: '#F0589A', primaryDark: '#D23880', accent: '#7BC6A4', border: '#F8BDD6', chipBg: '#FFD0E3', hero: '#F4709F' },
  },
  {
    id: 'aurora', name: 'Aurora', emoji: '🌌', mascot: '🦉', dark: true, unlock: 7, fx: 'aurora', particle: 'sparkles', font: 'comfortaa',
    colors: { ...darkBase, bg: '#07162B', card: '#0F2440', text: '#E6FFF7', muted: '#86B7C9', primary: '#14B88A', primaryDark: '#0E8F6B', accent: '#8C7CFF', border: '#1B3A5E', chipBg: '#14304F', hero: '#0F9D8A' },
  },
  {
    id: 'starfall', name: 'Starfall', emoji: '🌠', mascot: '⭐', dark: true, unlock: 14, particle: 'stars', font: 'bubblegum',
    colors: { ...darkBase, bg: '#0A0820', card: '#171340', text: '#F2F0FF', muted: '#A9A4E0', primary: '#7C5CFF', primaryDark: '#5B3DE0', accent: '#FFD24D', border: '#2A2468', chipBg: '#201A58', hero: '#4B2FB8' },
  },
  {
    id: 'lavalamp', name: 'Lava Lamp', emoji: '🫠', mascot: '🔮', dark: true, unlock: 30, particle: 'bubbles', font: 'chewy',
    colors: { ...darkBase, bg: '#2A0A3D', card: '#431563', text: '#FFF1E6', muted: '#E0A8D0', primary: '#FF6B35', primaryDark: '#E04F1B', accent: '#FFD23F', border: '#6A2A8F', chipBg: '#521A78', hero: '#C2185B' },
  },
  {
    id: 'rainbowwave', name: 'Rainbow Wave', emoji: '🏳️‍🌈', mascot: '🌈', dark: false, unlock: 60, fx: 'rainbow', particle: 'confetti', font: 'baloo',
    colors: { ...base, bg: '#FFF3FF', card: '#FFFFFF', text: '#2B1B4D', muted: '#7A5FA8', primary: '#FF2D95', primaryDark: '#D40F77', accent: '#00BFFF', border: '#F2C6F2', chipBg: '#FFE0FA', hero: '#7C3AED' },
  },

  // ---- animated, free, not girly ----
  { id: 'garagenight', name: 'Garage Night', emoji: '🔧', mascot: '🔧', dark: true, particle: 'sparks', colors: pal(true, '#2B2D31', '#3A3D43', '#E6E8EB', '#9AA0A8', '#FF7A1A', '#E06000', '#FFC15A', '#464A52', '#4A4E56', '#C25A10') },
  { id: 'deepsea', name: 'Deep Sea', emoji: '🐙', mascot: '🦈', dark: true, particle: 'deepbubbles', colors: pal(true, '#06323A', '#0B4651', '#DFF6F6', '#7FC9C9', '#2EE6C5', '#14B89C', '#FFB84D', '#0F5560', '#146571', '#0E6F75') },
  { id: 'coderain', name: 'Code Rain', emoji: '💻', mascot: '🤖', dark: true, particle: 'code', font: 'pixel', colors: pal(true, '#050805', '#0C140D', '#B8F5C6', '#3FAE5A', '#39FF6A', '#1FCC4C', '#B8F5C6', '#12301A', '#1F6B32', '#0F3D1B') },
  { id: 'forge', name: 'Forge', emoji: '🔥', mascot: '⚒️', dark: true, particle: 'embers', colors: pal(true, '#241010', '#381818', '#F4DCD6', '#C98A80', '#FF4A1C', '#E03A12', '#FFB02E', '#4A2020', '#5A2626', '#8A1F0C') },
  { id: 'spacecadet', name: 'Space Cadet', emoji: '🚀', mascot: '👨‍🚀', dark: true, particle: 'starfield', colors: pal(true, '#0B1230', '#16204A', '#E3E8FF', '#8E9BD6', '#6EA8FF', '#4A86E0', '#FFD166', '#1E2A5E', '#26336E', '#2A3F8F') },
  { id: 'arcticnight', name: 'Arctic Night', emoji: '🧊', mascot: '🐧', dark: true, particle: 'snow', colors: pal(true, '#0F1C2B', '#1A2B40', '#E4F1FF', '#8FAAC4', '#6FD3FF', '#3FB4E8', '#FFD166', '#223A55', '#2C4766', '#1F5A80') },

  // ---- basic, calm ----
  { id: 'clean', name: 'Clean', emoji: '🤍', mascot: '💊', dark: false, colors: pal(false, '#F7F8FA', '#FFFFFF', '#1F2430', '#6B7280', '#3B82F6', '#2563EB', '#10B981', '#E3EAF6', '#E1E6EE') },
  { id: 'graymist', name: 'Gray Mist', emoji: '🌫️', mascot: '🕊️', dark: false, colors: pal(false, '#E8EBEF', '#F6F7F9', '#2A2F38', '#6A7380', '#5B6B85', '#44536B', '#E08A3C', '#D2D8E1', '#CDD3DC') },
  { id: 'calmsea', name: 'Calm Sea', emoji: '🐚', mascot: '🐚', dark: false, colors: pal(false, '#DDEFF3', '#F3FBFC', '#0F3340', '#587A86', '#2A9DB0', '#1E7F90', '#F28F6B', '#BFE3EA', '#BADBE2') },
  { id: 'sand', name: 'Sand', emoji: '🏜️', mascot: '🌵', dark: false, colors: pal(false, '#F6EAD4', '#FFF9EC', '#4A361A', '#8C7650', '#C98A2B', '#A66C14', '#5E8C61', '#EFD9AE', '#E8D3A8') },
  { id: 'slate', name: 'Slate', emoji: '🪨', mascot: '🗿', dark: true, colors: pal(true, '#1E232B', '#2A313C', '#E8ECF2', '#9AA4B2', '#6C8EF5', '#4C6FDB', '#F5B761', '#333B49', '#3B4454') },
  { id: 'linen', name: 'Linen', emoji: '🧺', mascot: '🧶', dark: false, colors: pal(false, '#F3EEE6', '#FFFCF7', '#3B342B', '#8A8074', '#B5784A', '#955C33', '#6F8F72', '#E9DFD0', '#E2D8C8') },

  // ---- storybook-inspired (original palettes) ----
  { id: 'cloudmeadow', name: 'Cloud Meadow', emoji: '☁️', mascot: '🌾', dark: false, unlock: 4, particle: 'clouds', font: 'kalam', colors: pal(false, '#CFEFFF', '#F3FBFF', '#1D4A3A', '#587F70', '#4FA866', '#368850', '#F2A65A', '#B9E3A8', '#B0D9F0', '#5BB0E0') },
  { id: 'spiritforest', name: 'Spirit Forest', emoji: '🌲', mascot: '🍃', dark: true, unlock: 12, particle: 'fireflies', font: 'cormorant', colors: pal(true, '#183B2C', '#21503B', '#D7FFC9', '#9CCB94', '#5BCB7B', '#38A85B', '#E4FF6B', '#2F6B4A', '#2B6148', '#2E7D4F') },
  { id: 'lanternnight', name: 'Lantern Night', emoji: '🏮', mascot: '🏮', dark: false, unlock: 18, particle: 'lanterns', font: 'cormorant', colors: pal(false, '#FFE3B8', '#FFF6E6', '#7A2A12', '#A8714F', '#D8502B', '#B03A1A', '#F2B134', '#F4B48A', '#F0CFA0', '#E0663A') },
  { id: 'seasidebreeze', name: 'Seaside Breeze', emoji: '🌊', mascot: '⛵', dark: false, unlock: 35, particle: 'greenleaf', font: 'kalam', colors: pal(false, '#BDE8E6', '#EFFBFA', '#10466A', '#4F84A0', '#1F9BB8', '#13799A', '#F29F5C', '#9FD6D2', '#A5D9D6', '#2BB3C8') },
  { id: 'dandelionhill', name: 'Dandelion Hill', emoji: '🌾', mascot: '🌼', dark: false, unlock: 50, particle: 'seeds', font: 'kalam', colors: pal(false, '#F2E6C9', '#FFFAEE', '#4A3A1A', '#8F7C52', '#8DAA3C', '#6F8A26', '#F2B134', '#E4D09B', '#E8D8AE', '#A5C050') },

  // ---- hippie ----
  { id: 'woodstock', name: 'Woodstock Sunrise', emoji: '☮️', mascot: '☮️', dark: false, unlock: 2, particle: 'peace', font: 'shrikhand', colors: pal(false, '#FFB347', '#FFE9C7', '#5A1030', '#8F4A55', '#E64A8D', '#C42C70', '#7A3FD1', '#FF8FB1', '#F59A3C', '#F0661F') },
  { id: 'daisychain', name: 'Daisy Chain', emoji: '🌼', mascot: '🌼', dark: false, unlock: 5, particle: 'flowers', font: 'lobster', colors: pal(false, '#E7F7B5', '#FBFFE8', '#6A1B9A', '#9C6AB8', '#C23FB0', '#9F2790', '#F5A623', '#F6A6E0', '#D4EC8E', '#D94FC4') },
  { id: 'psychswirl', name: 'Psychedelic Swirl', emoji: '🌀', mascot: '🌀', dark: true, unlock: 8, particle: 'spirals', font: 'wetpaint', colors: pal(true, '#3A0F8F', '#5319C2', '#FFF35C', '#E0C4FF', '#FF3FA8', '#D61F86', '#27F5E3', '#6E2BD9', '#7B3BE0', '#8A2BE2') },
  { id: 'incense', name: 'Incense and Macrame', emoji: '🪔', mascot: '🪬', dark: false, unlock: 15, particle: 'smoke', font: 'gloria', colors: pal(false, '#D9B98C', '#F2E2C6', '#4A2A10', '#80603A', '#A8683A', '#8A4E24', '#6F8F4E', '#C49A6C', '#C9A878', '#B97A4A') },
  { id: 'sunflowerpeace', name: 'Sunflower Peace', emoji: '🌻', mascot: '🌈', dark: false, unlock: 40, particle: 'rainbows', font: 'shrikhand', colors: pal(false, '#FFE14F', '#FFF6BF', '#2D1A6B', '#6B5BA0', '#3FA9E0', '#1E86BF', '#E64A8D', '#7ED8FF', '#F0CC3A', '#F28C1F') },
  { id: 'chillgreen', name: 'Green Haze', emoji: '🌿', mascot: '🌿', dark: true, unlock: 20, particle: 'stonermix', font: 'merienda', colors: pal(true, '#0F2A18', '#173D24', '#E5FFD1', '#98C98A', '#4CC25A', '#2FA03E', '#F2D94A', '#20502C', '#245C33', '#2E8B3E') },

  // ---- animated extras ----
  { id: 'snowfall', name: 'Snowfall', emoji: '☃️', mascot: '☃️', dark: false, unlock: 5, particle: 'snow', font: 'fredoka', colors: pal(false, '#E8F2FF', '#F8FBFF', '#183A63', '#5F7FA3', '#4A8FE0', '#2F6FC0', '#E26D8B', '#C3DBF7', '#C9DDF5', '#5E9DE8') },
  { id: 'autumn', name: 'Autumn Leaves', emoji: '🍁', mascot: '🍁', dark: false, unlock: 10, particle: 'leaves', font: 'caveat', colors: pal(false, '#FFEBD2', '#FFF8EE', '#6B2D0A', '#A66B45', '#D9692A', '#B54E14', '#8A9A3B', '#F8CDA0', '#F2D5AE', '#E27B35') },
  { id: 'fireflies', name: 'Fireflies', emoji: '🪲', mascot: '✨', dark: true, unlock: 21, particle: 'fireflies', font: 'merienda', colors: pal(true, '#0F1A12', '#18281C', '#E9FFB8', '#A5C47E', '#7BC74A', '#5AA52E', '#E4FF6B', '#26402B', '#2C4A32', '#3F8F3A') },
  { id: 'rainyday', name: 'Rainy Day', emoji: '🌧️', mascot: '☔', dark: false, unlock: 25, particle: 'rain', font: 'patrick', colors: pal(false, '#DDE6EE', '#F3F7FB', '#26394D', '#6A8099', '#4F86B8', '#376A9A', '#E69A4C', '#BCCFE2', '#C4D2E0', '#5C93C4') },
  { id: 'neonarcade', name: 'Neon Arcade', emoji: '🕹️', mascot: '👾', dark: true, unlock: 45, particle: 'confetti', font: 'pixel', speed: 1.3, colors: pal(true, '#10002B', '#240046', '#7DF9FF', '#B28DFF', '#FF4FD8', '#D91FB4', '#FFE14F', '#3A0F7A', '#4A1B96', '#7B2FF7') },
];

export interface CustomTheme {
  bg: string;
  primary: string;
  text: string;
  font: string | null;
  particle: string | null;
  speed: number;
}

export const DEFAULT_CUSTOM: CustomTheme = { bg: '#FFD6EC', primary: '#E64A8D', text: '#4A1530', font: 'baloo', particle: 'hearts', speed: 1 };

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, w: number): string {
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  const c = x.map((v, i) => Math.round(v * (1 - w) + y[i] * w));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}
function luma(h: string): number {
  const [r, g, b] = hexToRgb(h);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Builds a full theme from a few picked colors. Buttons are tinted, never pure white. */
export function customThemeDef(c: CustomTheme): ThemeDef {
  const dark = luma(c.bg) < 0.45;
  const card = dark ? mix(c.bg, '#ffffff', 0.12) : mix(c.bg, '#ffffff', 0.7);
  const chip = mix(c.bg, c.primary, dark ? 0.35 : 0.3);
  return {
    id: 'custom', name: 'My theme', emoji: '🎨', mascot: '🎨', dark,
    particle: c.particle ?? undefined, speed: c.speed, font: c.font ?? undefined,
    colors: pal(dark, c.bg, card, c.text, mix(c.text, c.bg, 0.45), c.primary, mix(c.primary, '#000000', 0.2), mix(c.primary, c.text, 0.5), chip, mix(c.bg, c.text, 0.15), c.primary),
  };
}

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
/** Readable text colour (dark or white) for something drawn on the current primary colour. */
export function onPrimary(): string {
  const hex = colors.primary.replace('#', '');
  const n = parseInt(hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex.slice(0, 6), 16);
  const lin = (v: number) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  const lum = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return lum > 0.45 ? '#1A1228' : '#FFFFFF';
}
/** Keeps `fg` if it is easy to read on `bg`, otherwise falls back to dark or white. Used for chips so words never vanish. */
export function readableOn(fg: string, bg: string): string {
  const lin = (v: number) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  const L = (h: string) => { const [r, g, b] = hexToRgb(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
  const a = L(fg);
  const b = L(bg);
  const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  if (ratio >= 4.5) return fg;
  return b > 0.45 ? '#1A1228' : '#FFFFFF';
}
/** Live corner radii (also swapped in place). */
export const radius = { ...CORNER_SETS.soft };

let version = 0;
let currentKey = '';

export function getTheme(id: string, custom?: CustomTheme): ThemeDef {
  if (id === 'custom') return customThemeDef(custom ?? DEFAULT_CUSTOM);
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export interface Look { theme: string; accent: string | null; corners: string; custom?: CustomTheme; bgImage?: boolean; seeThrough?: boolean }

let bgActive = false;
/** Background for screens and headers: see-through when a custom background picture is on. */
export function sceneBg(): string {
  return bgActive ? 'transparent' : colors.bg;
}

function withAlpha(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6);
  const n = parseInt(f, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

export function applyLook(look: Look): ThemeDef {
  const t = getTheme(look.theme, look.custom);
  const key = `${t.id}|${look.accent ?? ''}|${look.corners}|${look.theme === 'custom' ? JSON.stringify(look.custom) : ''}|${look.bgImage ? (look.seeThrough ? 'bgs' : 'bg') : ''}`;
  if (key !== currentKey) {
    Object.assign(colors, t.colors);
    const ac = ACCENTS.find((x) => x.id === look.accent);
    if (ac) {
      colors.primary = ac.color;
      colors.primaryDark = ac.dark;
      colors.hero = ac.color;
    }
    bgActive = !!look.bgImage;
    if (bgActive && look.seeThrough) colors.card = withAlpha(colors.card, 0.82);
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

