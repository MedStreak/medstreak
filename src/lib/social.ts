import { onAuthStateChanged } from 'firebase/auth';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { Linking } from 'react-native';
import { getFirebase } from './firebase';

/** Kudos people can give. Deliberately a bit unusual and cute. */
export const REACTIONS = [
  { id: 'unicorn', emoji: '🦄', label: 'Magical' },
  { id: 'butterfly', emoji: '🦋', label: 'Glowing up' },
  { id: 'mushroom', emoji: '🍄', label: 'Cozy vibes' },
  { id: 'teddy', emoji: '🧸', label: 'Big hug' },
  { id: 'planet', emoji: '🪐', label: 'Out of this world' },
  { id: 'nazar', emoji: '🧿', label: 'Protected' },
  { id: 'cherries', emoji: '🍒', label: 'So sweet' },
  { id: 'sunflower', emoji: '🌻', label: 'Sunshine' },
] as const;
export const reactionEmoji = (id: string) => REACTIONS.find((r) => r.id === id)?.emoji ?? '🦄';

/** Status moods: not the usual smileys. */
export const MOODS = [
  { id: 'otter', emoji: '🦦', label: 'Floating along' },
  { id: 'sloth', emoji: '🦥', label: 'Slow day' },
  { id: 'octopus', emoji: '🐙', label: 'Many hands, busy' },
  { id: 'juice', emoji: '🧃', label: 'Sipping and vibing' },
  { id: 'cactus', emoji: '🌵', label: 'A little prickly' },
  { id: 'kite', emoji: '🪁', label: 'Light as air' },
  { id: 'ufo', emoji: '🛸', label: 'Somewhere else' },
  { id: 'cupcake', emoji: '🧁', label: 'Treat day' },
  { id: 'mango', emoji: '🥭', label: 'Feeling juicy' },
  { id: 'hedgehog', emoji: '🦔', label: 'Curled up' },
  { id: 'mushroom', emoji: '🍄', label: 'Cozy' },
  { id: 'planet', emoji: '🪐', label: 'Orbiting' },
] as const;
export const moodEmoji = (id: string | null | undefined) => MOODS.find((m) => m.id === id)?.emoji ?? '';

/** Pinned sticker next to a name. */
export const STICKERS = ['🦋', '🍄', '🌙', '🪐', '🧸', '🦄', '🍒', '🌻', '🐙', '🦔', '🧿', '🌈', '🍉', '🪴', '🛸', '🧁'];

/** Colors for the profile. */
export const PROFILE_COLORS = ['#FF4D6D', '#FF7A45', '#F5B301', '#7BC62D', '#12A064', '#14B8A6', '#38A9F5', '#4F6BF2', '#8B5CF6', '#D946EF', '#FF2D95', '#6B7280'];

export const CARD_STYLES = [
  { id: 'soft', label: 'Soft' },
  { id: 'glow', label: 'Glow' },
  { id: 'paper', label: 'Paper' },
  { id: 'bold', label: 'Bold' },
] as const;
export const AVATAR_SHAPES = [
  { id: 'circle', label: 'Circle' },
  { id: 'squircle', label: 'Squircle' },
  { id: 'square', label: 'Square' },
] as const;

/** "Favorite things" fields, in display order. */
export const FAV_FIELDS = [
  { id: 'song', emoji: '🎵', label: 'On repeat' },
  { id: 'artist', emoji: '🎤', label: 'Favorite artist' },
  { id: 'show', emoji: '📺', label: 'Comfort show' },
  { id: 'game', emoji: '🎮', label: 'Favorite game' },
  { id: 'snack', emoji: '🍿', label: 'Favorite snack' },
  { id: 'comfort', emoji: '🧦', label: 'Comfort thing' },
  { id: 'place', emoji: '🗺️', label: 'Dream place' },
  { id: 'fun', emoji: '✨', label: 'Fun fact' },
] as const;

