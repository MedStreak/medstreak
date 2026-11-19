import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { appleSignInAvailable, signInWithApple, signInWithGoogle } from '../lib/auth';
import { openPrivacyPolicy, openTerms } from '../lib/legal';
import {
  LIMITS,
  MAX_REPORTS_BEFORE_HIDE,
  MOODS,
  REACTIONS,
  cheerPost,
  createPost,
  deletePost,
  moodEmoji,
  reportPost,
  syncStreak,
  timeAgo,
  useCreatorUid,
  usePosts,
  useProfile,
  useSocialUser,
  type Post,
} from '../lib/social';
import { colors, radius, themedStyles } from '../lib/theme';
import { useApp } from '../state/AppState';
import { Avatar, CreatorBadge } from './ProfileBits';
import { Button } from './ui';

const RULES = [
  'Be kind. No harassment, hate or bullying.',
  'Never share personal info (full name, address, phone, email) in your posts or profile.',
  'No medical advice. Talk to your doctor or pharmacist.',
  'Only upload photos you have the right to share. No nudity, violence or anything that would upset others.',
  'You can report any post or block anyone at any time. Posts with several reports are hidden automatically.',
];

/** The "Cheers" tab: post a status, cheer on other people's streaks, open profiles. No ads. */
export function Cheers() {
  const router = useRouter();
  const { data, updateSettings, blockUser, streak } = useApp();
  const user = useSocialUser();
  const me = useProfile(user.uid);
  const creatorUid = useCreatorUid();
  const posts = usePosts(Boolean(user.uid) && data.settings.acceptedChatTerms);
  const [text, setText] = useState('');
  const [mood, setMood] = useState('');
  const [busy, setBusy] = useState(false);
  const [signing, setSigning] = useState(false);
  const lastPost = useRef(0);
  const synced = useRef('');

  // Keep my shown streak current (only touches two small fields, and only when it changed).
  useEffect(() => {
    if (!user.uid || !me) return;
    const key = `${streak.current}|${streak.best}`;
    if (synced.current === key || (me.streak === streak.current && me.best === streak.best)) {
      synced.current = key;
      return;
    }
    synced.current = key;
    syncStreak(user.uid, streak.current, streak.best).catch(() => {});
  }, [user.uid, me, streak.current, streak.best]);

  const visible = useMemo(
    () =>
      posts.filter(
        (p) => !data.settings.blocked.includes(p.uid) && Object.keys(p.reports).length < MAX_REPORTS_BEFORE_HIDE,
      ),
    [posts, data.settings.blocked],
  );

  const doSignIn = async (fn: () => Promise<void>) => {
    setSigning(true);
    try {
      await fn();
    } catch {
      Alert.alert('Sign-in failed', 'Please try again.');
    } finally {
      setSigning(false);
    }
  };

  const submit = async (kind: 'status' | 'streak') => {
    if (!user.uid || !me) return;
    const body = kind === 'streak' ? `${streak.current}-day streak and counting!` : text.trim();
    if (!body) return;
    if (kind === 'streak' && streak.current < 1) return Alert.alert('No streak yet', 'Take your meds today and you’ll have one to show off. 🔥');
    if (Date.now() - lastPost.current < 4000) return;
    lastPost.current = Date.now();
    setBusy(true);
    try {
      await createPost(user.uid, { name: me.name, thumb: me.thumb, sticker: me.sticker }, { text: body, mood, kind, days: streak.current });
      setText('');
      setMood('');
    } catch {
      Alert.alert('Couldn’t post', 'Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const onMenu = (p: Post) => {
    const mine = p.uid === user.uid;
    const canRemove = mine || creatorUid === user.uid;
    const opts: { text: string; style?: 'destructive' | 'cancel'; onPress?: () => void }[] = [];
    if (canRemove) opts.push({ text: 'Delete post', style: 'destructive', onPress: () => deletePost(p.id).catch(() => Alert.alert('Couldn’t delete')) });
    if (!mine && user.uid) {
      opts.push({
        text: 'Report post',
        onPress: () => reportPost(p.id, user.uid as string).then(() => Alert.alert('Report received', 'Thank you for helping keep this a kind place.')).catch(() => {}),
      });
      opts.push({
        text: 'Block this person',
        style: 'destructive',
        onPress: () => {
          blockUser(p.uid);
          Alert.alert('Blocked', 'You won’t see their posts anymore.');
        },
      });
    }
    opts.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert(p.name || 'Post', 'What would you like to do?', opts);
  };

  if (!user.configured) {
    return (
      <View style={styles.gate}>
        <Text style={styles.big}>🫶</Text>
        <Text style={styles.gateTitle}>Cheers isn’t connected yet</Text>
        <Text style={styles.gateSub}>Add the Firebase keys (see the README) and restart to turn on cheering.</Text>
      </View>
    );
  }
  if (user.loading) return <View style={styles.gate}><Text style={styles.gateSub}>Loading…</Text></View>;

  if (!user.uid) {
    return (
      <View style={styles.gate}>
        <Text style={styles.big}>🦄</Text>
        <Text style={styles.gateTitle}>Cheer each other on!</Text>
        <Text style={styles.gateSub}>
          Sign in to share how you’re doing, send kudos on other people’s streaks and make your own profile. Your medications are never shared.
        </Text>
        <Button title="Continue with Google" disabled={signing} onPress={() => doSignIn(signInWithGoogle)} />
        {appleSignInAvailable && <Button title="Continue with Apple" kind="secondary" disabled={signing} style={{ marginTop: 10 }} onPress={() => doSignIn(signInWithApple)} />}
      </View>
    );
  }

  if (!data.settings.acceptedChatTerms) {
    return (
      <View style={styles.gate}>
        <Text style={styles.big}>📜</Text>
        <Text style={styles.gateTitle}>Community rules</Text>
        {RULES.map((r) => (
          <Text key={r} style={styles.rule}>• {r}</Text>
        ))}
        <View style={{ flexDirection: 'row', gap: 16, marginVertical: 10 }}>
          <Text style={styles.link} onPress={openTerms}>Terms</Text>
          <Text style={styles.link} onPress={openPrivacyPolicy}>Privacy</Text>
        </View>
        <Button title="I agree, let’s go" onPress={() => updateSettings({ acceptedChatTerms: true })} />
      </View>
    );
  }

  if (me === undefined) return <View style={styles.gate}><Text style={styles.gateSub}>Loading…</Text></View>;
  if (me === null || !me.name) {
    return (
      <View style={styles.gate}>
        <Text style={styles.big}>🪄</Text>
        <Text style={styles.gateTitle}>Make your profile first</Text>
        <Text style={styles.gateSub}>Pick a name, a photo, a banner and your favorite things. It takes a minute.</Text>
        <Button title="Create my profile" onPress={() => router.push('/profile-edit')} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        data={visible}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.composer}>
              <View style={styles.meRow}>
                <Pressable onPress={() => router.push({ pathname: '/profile', params: { uid: user.uid as string } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  <Avatar uri={me.thumb} size={38} shape={me.shape} ring={me.color} name={me.name} />
                  <View>
                    <Text style={styles.meName}>{me.name} {me.sticker}</Text>
                    <Text style={styles.meSub}>Tap to see your profile</Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => router.push('/profile-edit')} style={styles.editBtn}>
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
              </View>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="How’s your day going?"
                placeholderTextColor={colors.muted}
                maxLength={LIMITS.post}
                multiline
                style={styles.input}
              />
              <Text style={styles.moodLabel}>Today I’m feeling…</Text>
              <View style={styles.moodRow}>
                {MOODS.map((m) => (
                  <Pressable key={m.id} onPress={() => setMood(mood === m.id ? '' : m.id)} style={[styles.mood, mood === m.id && styles.moodOn]} accessibilityLabel={m.label}>
                    <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
                  </Pressable>
                ))}
              </View>
              {mood ? <Text style={styles.moodName}>{MOODS.find((m) => m.id === mood)?.label}</Text> : null}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <Button title="Post" disabled={busy || !text.trim()} onPress={() => submit('status')} style={{ flex: 1, paddingVertical: 11 }} />
                <Button title={`Share my streak 🔥 ${streak.current}`} kind="secondary" disabled={busy} onPress={() => submit('streak')} style={{ flex: 1.4, paddingVertical: 11 }} />
              </View>
            </View>
            <Text style={styles.feedTitle}>Fresh cheers</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.empty}>Nothing here yet. Be the first to post! 🌱</Text>}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            myUid={user.uid as string}
            isCreator={item.uid === creatorUid}
            onOpen={() => router.push({ pathname: '/profile', params: { uid: item.uid } })}
            onMenu={() => onMenu(item)}
          />
        )}
      />
    </KeyboardAvoidingView>
  );
}

