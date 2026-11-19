import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PARTICLES, PARTICLE_IDS } from '../../components/ThemeFx';
import { Card, SectionTitle } from '../../components/ui';
import { FONT_FILES, FONT_LABELS, type FontKey } from '../../lib/fonts';
import { ACCENTS, DEFAULT_CUSTOM, THEMES, colors, getTheme, radius, themedStyles } from '../../lib/theme';
import { useApp } from '../../state/AppState';

const BG_SWATCHES = ['#FFFFFF', '#FFE3EE', '#FFD6EC', '#FFEBD2', '#FFF3B0', '#E7F7B5', '#C9F7DE', '#CFEFFF', '#DDD0FF', '#F2E6C9', '#1E232B', '#10002B', '#0F2A18', '#183B2C'];
const TEXT_SWATCHES = ['#1F2430', '#4A1530', '#2B1B4D', '#0F3340', '#12382A', '#4A3A1A', '#FFFFFF', '#FFF35C', '#E5FFD1', '#7DF9FF'];
const TAB_NAMES = [
  { id: 'index', label: 'Today', def: '🏠' },
  { id: 'meds', label: 'Meds', def: '💊' },
  { id: 'calendar', label: 'History', def: '🗓️' },
  { id: 'goals', label: 'Goals', def: '🏆' },
  { id: 'chat', label: 'Cheers', def: '🦄' },
  { id: 'themes', label: 'Themes', def: '🎨' },
];
const TAB_EMOJIS = (
  '🏠 🏡 🛖 ⭐ 🌟 ✨ 💫 🔥 ⚡ 🌈 ☀️ 🌙 🌸 🌼 🌻 🌿 🍀 🍄 🌵 🌴 🌊 ❄️ 🍎 🍒 🍓 🍉 🍕 🍩 🧁 🍪 ☕ 🧋 ' +
  '💊 💉 🩹 🩺 🧬 🫀 🧠 🦷 💚 💙 💜 🧡 💛 ❤️ 🖤 🤍 💖 💝 🏆 🥇 🎯 🎮 🕹️ 🎸 🥁 🎧 🎵 🎤 🎨 🖌️ 📚 📝 ' +
  '🗓️ 📅 ⏰ ⏳ 🔔 🔑 🧭 🗺️ 🚀 🛸 🪐 🌍 ⚓ 🛟 🔧 🔨 ⚙️ 🛠️ 💎 👑 🎩 🧢 🕶️ 🦄 🐉 🦋 🐝 🐞 🐢 🦊 🐼 🐱 🐶 🐙 🦈 🐬 🦉 🐧 🦖 👾 🤖 👻 💀 ☮️ ✌️ 🧿 🪬 🔮 🎁 🎈 🎉'
).split(' ');

const SPEEDS = [
  { label: 'Slow', v: 0.6 },
  { label: 'Normal', v: 1 },
  { label: 'Fast', v: 1.8 },
];

const CORNERS = [
  { id: 'sharp', label: 'Sharp', r: 4 },
  { id: 'soft', label: 'Soft', r: 12 },
  { id: 'round', label: 'Bubbly', r: 22 },
];

