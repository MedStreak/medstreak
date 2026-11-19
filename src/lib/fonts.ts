import React from 'react';
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
import { PermanentMarker_400Regular } from '@expo-google-fonts/permanent-marker';
import { Bungee_400Regular } from '@expo-google-fonts/bungee';
import { Monoton_400Regular } from '@expo-google-fonts/monoton';
import { Creepster_400Regular } from '@expo-google-fonts/creepster';
import { Bangers_400Regular } from '@expo-google-fonts/bangers';
import { Fascinate_400Regular } from '@expo-google-fonts/fascinate';
import { SigmarOne_400Regular } from '@expo-google-fonts/sigmar-one';
import { LilitaOne_400Regular } from '@expo-google-fonts/lilita-one';
import { RubikBubbles_400Regular } from '@expo-google-fonts/rubik-bubbles';
import { LuckiestGuy_400Regular } from '@expo-google-fonts/luckiest-guy';
import { TitanOne_400Regular } from '@expo-google-fonts/titan-one';
import { SpecialElite_400Regular } from '@expo-google-fonts/special-elite';
import { RockSalt_400Regular } from '@expo-google-fonts/rock-salt';
import { FrederickatheGreat_400Regular } from '@expo-google-fonts/fredericka-the-great';

export type FontKey =
  | 'pacifico' | 'comfortaa' | 'bubblegum' | 'chewy' | 'baloo' | 'caveat' | 'merienda' | 'patrick'
  | 'pixel' | 'kalam' | 'cormorant' | 'shrikhand' | 'lobster' | 'wetpaint' | 'gloria' | 'fredoka'
  | 'marker' | 'bungee' | 'monoton' | 'creepster' | 'bangers' | 'fascinate' | 'sigmar' | 'lilita' | 'rubikbubbles' | 'luckiest' | 'titan' | 'elite' | 'rocksalt' | 'fredericka';

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
  marker: { family: 'PermanentMarker_400Regular', file: PermanentMarker_400Regular },
  bungee: { family: 'Bungee_400Regular', file: Bungee_400Regular },
  monoton: { family: 'Monoton_400Regular', file: Monoton_400Regular },
  creepster: { family: 'Creepster_400Regular', file: Creepster_400Regular },
  bangers: { family: 'Bangers_400Regular', file: Bangers_400Regular },
  fascinate: { family: 'Fascinate_400Regular', file: Fascinate_400Regular },
  sigmar: { family: 'SigmarOne_400Regular', file: SigmarOne_400Regular },
  lilita: { family: 'LilitaOne_400Regular', file: LilitaOne_400Regular },
  rubikbubbles: { family: 'RubikBubbles_400Regular', file: RubikBubbles_400Regular },
  luckiest: { family: 'LuckiestGuy_400Regular', file: LuckiestGuy_400Regular },
  titan: { family: 'TitanOne_400Regular', file: TitanOne_400Regular },
  elite: { family: 'SpecialElite_400Regular', file: SpecialElite_400Regular },
  rocksalt: { family: 'RockSalt_400Regular', file: RockSalt_400Regular },
  fredericka: { family: 'FrederickatheGreat_400Regular', file: FrederickatheGreat_400Regular },
};

export const FONT_LABELS: Record<FontKey, string> = {
  pacifico: 'Pacifico', comfortaa: 'Comfortaa', bubblegum: 'Bubblegum', chewy: 'Chewy', baloo: 'Baloo',
  caveat: 'Caveat', merienda: 'Merienda', patrick: 'Patrick', pixel: 'Pixel', kalam: 'Kalam',
  cormorant: 'Cormorant', shrikhand: 'Shrikhand', lobster: 'Lobster', wetpaint: 'Wet paint',
  gloria: 'Gloria', fredoka: 'Fredoka',
  marker: 'Permanent Marker',
  bungee: 'Bungee',
  monoton: 'Monoton',
  creepster: 'Creepster',
  bangers: 'Bangers',
  fascinate: 'Fascinate',
  sigmar: 'Sigmar One',
  lilita: 'Lilita One',
  rubikbubbles: 'Rubik Bubbles',
  luckiest: 'Luckiest Guy',
  titan: 'Titan One',
  elite: 'Special Elite',
  rocksalt: 'Rock Salt',
  fredericka: 'Fredericka',
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
/**
 * Makes every <Text> use the theme's font unless a style sets its own.
 * React Native 0.8x builds Text as a plain function component (no .render), so we swap the module's
 * default export for a thin wrapper. `import { Text } from 'react-native'` reads that export lazily, so
 * every screen picks it up. Safe to call more than once.
 */
export function installTextFont() {
  if (patched) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native/Libraries/Text/Text') as { default: React.ComponentType<any> };
    const Orig = mod.default;
    if (!Orig) return;
    const Wrapped = (props: any) =>
      React.createElement(Orig, current ? { ...props, style: [{ fontFamily: current }, props.style] } : props);
    Wrapped.displayName = 'Text';
    mod.default = Wrapped as unknown as React.ComponentType<any>;
    patched = true;
  } catch {
    // If React Native ever moves this file, the app still works with the system font.
  }
}