function PostCard({ post, myUid, isCreator, onOpen, onMenu }: { post: Post; myUid: string; isCreator: boolean; onOpen: () => void; onMenu: () => void }) {
  const mine = post.cheers[myUid];
  const counts: Record<string, number> = {};
  Object.values(post.cheers).forEach((r) => (counts[r] = (counts[r] ?? 0) + 1));
  const total = Object.keys(post.cheers).length;
  return (
    <View style={[styles.post, post.kind === 'streak' && styles.postStreak]}>
      <View style={styles.postHead}>
        <Pressable onPress={onOpen} style={{ flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 }}>
          <Avatar uri={post.thumb} size={40} name={post.name} />
          <View style={{ flex: 1 }}>
            <Text style={styles.postName} numberOfLines={1}>{post.name} {post.sticker}</Text>
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <Text style={styles.time}>{timeAgo(post.createdAt)}</Text>
              {isCreator && <CreatorBadge />}
            </View>
          </View>
        </Pressable>
        {post.mood ? <Text style={{ fontSize: 24 }}>{moodEmoji(post.mood)}</Text> : null}
        <Pressable onPress={onMenu} hitSlop={10}><Text style={styles.more}>⋯</Text></Pressable>
      </View>
      {post.kind === 'streak' ? (
        <View style={styles.streakBox}>
          <Text style={{ fontSize: 34 }}>🔥</Text>
          <Text style={styles.streakNum}>{post.days} day streak</Text>
          <Text style={styles.streakSub}>{post.text}</Text>
        </View>
      ) : (
        <Text style={styles.postText}>{post.text}</Text>
      )}
      <View style={styles.reactRow}>
        {REACTIONS.map((r) => (
          <Pressable
            key={r.id}
            onPress={() => cheerPost(post.id, myUid, r.id, mine).catch(() => Alert.alert('Couldn’t send that cheer'))}
            style={[styles.react, mine === r.id && styles.reactOn]}
            accessibilityLabel={r.label}
          >
            <Text style={{ fontSize: 18 }}>{r.emoji}</Text>
            {counts[r.id] ? <Text style={styles.reactCount}>{counts[r.id]}</Text> : null}
          </Pressable>
        ))}
      </View>
      {total > 0 && <Text style={styles.cheerTotal}>{total} {total === 1 ? 'cheer' : 'cheers'} 🎉</Text>}
    </View>
  );
}

