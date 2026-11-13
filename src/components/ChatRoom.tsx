import { onAuthStateChanged } from 'firebase/auth';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appleSignInAvailable, deleteAccount, signInWithApple, signInWithGoogle, signOutUser } from '../lib/auth';
import { getFirebase } from '../lib/firebase';
import { openPrivacyPolicy, openTerms } from '../lib/legal';
import { colors, radius, themedStyles } from '../lib/theme';
import { useApp } from '../state/AppState';
import { Button, Field } from './ui';

interface Msg {
  id: string;
  uid: string;
  /** Opaque, permanent id of the person (not their email). Used for blocking and reports. */
  key: string;
  nickname: string;
  text: string;
  createdAt: Timestamp | null;
  hidden: boolean;
}

const REPORT_REASONS = [
  { id: 'harassment', label: 'Harassment or bullying' },
  { id: 'hate', label: 'Hate speech' },
  { id: 'sexual', label: 'Sexual or inappropriate' },
  { id: 'threats', label: 'Threats or violence' },
  { id: 'spam', label: 'Spam or scams' },
  { id: 'other', label: 'Something else' },
] as const;

const ONLINE_WINDOW_MS = 90_000;
const HEARTBEAT_MS = 30_000;
const MAX_LEN = 400;
const MIN_SEND_GAP_MS = 1500;

const RULES = [
  'Be kind. No harassment, hate or bullying.',
  'Never share personal info (full name, address, phone, email).',
  'Don’t give or ask for medical advice. Talk to your doctor or pharmacist.',
  'Never share which medications you take if you’d rather keep it private.',
  'You can report any message or block any user at any time. One report = a warning. A second report from a different member = a permanent chat ban.',
];