export const LIMITS = { name: 30, about: 240, link: 200, pronouns: 20, tag: 20, tags: 8, fav: 60, post: 200 };

export interface Profile {
  uid: string;
  name: string;
  about: string;
  link: string;
  pronouns: string;
  mood: string;
  sticker: string;
  color: string;
  cardStyle: string;
  shape: string;
  interests: string[];
  music: string[];
  fav: Record<string, string>;
  streak: number;
  best: number;
  thumb: string;
}

export interface ProfileImages {
  avatar: string;
  banner: string;
}

export interface Post {
  id: string;
  uid: string;
  name: string;
  thumb: string;
  sticker: string;
  text: string;
  mood: string;
  kind: 'status' | 'streak';
  days: number;
  createdAt: Timestamp | null;
  cheers: Record<string, string>;
  reports: Record<string, boolean>;
}

export const MAX_REPORTS_BEFORE_HIDE = 3;

const blankProfile = (uid: string): Profile => ({
  uid,
  name: '',
  about: '',
  link: '',
  pronouns: '',
  mood: '',
  sticker: '🦋',
  color: '#8B5CF6',
  cardStyle: 'soft',
  shape: 'circle',
  interests: [],
  music: [],
  fav: {},
  streak: 0,
  best: 0,
  thumb: '',
});

function toProfile(uid: string, v: Record<string, any>): Profile {
  const b = blankProfile(uid);
  const s = (x: any, n: number) => (typeof x === 'string' ? x.slice(0, n) : '');
  const list = (x: any) => (Array.isArray(x) ? x.filter((t) => typeof t === 'string').slice(0, LIMITS.tags) : []);
  const fav: Record<string, string> = {};
  for (const f of FAV_FIELDS) if (v.fav && typeof v.fav[f.id] === 'string' && v.fav[f.id]) fav[f.id] = v.fav[f.id].slice(0, LIMITS.fav);
  return {
    ...b,
    name: s(v.name, LIMITS.name),
    about: s(v.about, LIMITS.about),
    link: s(v.link, LIMITS.link),
    pronouns: s(v.pronouns, LIMITS.pronouns),
    mood: s(v.mood, 12),
    sticker: s(v.sticker, 8) || b.sticker,
    color: typeof v.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v.color) ? v.color : b.color,
    cardStyle: s(v.cardStyle, 10) || 'soft',
    shape: s(v.shape, 10) || 'circle',
    interests: list(v.interests),
    music: list(v.music),
    fav,
    streak: typeof v.streak === 'number' ? v.streak : 0,
    best: typeof v.best === 'number' ? v.best : 0,
    thumb: s(v.thumb, 8000),
  };
}

export interface SocialUser {
  uid: string | null;
  loading: boolean;
  configured: boolean;
}

/** Cheers needs a real verified account, never an anonymous session. */
export function useSocialUser(): SocialUser {
  const fb = useMemo(() => getFirebase(), []);
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!fb) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(fb.auth, (u) => {
      setUid(u && !u.isAnonymous && u.emailVerified ? u.uid : null);
      setLoading(false);
    });
  }, [fb]);
  return { uid, loading, configured: Boolean(fb) };
}

/** Live profile of anyone. Returns undefined while loading, null if they have none yet. */
export function useProfile(uid: string | null | undefined): Profile | null | undefined {
  const fb = useMemo(() => getFirebase(), []);
  const [p, setP] = useState<Profile | null | undefined>(undefined);
  useEffect(() => {
    if (!fb || !uid) {
      setP(uid ? undefined : null);
      return;
    }
    // A new uid means "loading", not "no profile": never let the previous null leak through.
    setP(undefined);
    return onSnapshot(
      doc(fb.db, 'profiles', uid),
      (snap) => setP(snap.exists() ? toProfile(uid, snap.data()) : null),
      () => setP(null),
    );
  }, [fb, uid]);
  return p;
}

