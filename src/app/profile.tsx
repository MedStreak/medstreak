import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, CreatorBadge, KofiCard } from '../components/ProfileBits';
import { FAV_FIELDS, moodEmoji, MOODS, openLink, safeLink, useCreatorUid, useProfile, useProfileImages, useSocialUser } from '../lib/social';
import { colors, radius, themedStyles } from '../lib/theme';

export default function ProfileScreen() {
  const { uid } = useLocalSearchParams<{ uid?: string }>();
  const router = useRouter();
  const user = useSocialUser();
  const profile = useProfile(uid);
  const imgs = useProfileImages(uid);
  const creatorUid = useCreatorUid();

  if (profile === undefined) return <View style={styles.center}><Text style={styles.muted}>Loading…</Text></View>;
  if (!profile) return <View style={styles.center}><Text style={styles.big}>🫥</Text><Text style={styles.muted}>This profile isn’t available.</Text></View>;

  const mine = user.uid === uid;
  const isCreator = Boolean(uid) && uid === creatorUid;
  const accent = profile.color;
  const cs = profile.cardStyle;
  const cardExtra =
    cs === 'glow' ? { borderColor: accent, borderWidth: 2, shadowColor: accent, shadowOpacity: 0.6, shadowRadius: 12, elevation: 6 } :
    cs === 'paper' ? { borderColor: colors.border, borderWidth: 1, borderStyle: 'dashed' as const } :
    cs === 'bold' ? { borderColor: accent, borderWidth: 3 } :
    { borderColor: colors.border, borderWidth: 1 };
  const link = safeLink(profile.link);
  const mood = MOODS.find((m) => m.id === profile.mood);
  const favs = FAV_FIELDS.filter((f) => profile.fav[f.id]);

  const goLink = () =>
    Alert.alert('Open this link?', `${link}\n\nIt opens outside MedStreak. Only continue if you trust it.`, [
      { text: 'Open', onPress: () => openLink(link) },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>
      <View style={[styles.banner, { backgroundColor: accent }]}>
        {imgs?.banner ? <Image source={{ uri: imgs.banner }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <Text style={styles.bannerEmoji}>{profile.sticker} {profile.sticker} {profile.sticker}</Text>}
      </View>
      <View style={styles.pad}>
        <View style={styles.avatarWrap}>
          <Avatar uri={imgs?.avatar || profile.thumb} size={96} shape={profile.shape} ring={colors.bg} name={profile.name} />
        </View>
        <View style={[styles.card, cardExtra]}>
          <Text style={styles.name}>{profile.name} {profile.sticker}</Text>
          {profile.pronouns ? <Text style={styles.muted}>{profile.pronouns}</Text> : null}
          {isCreator && <View style={{ marginTop: 6 }}><CreatorBadge big /></View>}
          <View style={styles.statRow}>
            <View style={[styles.stat, { borderColor: accent }]}><Text style={styles.statNum}>🔥 {profile.streak}</Text><Text style={styles.statLbl}>day streak</Text></View>
            <View style={[styles.stat, { borderColor: accent }]}><Text style={styles.statNum}>🏅 {profile.best}</Text><Text style={styles.statLbl}>best</Text></View>
            {mood ? <View style={[styles.stat, { borderColor: accent }]}><Text style={styles.statNum}>{moodEmoji(profile.mood)}</Text><Text style={styles.statLbl}>{mood.label}</Text></View> : null}
          </View>
          {profile.about ? <Text style={styles.about}>{profile.about}</Text> : null}
          {link ? (
            <Pressable onPress={goLink} style={[styles.linkBtn, { backgroundColor: accent }]}>
              <Text style={styles.linkText} numberOfLines={1}>🔗 {link.replace(/^https?:\/\//, '')}</Text>
            </Pressable>
          ) : null}
        </View>

        {profile.interests.length > 0 && (
          <View style={[styles.card, cardExtra]}>
            <Text style={styles.h}>🌈 Into</Text>
            <View style={styles.chips}>{profile.interests.map((t) => <Text key={t} style={[styles.chip, { borderColor: accent }]}>{t}</Text>)}</View>
          </View>
        )}
        {profile.music.length > 0 && (
          <View style={[styles.card, cardExtra]}>
            <Text style={styles.h}>🎧 Music taste</Text>
            <View style={styles.chips}>{profile.music.map((t) => <Text key={t} style={[styles.chip, { borderColor: accent }]}>{t}</Text>)}</View>
          </View>
        )}
        {favs.length > 0 && (
          <View style={[styles.card, cardExtra]}>
            <Text style={styles.h}>💖 Favorite things</Text>
            {favs.map((f) => (
              <View key={f.id} style={styles.favRow}>
                <Text style={styles.favLabel}>{f.emoji} {f.label}</Text>
                <Text style={styles.favVal}>{profile.fav[f.id]}</Text>
              </View>
            ))}
          </View>
        )}

        {isCreator && <KofiCard />}
        {mine && <Pressable onPress={() => router.push('/profile-edit')} style={styles.edit}><Text style={styles.editText}>✏️ Edit my profile</Text></Pressable>}
      </View>
    </ScrollView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
    big: { fontSize: 50 },
    muted: { color: colors.muted },
    banner: { height: 130, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    bannerEmoji: { fontSize: 34, opacity: 0.85 },
    pad: { paddingHorizontal: 14 },
    avatarWrap: { marginTop: -48, marginBottom: -30, zIndex: 2, alignSelf: 'flex-start', marginLeft: 12 },
    card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, marginBottom: 12, paddingTop: 36 },
    name: { fontSize: 24, fontWeight: '900', color: colors.text },
    statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
    stat: { borderWidth: 2, borderRadius: radius.sm, paddingVertical: 6, paddingHorizontal: 12, alignItems: 'center' },
    statNum: { fontSize: 18, fontWeight: '900', color: colors.text },
    statLbl: { fontSize: 11, color: colors.muted, fontWeight: '700' },
    about: { color: colors.text, fontSize: 16, lineHeight: 23, marginTop: 14 },
    linkBtn: { marginTop: 14, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, alignSelf: 'flex-start', maxWidth: '100%' },
    linkText: { color: '#fff', fontWeight: '800' },
    h: { fontSize: 16, fontWeight: '900', color: colors.text, marginBottom: 8 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { borderWidth: 2, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12, color: colors.text, fontWeight: '700', overflow: 'hidden' },
    favRow: { paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    favLabel: { color: colors.muted, fontWeight: '700', fontSize: 12 },
    favVal: { color: colors.text, fontSize: 16, fontWeight: '700' },
    edit: { backgroundColor: colors.chipBg, borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginTop: 6 },
    editText: { fontWeight: '800', color: colors.text },
  }),
);