export function ChatRoom() {
  const { data, updateSettings, blockUser } = useApp();
  const { settings } = data;
  const insets = useSafeAreaInsets();
  const fb = useMemo(() => getFirebase(), []);

  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [myKey, setMyKey] = useState<string | null>(null);
  const [level, setLevel] = useState(0); // 0 ok, 1 warned, 2 banned
  const [messages, setMessages] = useState<Msg[]>([]);
  const [online, setOnline] = useState(0);
  const [text, setText] = useState('');
  const [nick, setNick] = useState(settings.nickname);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [reporting, setReporting] = useState<Msg | null>(null);
  const lastSent = useRef(0);

  // Chat requires a real, verified Google/Apple account. Anonymous sessions count as signed out.
  useEffect(() => {
    if (!fb) return;
    return onAuthStateChanged(fb.auth, (u) => {
      const ok = u && !u.isAnonymous && u.emailVerified && u.email;
      setUid(ok ? u.uid : null);
      setEmail(ok ? (u.email as string) : null);
      if (!ok) {
        setMyKey(null);
        setLevel(0);
      }
      setAuthLoading(false);
    });
  }, [fb]);

  // Find / create my membership. My "key" is the uid of the first account ever made with my email,
  // so a deleted-and-recreated account keeps the same key (and any warning or ban with it).
  useEffect(() => {
    if (!fb || !uid || !email) return;
    let cancelled = false;
    (async () => {
      try {
        const mref = doc(fb.db, 'members', uid);
        const existing = await getDoc(mref);
        if (existing.exists()) {
          if (!cancelled) setMyKey(existing.data().firstUid as string);
          return;
        }
        const owner = await getDoc(doc(fb.db, 'emailOwners', email));
        const b = writeBatch(fb.db);
        let firstUid = uid;
        if (owner.exists()) {
          firstUid = owner.data().uid as string;
          b.set(mref, { email, firstUid, createdAt: serverTimestamp() });
        } else {
          b.set(mref, { email, firstUid, createdAt: serverTimestamp() });
          b.set(doc(fb.db, 'emailOwners', email), { uid });
        }
        await b.commit();
        if (!cancelled) setMyKey(firstUid);
      } catch {
        Alert.alert('Couldn’t set up chat', 'Check your connection and reopen this tab.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fb, uid, email]);

  // my warning / ban status (only I can read it)
  useEffect(() => {
    if (!fb || !myKey) return;
    return onSnapshot(
      doc(fb.db, 'status', myKey),
      (snap) => setLevel(snap.exists() ? (snap.data().level as number) : 0),
      () => {},
    );
  }, [fb, myKey]);

  const ready = Boolean(fb && uid && myKey && level < 2 && settings.acceptedChatTerms && settings.nickname);

  // live messages
  useEffect(() => {
    if (!fb || !ready) return;
    const q = query(collection(fb.db, 'lobby'), orderBy('createdAt', 'desc'), limit(60));
    return onSnapshot(
      q,
      (snap) =>
        setMessages(
          snap.docs.map((d) => {
            const v = d.data();
            return {
              id: d.id,
              uid: v.uid,
              key: v.key,
              nickname: v.nickname,
              text: v.text,
              createdAt: v.createdAt ?? null,
              hidden: v.hidden === true,
            };
          }),
        ),
      () => {},
    );
  }, [fb, ready]);

  // presence: heartbeat + count of recently-seen users
  useEffect(() => {
    if (!fb || !ready || !uid) return;
    const beat = () =>
      setDoc(doc(fb.db, 'presence', uid), { nickname: settings.nickname, lastSeen: serverTimestamp() }).catch(() => {});
    beat();
    const t = setInterval(beat, HEARTBEAT_MS);
    let latest: { lastSeen: Timestamp | null }[] = [];
    const recount = () =>
      setOnline(latest.filter((p) => p.lastSeen && Date.now() - p.lastSeen.toMillis() < ONLINE_WINDOW_MS).length);
    const unsub = onSnapshot(
      query(collection(fb.db, 'presence'), orderBy('lastSeen', 'desc'), limit(200)),
      (snap) => {
        latest = snap.docs.map((d) => ({ lastSeen: (d.data().lastSeen as Timestamp) ?? null }));
        recount();
      },
      () => {},
    );
    const tick = setInterval(recount, 15_000);
    return () => {
      clearInterval(t);
      clearInterval(tick);
      unsub();
    };
  }, [fb, ready, uid, settings.nickname]);

  const visible = messages.filter(
    (m) => !m.hidden && !settings.blocked.includes(m.key) && !reportedIds.includes(m.id),
  );

  const doSignIn = async (fn: () => Promise<void>) => {
    setSigningIn(true);
    try {
      await fn();
    } catch {
      Alert.alert('Sign-in failed', 'Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const send = async () => {
    const body = text.trim();
    if (!fb || !uid || !myKey || !body) return;
    if (Date.now() - lastSent.current < MIN_SEND_GAP_MS) return;
    lastSent.current = Date.now();
    setText('');
    try {
      await addDoc(collection(fb.db, 'lobby'), {
        uid,
        key: myKey,
        nickname: settings.nickname,
        text: body.slice(0, MAX_LEN),
        createdAt: serverTimestamp(),
      });
    } catch {
      setText(body);
      Alert.alert('Couldn’t send', 'Check your connection and try again.');
    }
  };

  /**
   * Report = strike + status change + hide message, all in ONE atomic batch that the security rules
   * check. 1st strike for this person -> warning. A 2nd strike from a DIFFERENT member -> ban.
   */
  const submitReport = async (m: Msg, reason: (typeof REPORT_REASONS)[number]['id']) => {
    setReporting(null);
    if (!fb || !myKey) return;
    const attempt = async (slot: 1 | 2) => {
      const b = writeBatch(fb.db);
      b.set(doc(fb.db, 'strikes', `${m.key}_${slot}`), {
        targetKey: m.key,
        reporterKey: myKey,
        messageId: m.id,
        reason,
        createdAt: serverTimestamp(),
      });
      if (slot === 1) b.set(doc(fb.db, 'status', m.key), { level: 1 });
      else b.update(doc(fb.db, 'status', m.key), { level: 2 });
      b.update(doc(fb.db, 'lobby', m.id), { hidden: true });
      await b.commit();
    };
    let done = false;
    try {
      await attempt(1);
      done = true;
    } catch {
      try {
        await attempt(2);
        done = true;
      } catch {
        done = false;
      }
    }
    setReportedIds((ids) => [...ids, m.id]);
    Alert.alert(
      done ? 'Report received' : 'Already handled',
      done
        ? 'Thank you for helping keep this a safe space. The message has been hidden.'
        : 'You’ve already reported this person, or they’ve already been actioned. The message is hidden for you.',
    );
  };

  const onLongPress = (m: Msg) => {
    if (m.key === myKey) return;
    Alert.alert(m.nickname, 'What would you like to do?', [
      { text: 'Report message', onPress: () => setReporting(m) },
      {
        text: 'Block user',
        style: 'destructive',
        onPress: () => {
          blockUser(m.key);
          Alert.alert('Blocked', 'You won’t see their messages anymore.');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ---- must be signed in ----
  if (authLoading) return <View style={styles.gate}><Text style={styles.gateSub}>Loading…</Text></View>;
  if (!uid) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateTitle}>Sign in to join the chat 🔐</Text>
        <Text style={styles.gateSub}>
          To keep the community safe, chat requires a verified account. Your medications and streaks are never shared.
        </Text>
        <Button title="Continue with Google" disabled={signingIn} onPress={() => doSignIn(signInWithGoogle)} />
        {appleSignInAvailable && (
          <Button title="Continue with Apple" kind="secondary" disabled={signingIn} onPress={() => doSignIn(signInWithApple)} style={{ marginTop: 10 }} />
        )}
        <Text style={[styles.gateSub, { marginTop: 16 }]}>By signing in you agree to the</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          <Pressable onPress={openPrivacyPolicy} hitSlop={8}>
            <Text style={[styles.gateSub, { textDecorationLine: 'underline' }]}>privacy policy</Text>
          </Pressable>
          <Text style={styles.gateSub}>and</Text>
          <Pressable onPress={openTerms} hitSlop={8}>
            <Text style={[styles.gateSub, { textDecorationLine: 'underline' }]}>terms</Text>
          </Pressable>
        </View>
      </View>
    );
  }
  if (!myKey) {
    return <View style={styles.gate}><Text style={styles.gateSub}>Setting up your account…</Text></View>;
  }

  // ---- banned ----
  if (level >= 2) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateTitle}>Chat access removed 🚫</Text>
        <Text style={styles.gateSub}>
          Two different members reported your messages for breaking the community rules, so chat has been permanently
          turned off for you. This applies to you personally, not just this account. Your medication tracking, streaks and
          goals still work as normal.
        </Text>
        <Button title="Sign out" kind="secondary" onPress={() => signOutUser()} />
      </View>
    );
  }

  // ---- rules + nickname ----
  if (!settings.acceptedChatTerms || !settings.nickname) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateTitle}>Welcome to the community 💬</Text>
        <Text style={styles.gateSub}>Chat with other people who are working on their daily habits.</Text>
        <View style={styles.rules}>
          {RULES.map((r) => (
            <Text key={r} style={styles.rule}>• {r}</Text>
          ))}
        </View>
        <Pressable onPress={openPrivacyPolicy} hitSlop={8}>
          <Text style={[styles.rule, { textDecorationLine: 'underline', marginBottom: 6 }]}>Read the privacy policy</Text>
        </Pressable>
        <Pressable onPress={openTerms} hitSlop={8}>
          <Text style={[styles.rule, { textDecorationLine: 'underline', marginBottom: 12 }]}>Read the terms of service</Text>
        </Pressable>
        <Field label="Pick a nickname" value={nick} onChangeText={setNick} maxLength={20} placeholder="e.g. SunnyStreak" autoCapitalize="none" />
        <Button
          title="I agree. Join the chat"
          disabled={nick.trim().length < 2}
          onPress={() => updateSettings({ nickname: nick.trim(), acceptedChatTerms: true })}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Modal transparent animationType="fade" visible={level === 1 && !settings.warnAcked} onRequestClose={() => updateSettings({ warnAcked: true })}>
        <View style={styles.warnBackdrop}>
          <View style={styles.warnCard}>
            <Text style={styles.warnEmoji}>⚠️</Text>
            <Text style={styles.warnTitle}>Warning about your behavior</Text>
            <Text style={styles.warnText}>
              A member reported one of your messages and it was removed. This is your one warning. If another member
              reports you, you will be permanently banned from chat.
            </Text>
            <Button title="I understand" onPress={() => updateSettings({ warnAcked: true })} />
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.onlineDot} />
        <Text style={styles.headerText}>{Math.max(online, 1)} online · Long-press a message to report/block</Text>
        <Pressable
          onPress={() =>
            Alert.alert('Account', settings.nickname, [
              { text: 'Privacy policy', onPress: () => openPrivacyPolicy() },
              { text: 'Terms of service', onPress: () => openTerms() },
              { text: 'Sign out', onPress: () => signOutUser() },
              {
                text: 'Delete account',
                style: 'destructive',
                onPress: async () => {
                  try {
                    const r = await deleteAccount();
                    if (r === 'needs-recent-login') Alert.alert('Please sign in again', 'Sign out, sign in again, then retry deleting.');
                  } catch {
                    Alert.alert('Couldn’t delete', 'Please try again.');
                  }
                },
              },
              { text: 'Cancel', style: 'cancel' },
            ])
          }
          hitSlop={8}
        >
          <Text style={[styles.headerText, { textDecorationLine: 'underline' }]}>Account</Text>
        </Pressable>
      </View>

      <FlatList
        data={visible}
        inverted
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet. Say hi! 👋</Text>}
        renderItem={({ item }) => {
          const mine = item.uid === uid;
          return (
            <Pressable onLongPress={() => onLongPress(item)} delayLongPress={350}>
              <View style={[styles.bubbleWrap, mine && { alignItems: 'flex-end' }]}>
                {!mine && <Text style={styles.nick}>{item.nickname}</Text>}
                <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                  <Text style={[styles.msg, mine && { color: '#fff' }]}>{item.text}</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Say something kind…"
          placeholderTextColor={colors.muted}
          maxLength={MAX_LEN}
          multiline
        />
        <Pressable style={[styles.send, !text.trim() && { opacity: 0.4 }]} onPress={send} disabled={!text.trim()}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>

      <Modal transparent animationType="slide" visible={reporting !== null} onRequestClose={() => setReporting(null)}>
        <View style={styles.warnBackdrop}>
          <View style={[styles.warnCard, { alignSelf: 'stretch' }]}>
            <Text style={styles.warnTitle}>Report this message</Text>
            <Text style={styles.warnText}>Why are you reporting it?</Text>
            {REPORT_REASONS.map((r) => (
              <Pressable key={r.id} style={styles.reason} onPress={() => reporting && submitReport(reporting, r.id)}>
                <Text style={styles.reasonText}>{r.label}</Text>
              </Pressable>
            ))}
            <Button title="Cancel" kind="secondary" onPress={() => setReporting(null)} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = themedStyles(() => StyleSheet.create({
  gate: { flex: 1, padding: 24, justifyContent: 'center' },
  gateTitle: { fontSize: 24, fontWeight: '800', color: colors.text, textAlign: 'center' },
  gateSub: { color: colors.muted, textAlign: 'center', marginTop: 6, marginBottom: 14, lineHeight: 21 },
  rules: { backgroundColor: colors.chipBg, borderRadius: radius.md, padding: 14, marginBottom: 18 },
  rule: { color: colors.text, marginVertical: 3, lineHeight: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.chipBg },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success },
  headerText: { color: colors.text, fontSize: 12, fontWeight: '600', flexShrink: 1 },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 40, transform: [{ scaleY: -1 }] },
  bubbleWrap: { marginVertical: 4, alignItems: 'flex-start' },
  nick: { fontSize: 12, color: colors.muted, marginLeft: 8, marginBottom: 2, fontWeight: '700' },
  bubble: { maxWidth: '82%', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18 },
  mine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  theirs: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  msg: { fontSize: 15, color: colors.text },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg },
  input: { flex: 1, maxHeight: 110, backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: colors.text },
  send: { backgroundColor: colors.primary, paddingVertical: 11, paddingHorizontal: 18, borderRadius: 999 },
  sendText: { color: '#fff', fontWeight: '800' },
  warnBackdrop: { flex: 1, backgroundColor: 'rgba(43,34,51,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  warnCard: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 24, width: '100%', maxWidth: 380 },
  warnEmoji: { fontSize: 44, textAlign: 'center' },
  warnTitle: { fontSize: 20, fontWeight: '800', color: colors.text, textAlign: 'center', marginBottom: 8 },
  warnText: { color: colors.muted, textAlign: 'center', lineHeight: 21, marginBottom: 16 },
  reason: { backgroundColor: colors.chipBg, borderRadius: radius.sm, padding: 14, marginBottom: 8 },
  reasonText: { color: colors.text, fontWeight: '700' },
}));