export function useProfileImages(uid: string | null | undefined): ProfileImages | null {
  const fb = useMemo(() => getFirebase(), []);
  const [imgs, setImgs] = useState<ProfileImages | null>(null);
  useEffect(() => {
    if (!fb || !uid) return;
    return onSnapshot(
      doc(fb.db, 'profileImages', uid),
      (snap) => {
        const v = snap.data();
        setImgs(snap.exists() ? { avatar: typeof v?.avatar === 'string' ? v.avatar : '', banner: typeof v?.banner === 'string' ? v.banner : '' } : null);
      },
      () => setImgs(null),
    );
  }, [fb, uid]);
  return imgs;
}

/** The app creator's account id. Set once by hand in the Firebase console; nobody else can write it. */
export function useCreatorUid(): string | null {
  const fb = useMemo(() => getFirebase(), []);
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    if (!fb) return;
    return onSnapshot(
      doc(fb.db, 'config', 'creator'),
      (snap) => setUid(snap.exists() && typeof snap.data().uid === 'string' ? snap.data().uid : null),
      () => setUid(null),
    );
  }, [fb]);
  return uid;
}

export function usePosts(enabled: boolean): Post[] {
  const fb = useMemo(() => getFirebase(), []);
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    if (!fb || !enabled) return;
    return onSnapshot(
      query(collection(fb.db, 'posts'), orderBy('createdAt', 'desc'), limit(60)),
      (snap) =>
        setPosts(
          snap.docs.map((d) => {
            const v = d.data();
            return {
              id: d.id,
              uid: String(v.uid ?? ''),
              name: String(v.name ?? '').slice(0, LIMITS.name),
              thumb: typeof v.thumb === 'string' ? v.thumb.slice(0, 8000) : '',
              sticker: typeof v.sticker === 'string' ? v.sticker.slice(0, 8) : '',
              text: String(v.text ?? '').slice(0, LIMITS.post),
              mood: typeof v.mood === 'string' ? v.mood : '',
              kind: v.kind === 'streak' ? 'streak' : 'status',
              days: typeof v.days === 'number' ? v.days : 0,
              createdAt: v.createdAt ?? null,
              cheers: v.cheers && typeof v.cheers === 'object' ? v.cheers : {},
              reports: v.reports && typeof v.reports === 'object' ? v.reports : {},
            } as Post;
          }),
        ),
      () => {},
    );
  }, [fb, enabled]);
  return posts;
}

export async function saveProfile(uid: string, p: Omit<Profile, 'uid' | 'thumb' | 'streak' | 'best'>, stats: { streak: number; best: number }, thumb?: string): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error('offline');
  const fav: Record<string, string> = {};
  for (const f of FAV_FIELDS) {
    const t = (p.fav[f.id] ?? '').trim().slice(0, LIMITS.fav);
    if (t) fav[f.id] = t;
  }
  const clean = (arr: string[]) => arr.map((t) => t.trim().slice(0, LIMITS.tag)).filter(Boolean).slice(0, LIMITS.tags);
  const data: Record<string, unknown> = {
    name: p.name.trim().slice(0, LIMITS.name),
    about: p.about.trim().slice(0, LIMITS.about),
    link: safeLink(p.link),
    pronouns: p.pronouns.trim().slice(0, LIMITS.pronouns),
    mood: p.mood,
    sticker: p.sticker,
    color: p.color,
    cardStyle: p.cardStyle,
    shape: p.shape,
    interests: clean(p.interests),
    music: clean(p.music),
    fav,
    streak: stats.streak,
    best: stats.best,
    updatedAt: serverTimestamp(),
  };
  if (thumb !== undefined) data.thumb = thumb;
  await setDoc(doc(fb.db, 'profiles', uid), data, { merge: true });
}

/** Keeps the shown streak fresh without rewriting the whole profile. */
export async function syncStreak(uid: string, streak: number, best: number): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await updateDoc(doc(fb.db, 'profiles', uid), { streak, best, updatedAt: serverTimestamp() });
}