export default function ThemesScreen() {
  const { data, updateSettings, streak } = useApp();
  const { theme: current, accent, corners, unlockedThemes, particle, customTheme } = data.settings;
  const ct = customTheme ?? DEFAULT_CUSTOM;
  const setCustom = (patch: Partial<typeof ct>) => {
    tap();
    updateSettings({ theme: 'custom', customTheme: { ...ct, ...patch } });
  };
  const tap = () => Haptics.selectionAsync().catch(() => {});
  const [pickTab, setPickTab] = React.useState('index');
  const tabIcons = data.settings.tabIcons ?? {};
  const setTabIcon = (id: string, emoji: string | null) => {
    tap();
    const next = { ...tabIcons };
    if (emoji) next[id] = emoji;
    else delete next[id];
    updateSettings({ tabIcons: next });
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
      <Text style={styles.lead}>Make MedStreak feel like yours. Everything saves automatically.</Text>

      <SectionTitle>Theme</SectionTitle>
      {THEMES.map((t) => {
        const selected = t.id === current;
        const locked = t.unlock !== undefined && !unlockedThemes.includes(t.id);
        return (
          <Pressable
            key={t.id}
            accessibilityRole="button"
            accessibilityLabel={`${t.name} theme${selected ? ', selected' : ''}`}
            onPress={() => {
              tap();
              if (locked) {
                Alert.alert('Locked 🔒', `Reach a ${t.unlock}-day streak to unlock ${t.name}. Your best so far is ${streak.best} days. You can do it!`);
                return;
              }
              updateSettings({ theme: t.id });
            }}
          >
            <Card style={[styles.card, selected && styles.cardSelected, locked && { opacity: 0.55 }]}>
              <View style={[styles.preview, { backgroundColor: t.colors.bg, borderColor: t.colors.border }]}>
                <View style={[styles.previewHero, { backgroundColor: t.colors.hero }]}>
                  <Text style={{ fontSize: 14 }}>{t.mascot}</Text>
                </View>
                <View style={[styles.previewCard, { backgroundColor: t.colors.card, borderColor: t.colors.border }]}>
                  <View style={[styles.previewDot, { backgroundColor: t.colors.primary }]} />
                  <View style={[styles.previewLine, { backgroundColor: t.colors.muted }]} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {t.emoji} {t.name}
                </Text>
                <Text style={styles.sub}>
                  {locked ? `🔒 Unlocks at a ${t.unlock}-day streak` : `${t.dark ? 'Dark mode' : 'Light'}${t.fx || t.particle ? ' · ✨ Animated' : ''}`}
                </Text>
              </View>
              {selected && <Text style={styles.check}>✓</Text>}
            </Card>
          </Pressable>
        );
      })}

      <SectionTitle>Particles</SectionTitle>
      <Text style={styles.sub}>Falling, rising or drifting things on top of any theme.</Text>
      <View style={styles.chipRow}>
        {[{ id: null as string | null, label: 'Theme default', icon: '🎨' }, { id: 'none', label: 'None', icon: '🚫' }, ...PARTICLE_IDS.map((id) => ({ id: id as string | null, label: PARTICLES[id].label, icon: PARTICLES[id].icon }))].map((o) => (
          <Pressable
            key={o.label}
            accessibilityRole="button"
            onPress={() => {
              tap();
              updateSettings({ particle: o.id });
            }}
            style={[styles.chip, particle === o.id && styles.chipOn]}
          >
            <Text style={[styles.chipText, particle === o.id && { color: '#fff' }]}>
              {o.icon} {o.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle>Make your own theme 🎨</SectionTitle>
      <Text style={styles.sub}>Pick anything below and it becomes your theme automatically.</Text>
      <Text style={styles.label}>Background</Text>
      <View style={styles.swatchRow}>
        {BG_SWATCHES.map((c) => (
          <Pressable key={c} accessibilityLabel={`Background ${c}`} onPress={() => setCustom({ bg: c })} style={[styles.swatch, styles.swatchBorder, { backgroundColor: c }, current === 'custom' && ct.bg === c && styles.swatchOn]} />
        ))}
      </View>
      <Text style={styles.label}>Buttons and highlights</Text>
      <View style={styles.swatchRow}>
        {ACCENTS.map((a) => (
          <Pressable key={a.id} accessibilityLabel={`Button color ${a.name}`} onPress={() => setCustom({ primary: a.color })} style={[styles.swatch, { backgroundColor: a.color }, current === 'custom' && ct.primary === a.color && styles.swatchOn]} />
        ))}
      </View>
      <Text style={styles.label}>Text</Text>
      <View style={styles.swatchRow}>
        {TEXT_SWATCHES.map((c) => (
          <Pressable key={c} accessibilityLabel={`Text ${c}`} onPress={() => setCustom({ text: c })} style={[styles.swatch, styles.swatchBorder, { backgroundColor: c }, current === 'custom' && ct.text === c && styles.swatchOn]} />
        ))}
      </View>
      <Text style={styles.label}>Font</Text>
      <View style={styles.chipRow}>
        {(Object.keys(FONT_LABELS) as FontKey[]).map((f) => (
          <Pressable key={f} onPress={() => setCustom({ font: f })} style={[styles.chip, current === 'custom' && ct.font === f && styles.chipOn]}>
            <Text style={[styles.chipText, { fontFamily: FONT_FILES[f].family }, current === 'custom' && ct.font === f && { color: '#fff' }]}>{FONT_LABELS[f]}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Tab bar icons</Text>
      <Text style={styles.sub}>Tap a tab, then pick any emoji for it. This works with every theme.</Text>
      <View style={styles.tabBarPreview}>
        {TAB_NAMES.map((t) => {
          const on = pickTab === t.id;
          const emoji = tabIcons[t.id] || (t.id === 'index' ? getTheme(current).mascot : t.def);
          return (
            <Pressable key={t.id} onPress={() => setPickTab(t.id)} style={[styles.tabPrev, on && styles.tabPrevOn]}>
              <Text style={{ fontSize: 24 }}>{emoji}</Text>
              <Text style={styles.tabPrevLabel}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.emojiGrid}>
        {TAB_EMOJIS.map((e) => (
          <Pressable key={e} onPress={() => setTabIcon(pickTab, e)} style={[styles.emojiCell, tabIcons[pickTab] === e && styles.emojiCellOn]}>
            <Text style={{ fontSize: 24 }}>{e}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable onPress={() => updateSettings({ tabIcons: {} })} style={[styles.chip, { alignSelf: 'flex-start', marginTop: 10 }]}>
        <Text style={styles.chipText}>Reset tab icons</Text>
      </Pressable>
      <Text style={styles.label}>Particle speed</Text>
      <View style={styles.chipRow}>
        {SPEEDS.map((o) => (
          <Pressable key={o.label} onPress={() => setCustom({ speed: o.v })} style={[styles.chip, current === 'custom' && ct.speed === o.v && styles.chipOn]}>
            <Text style={[styles.chipText, current === 'custom' && ct.speed === o.v && { color: '#fff' }]}>{o.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle>Accent color</SectionTitle>
      <Text style={styles.sub}>Tints buttons, tabs and your streak card on top of any theme.</Text>
      <View style={styles.swatchRow}>
        <Pressable
          onPress={() => {
            tap();
            updateSettings({ accent: null });
          }}
          style={[styles.autoChip, accent === null && styles.swatchOn]}
        >
          <Text style={styles.autoText}>Theme</Text>
        </Pressable>
        {ACCENTS.map((a) => (
          <Pressable
            key={a.id}
            accessibilityLabel={`${a.name} accent`}
            onPress={() => {
              tap();
              updateSettings({ accent: a.id });
            }}
            style={[styles.swatch, { backgroundColor: a.color }, accent === a.id && styles.swatchOn]}
          />
        ))}
      </View>

      <SectionTitle>Corners</SectionTitle>
      <View style={styles.cornerRow}>
        {CORNERS.map((c) => {
          const on = corners === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => {
                tap();
                updateSettings({ corners: c.id });
              }}
              style={[styles.cornerBox, { borderRadius: c.r }, on && styles.cornerOn]}
            >
              <Text style={[styles.cornerText, on && { color: '#fff' }]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    content: { padding: 16, paddingBottom: 48 },
    lead: { color: colors.muted, fontSize: 15, lineHeight: 21, marginBottom: 6 },
    card: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: colors.border },
    cardSelected: { borderColor: colors.primary },
    preview: { width: 92, height: 62, borderRadius: 12, borderWidth: 1, padding: 6, gap: 4 },
    previewHero: { height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    previewCard: { flex: 1, borderRadius: 6, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 4 },
    previewDot: { width: 8, height: 8, borderRadius: 4 },
    previewLine: { flex: 1, height: 3, borderRadius: 2, opacity: 0.5 },
    name: { fontSize: 17, fontWeight: '800', color: colors.text },
    sub: { color: colors.muted, marginTop: 2 },
    check: { fontSize: 22, color: colors.primary, fontWeight: '900' },
    swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
    swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: 'transparent' },
    swatchOn: { borderColor: colors.text },
    autoChip: { height: 40, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
    autoText: { fontWeight: '800', color: colors.text },
    label: { fontWeight: '800', color: colors.text, marginTop: 14 },
    swatchBorder: { borderColor: colors.border },
    tabBarPreview: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, marginTop: 10 },
    tabPrev: { alignItems: 'center', paddingVertical: 4, paddingHorizontal: 6, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
    tabPrevOn: { borderColor: colors.primary, backgroundColor: colors.chipBg },
    tabPrevLabel: { fontSize: 10, color: colors.muted, fontWeight: '700' },
    emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
    emojiCell: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
    emojiCellOn: { borderColor: colors.primary },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
    chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.chipBg },
    chipOn: { backgroundColor: colors.primary },
    chipText: { fontWeight: '700', color: colors.text },
    cornerRow: { flexDirection: 'row', gap: 10 },
    cornerBox: { flex: 1, paddingVertical: 16, alignItems: 'center', backgroundColor: colors.chipBg },
    cornerOn: { backgroundColor: colors.primary },
    cornerText: { fontWeight: '800', color: colors.text },
  }),
);
