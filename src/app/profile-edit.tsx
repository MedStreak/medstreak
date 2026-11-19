import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/ProfileBits';
import { Button, Field } from '../components/ui';
import { deleteAccount, signOutUser } from '../lib/auth';
import {
  AVATAR_SHAPES,
  CARD_STYLES,
  FAV_FIELDS,
  LIMITS,
  MOODS,
  PROFILE_COLORS,
  STICKERS,
  deleteMyCommunityData,
  pickPhoto,
  removeBanner,
  saveImages,
  saveProfile,
  useProfile,
  useProfileImages,
  useSocialUser,
} from '../lib/social';
import { colors, radius, themedStyles } from '../lib/theme';
import { useApp } from '../state/AppState';

const splitTags = (s: string) => s.split(',').map((t) => t.trim()).filter(Boolean);

export default function ProfileEdit() {
  const router = useRouter();
  const { streak, data } = useApp();
  const user = useSocialUser();
  const profile = useProfile(user.uid);
  const imgs = useProfileImages(user.uid);

  const [name, setName] = useState(data.settings.nickname || '');
  const [about, setAbout] = useState('');
  const [link, setLink] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [mood, setMood] = useState('');
  const [sticker, setSticker] = useState('🦋');
  const [color, setColor] = useState(PROFILE_COLORS[8]);
  const [cardStyle, setCardStyle] = useState('soft');
  const [shape, setShape] = useState('circle');
  const [interests, setInterests] = useState('');
  const [music, setMusic] = useState('');
  const [fav, setFav] = useState<Record<string, string>>({});
  const [thumb, setThumb] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded || profile === undefined) return;
    setLoaded(true);
    if (!profile) return;
    setName(profile.name);
    setAbout(profile.about);
    setLink(profile.link);
    setPronouns(profile.pronouns);
    setMood(profile.mood);
    setSticker(profile.sticker);
    setColor(profile.color);
    setCardStyle(profile.cardStyle);
    setShape(profile.shape);
    setInterests(profile.interests.join(', '));
    setMusic(profile.music.join(', '));
    setFav(profile.fav);
  }, [profile, loaded]);

  if (!user.uid) return <View style={styles.center}><Text style={styles.muted}>Sign in from the Cheers tab first.</Text></View>;
  const uid = user.uid;

  const photo = async (kind: 'avatar' | 'banner') => {
    try {
      const p = await pickPhoto(kind);
      if (!p) return;
      await saveImages(uid, kind === 'avatar' ? { avatar: p.full } : { banner: p.full });
      if (kind === 'avatar') setThumb(p.thumb);
      Alert.alert('Photo saved 📸', kind === 'avatar' ? 'Your profile photo is updated. Tap Save profile to refresh it on your posts.' : 'Your banner is updated.');
    } catch (e) {
      const m = e instanceof Error ? e.message : '';
      Alert.alert(
        'Couldn’t use that photo',
        m === 'permission' ? 'Allow photo access in your phone settings to pick a picture.' : m === 'toolarge' ? 'That picture is too detailed. Try a simpler one.' : 'Please try again.',
      );
    }
  };

  const save = async () => {
    if (!name.trim()) return Alert.alert('Pick a name', 'What should people call you?');
    setBusy(true);
    try {
      await saveProfile(
        uid,
        { name, about, link, pronouns, mood, sticker, color, cardStyle, shape, interests: splitTags(interests), music: splitTags(music), fav },
        { streak: streak.current, best: streak.best },
        thumb,
      );
      router.back();
    } catch {
      Alert.alert('Couldn’t save', 'Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const leave = () =>
    Alert.alert('Delete my account?', 'This removes your profile, photos and sign-in. Your medication data on this phone stays.', [
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMyCommunityData(uid);
          const r = await deleteAccount().catch(() => 'needs-recent-login' as const);
          if (r === 'needs-recent-login') Alert.alert('Sign in again first', 'For safety, sign out, sign back in, then delete again.');
          else router.back();
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={[styles.bannerBox, { backgroundColor: color }]}>
        {imgs?.banner ? <Image source={{ uri: imgs.banner }} style={StyleSheet.absoluteFill} resizeMode="cover" /> : <Text style={{ fontSize: 30 }}>{sticker} {sticker} {sticker}</Text>}
      </View>
      <View style={styles.row}>
        <Pressable onPress={() => photo('banner')} style={styles.pill}><Text style={styles.pillText}>🖼️ Change banner</Text></Pressable>
        {imgs?.banner ? <Pressable onPress={() => removeBanner(uid).catch(() => {})} style={styles.pill}><Text style={styles.pillText}>Remove</Text></Pressable> : null}
      </View>
      <View style={[styles.row, { alignItems: 'center', marginVertical: 10 }]}>
        <Avatar uri={imgs?.avatar} size={72} shape={shape} ring={color} name={name} />
        <Pressable onPress={() => photo('avatar')} style={styles.pill}><Text style={styles.pillText}>📷 Change photo</Text></Pressable>
      </View>

      <Field label="Name" value={name} onChangeText={setName} maxLength={LIMITS.name} placeholder="What should people call you?" />
      <Field label="Pronouns (optional)" value={pronouns} onChangeText={setPronouns} maxLength={LIMITS.pronouns} />
      <Field label="About me" value={about} onChangeText={setAbout} maxLength={LIMITS.about} multiline style={{ minHeight: 80, textAlignVertical: 'top' }} placeholder="A little about you ✨" />
      <Field label="One link to share (optional)" value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" maxLength={LIMITS.link} placeholder="your-site.com" />

      <Text style={styles.h}>Pinned sticker</Text>
      <View style={styles.wrap}>
        {[...STICKERS, ...data.settings.stickers].map((s) => (
          <Pressable key={s} onPress={() => setSticker(s)} style={[styles.sq, sticker === s && styles.sqOn]}><Text style={{ fontSize: 24 }}>{s}</Text></Pressable>
        ))}
      </View>

      <Text style={styles.h}>Profile color</Text>
      <View style={styles.wrap}>
        {PROFILE_COLORS.map((c) => (
          <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatch, { backgroundColor: c }, color === c && styles.swatchOn]} />
        ))}
      </View>

      <Text style={styles.h}>Card style</Text>
      <View style={styles.wrap}>
        {CARD_STYLES.map((s) => (
          <Pressable key={s.id} onPress={() => setCardStyle(s.id)} style={[styles.pill, cardStyle === s.id && { backgroundColor: colors.primary }]}>
            <Text style={[styles.pillText, cardStyle === s.id && { color: '#fff' }]}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.h}>Photo shape</Text>
      <View style={styles.wrap}>
        {AVATAR_SHAPES.map((s) => (
          <Pressable key={s.id} onPress={() => setShape(s.id)} style={[styles.pill, shape === s.id && { backgroundColor: colors.primary }]}>
            <Text style={[styles.pillText, shape === s.id && { color: '#fff' }]}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.h}>Current mood</Text>
      <View style={styles.wrap}>
        {MOODS.map((m) => (
          <Pressable key={m.id} onPress={() => setMood(mood === m.id ? '' : m.id)} style={[styles.sq, mood === m.id && styles.sqOn]}><Text style={{ fontSize: 24 }}>{m.emoji}</Text></Pressable>
        ))}
      </View>

      <Field label="Into (separate with commas)" value={interests} onChangeText={setInterests} placeholder="gardening, cozy games, thrifting" />
      <Field label="Music taste (separate with commas)" value={music} onChangeText={setMusic} placeholder="lo-fi, Fleetwood Mac, K-pop" />

      <Text style={styles.h}>Favorite things</Text>
      {FAV_FIELDS.map((f) => (
        <Field key={f.id} label={`${f.emoji} ${f.label}`} value={fav[f.id] ?? ''} maxLength={LIMITS.fav} onChangeText={(t) => setFav({ ...fav, [f.id]: t })} />
      ))}

      <Button title={busy ? 'Saving…' : 'Save profile'} disabled={busy} onPress={save} />
      <Button title="Sign out of Cheers" kind="secondary" style={{ marginTop: 10 }} onPress={() => signOutUser().then(() => router.back())} />
      <Pressable onPress={leave} style={{ marginTop: 18, alignItems: 'center' }}><Text style={{ color: colors.danger, fontWeight: '800' }}>Delete my account</Text></Pressable>
    </ScrollView>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
    muted: { color: colors.muted },
    container: { padding: 16, paddingBottom: 70 },
    bannerBox: { height: 100, borderRadius: radius.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    row: { flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
    h: { fontSize: 13, fontWeight: '800', color: colors.muted, textTransform: 'uppercase', marginTop: 6, marginBottom: 8 },
    pill: { backgroundColor: colors.chipBg, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16 },
    pillText: { fontWeight: '800', color: colors.text },
    sq: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' },
    sqOn: { borderWidth: 3, borderColor: colors.primary },
    swatch: { width: 36, height: 36, borderRadius: 18 },
    swatchOn: { borderWidth: 3, borderColor: colors.text },
  }),
);