export async function saveImages(uid: string, part: { avatar?: string; banner?: string }): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error('offline');
  await setDoc(doc(fb.db, 'profileImages', uid), { ...part, updatedAt: serverTimestamp() }, { merge: true });
}

export async function removeBanner(uid: string): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await updateDoc(doc(fb.db, 'profileImages', uid), { banner: deleteField() });
}

/** Opens the picker, crops, shrinks hard (so it fits in free storage) and returns a data URI. */
export async function pickPhoto(kind: 'avatar' | 'banner'): Promise<{ full: string; thumb: string } | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('permission');
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: kind === 'avatar' ? [1, 1] : [3, 1],
    quality: 1,
  });
  if (res.canceled || !res.assets?.[0]) return null;
  const uri = res.assets[0].uri;
  const shrink = async (width: number, compress: number) => {
    const ctx = ImageManipulator.ImageManipulator.manipulate(uri);
    ctx.resize({ width });
    const img = await ctx.renderAsync();
    const out = await img.saveAsync({ format: ImageManipulator.SaveFormat.JPEG, compress, base64: true });
    return `data:image/jpeg;base64,${out.base64 ?? ''}`;
  };
  const full = kind === 'avatar' ? await shrink(360, 0.55) : await shrink(900, 0.5);
  const thumb = kind === 'avatar' ? await shrink(72, 0.5) : '';
  if (full.length > (kind === 'avatar' ? 140000 : 230000)) throw new Error('toolarge');
  return { full, thumb };
}

export function safeLink(raw: string): string {
  const t = raw.trim();
  if (!t) return '';
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    const u = new URL(withProto);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    return withProto.slice(0, LIMITS.link);
  } catch {
    return '';
  }
}

export function openLink(url: string) {
  Linking.openURL(url).catch(() => {});
}

export async function createPost(
  uid: string,
  p: { name: string; thumb: string; sticker: string },
  body: { text: string; mood: string; kind: 'status' | 'streak'; days?: number },
): Promise<void> {
  const fb = getFirebase();
  if (!fb) throw new Error('offline');
  await addDoc(collection(fb.db, 'posts'), {
    uid,
    name: p.name,
    thumb: p.thumb,
    sticker: p.sticker,
    text: body.text.slice(0, LIMITS.post),
    mood: body.mood,
    kind: body.kind,
    days: body.days ?? 0,
    createdAt: serverTimestamp(),
    cheers: {},
    reports: {},
  });
}

/** Toggle my reaction on a post. Tapping the same one again removes it. */
export async function cheerPost(postId: string, uid: string, reactionId: string, current: string | undefined): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await updateDoc(doc(fb.db, 'posts', postId), { [`cheers.${uid}`]: current === reactionId ? deleteField() : reactionId });
}

export async function reportPost(postId: string, uid: string): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await updateDoc(doc(fb.db, 'posts', postId), { [`reports.${uid}`]: true });
}

export async function deletePost(postId: string): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await deleteDoc(doc(fb.db, 'posts', postId));
}

/** Removes everything I put on the community side (used before deleting my account). */
export async function deleteMyCommunityData(uid: string): Promise<void> {
  const fb = getFirebase();
  if (!fb) return;
  await deleteDoc(doc(fb.db, 'profileImages', uid)).catch(() => {});
  await deleteDoc(doc(fb.db, 'profiles', uid)).catch(() => {});
}

export async function profileExists(uid: string): Promise<boolean> {
  const fb = getFirebase();
  if (!fb) return false;
  try {
    return (await getDoc(doc(fb.db, 'profiles', uid))).exists();
  } catch {
    return false;
  }
}

export function timeAgo(t: Timestamp | null): string {
  if (!t) return 'just now';
  const s = Math.max(0, Math.floor((Date.now() - t.toMillis()) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export const KOFI_URL = 'https://ko-fi.com/nessythelochness';
