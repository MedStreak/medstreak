import { Text } from 'react-native';
import { Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Comfortaa_400Regular } from '@expo-google-fonts/comfortaa';
import { BubblegumSans_400Regular } from '@expo-google-fonts/bubblegum-sans';
import { Chewy_400Regular } from '@expo-google-fonts/chewy';
import { Baloo2_400Regular } from '@expo-google-fonts/baloo-2';
import { Caveat_400Regular } from '@expo-google-fonts/caveat';
import { Merienda_400Regular } from '@expo-google-fonts/merienda';
import { PatrickHand_400Regular } from '@expo-google-fonts/patrick-hand';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { Kalam_400Regular } from '@expo-google-fonts/kalam';
import { CormorantGaramond_400Regular } from '@expo-google-fonts/cormorant-garamond';
import { Shrikhand_400Regular } from '@expo-google-fonts/shrikhand';
import { Lobster_400Regular } from '@expo-google-fonts/lobster';
import { RubikWetPaint_400Regular } from '@expo-google-fonts/rubik-wet-paint';
import { GloriaHallelujah_400Regular } from '@expo-google-fonts/gloria-hallelujah';
import { Fredoka_400Regular } from '@expo-google-fonts/fredoka';

export type FontKey =
  | 'pacifico' | 'comfortaa' | 'bubblegum' | 'chewy' | 'baloo' | 'caveat' | 'merienda' | 'patrick'
  | 'pixel' | 'kalam' | 'cormorant' | 'shrikhand' | 'lobster' | 'wetpaint' | 'gloria' | 'fredoka';

/** Bundled with the app (free, open-source Google Fonts), so they work offline. */
export const FONT_FILES: Record<FontKey, { family: string; file: number }> = {
  pacifico: { family: 'Pacifico_400Regular', file: Pacifico_400Regular },
  comfortaa: { family: 'Comfortaa_400Regular', file: Comfortaa_400Regular },
  bubblegum: { family: 'BubblegumSans_400Regular', file: BubblegumSans_400Regular },
  chewy: { family: 'Chewy_400Regular', file: Chewy_400Regular },
  baloo: { family: 'Baloo2_400Regular', file: Baloo2_400Regular },
  caveat: { family: 'Caveat_400Regular', file: Caveat_400Regular },
  merienda: { family: 'Merienda_400Regular', file: Merienda_400Regular },
  patrick: { family: 'PatrickHand_400Regular', file: PatrickHand_400Regular },
  pixel: { family: 'PressStart2P_400Regular', file: PressStart2P_400Regular },
  kalam: { family: 'Kalam_400Regular', file: Kalam_400Regular },
  cormorant: { family: 'CormorantGaramond_400Regular', file: CormorantGaramond_400Regular },
  shrikhand: { family: 'Shrikhand_400Regular', file: Shrikhand_400Regular },
  lobster: { family: 'Lobster_400Regular', file: Lobster_400Regular },
  wetpaint: { family: 'RubikWetPaint_400Regular', file: RubikWetPaint_400Regular },
  gloria: { family: 'GloriaHallelujah_400Regular', file: GloriaHallelujah_400Regular },
  fredoka: { family: 'Fredoka_400Regular', file: Fredoka_400Regular },
};

export const FONT_LABELS: Record<FontKey, string> = {
  pacifico: 'Pacifico', comfortaa: 'Comfortaa', bubblegum: 'Bubblegum', chewy: 'Chewy', baloo: 'Baloo',
  caveat: 'Caveat', merienda: 'Merienda', patrick: 'Patrick', pixel: 'Pixel', kalam: 'Kalam',
  cormorant: 'Cormorant', shrikhand: 'Shrikhand', lobster: 'Lobster', wetpaint: 'Wet paint',
  gloria: 'Gloria', fredoka: 'Fredoka',
};

/** Font file map for expo-font's useFonts. */
export function fontMap(): Record<string, number> {
  const m: Record<string, number> = {};
  for (const f of Object.values(FONT_FILES)) m[f.family] = f.file;
  return m;
}

let current: string | undefined;
export function setCurrentFont(key: FontKey | null | undefined) {
  current = key ? FONT_FILES[key]?.family : undefined;
}

let patched = false;
/** Makes every <Text> use the theme's font unless a style sets its own. Safe to call more than once. */
export function installTextFont() {
  if (patched) return;
  const T = Text as unknown as { render?: (props: any, ref: any) => any };
  const orig = T.render;
  if (typeof orig !== 'function') return;
  patched = true;
  T.render = function patchedRender(this: unknown, props: any, ref: any) {
    if (!current) return orig.call(this, props, ref);
    return orig.call(this, { ...props, style: [{ fontFamily: current }, props.style] }, ref);
  };
}