const styles = themedStyles(() =>
  StyleSheet.create({
    gate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
    big: { fontSize: 56 },
    gateTitle: { fontSize: 21, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: 6, marginBottom: 6 },
    gateSub: { color: colors.muted, textAlign: 'center', lineHeight: 21, marginBottom: 16 },
    rule: { color: colors.text, alignSelf: 'stretch', lineHeight: 21, marginBottom: 4 },
    link: { color: colors.primary, fontWeight: '800' },
    composer: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
    meRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    meName: { fontWeight: '800', color: colors.text, fontSize: 15 },
    meSub: { color: colors.muted, fontSize: 12 },
    editBtn: { backgroundColor: colors.chipBg, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 14 },
    editText: { fontWeight: '800', color: colors.text },
    input: { backgroundColor: colors.bg, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, padding: 12, minHeight: 64, fontSize: 16, color: colors.text, textAlignVertical: 'top' },
    moodLabel: { color: colors.muted, fontWeight: '700', fontSize: 12, marginTop: 10, marginBottom: 6, textTransform: 'uppercase' },
    moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    mood: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.chipBg, alignItems: 'center', justifyContent: 'center' },
    moodOn: { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.card },
    moodName: { color: colors.primary, fontWeight: '800', marginTop: 6 },
    feedTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 10 },
    empty: { color: colors.muted, textAlign: 'center', marginTop: 30 },
    post: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
    postStreak: { borderColor: colors.primary, borderWidth: 2 },
    postHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    postName: { fontWeight: '800', color: colors.text, fontSize: 15 },
    time: { color: colors.muted, fontSize: 12 },
    more: { fontSize: 24, color: colors.muted, fontWeight: '900', paddingHorizontal: 4 },
    postText: { color: colors.text, fontSize: 16, lineHeight: 23, marginTop: 10 },
    streakBox: { alignItems: 'center', backgroundColor: colors.chipBg, borderRadius: radius.md, padding: 14, marginTop: 10 },
    streakNum: { fontSize: 22, fontWeight: '900', color: colors.primaryDark },
    streakSub: { color: colors.muted, marginTop: 2 },
    reactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
    react: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.chipBg, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 10 },
    reactOn: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.primary },
    reactCount: { fontWeight: '800', color: colors.text, fontSize: 13 },
    cheerTotal: { color: colors.muted, fontSize: 12, marginTop: 8, fontWeight: '700' },
  }),
);
