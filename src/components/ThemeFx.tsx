import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import type { ThemeDef } from '../lib/theme';

type Fx = NonNullable<ThemeDef['fx']>;

export type ParticleId =
  | 'petals' | 'flowers' | 'leaves' | 'snow' | 'rain' | 'stars' | 'sparkles' | 'hearts' | 'bubbles'
  | 'butterflies' | 'fireflies' | 'lanterns' | 'clouds' | 'confetti' | 'peace' | 'notes' | 'moons'
  | 'pills' | 'embers' | 'mushrooms' | 'rainbows' | 'doves' | 'spirals' | 'seeds' | 'smoke'
  | 'greenleaf' | 'stonermix' | 'sparks' | 'deepbubbles' | 'code' | 'starfield' | 'storm' | 'none';

interface Cfg {
  label: string;
  icon: string;
  glyphs: string[];
  mode: 'fall' | 'rise' | 'across';
  size: [number, number];
  dur: [number, number];
  sway: number;
  spin: boolean;
  opacity: number;
  count: number;
  color?: string;
  glow?: string;
}

export const PARTICLES: Record<Exclude<ParticleId, 'none'>, Cfg> = {
  petals: { label: 'Petals', icon: '🌸', glyphs: ['🌸', '🌸', '🌷'], mode: 'fall', size: [14, 26], dur: [9000, 16000], sway: 35, spin: true, opacity: 0.85, count: 14 },
  flowers: { label: 'Flowers', icon: '🌼', glyphs: ['🌼', '🌻', '🌺', '🌸'], mode: 'fall', size: [16, 28], dur: [9000, 15000], sway: 28, spin: false, opacity: 0.9, count: 12 },
  leaves: { label: 'Leaves', icon: '🍂', glyphs: ['🍂', '🍁', '🍂'], mode: 'fall', size: [16, 28], dur: [8000, 14000], sway: 45, spin: true, opacity: 0.9, count: 14 },
  snow: { label: 'Snow', icon: '❄️', glyphs: ['❄️', '❄', '•'], mode: 'fall', size: [10, 22], dur: [9000, 16000], sway: 20, spin: true, opacity: 0.9, count: 18 },
  rain: { label: 'Rain', icon: '🌧️', glyphs: ['╲', '╲', '╲'], mode: 'fall', size: [14, 22], dur: [1800, 3000], sway: 0, spin: false, opacity: 0.6, count: 22, color: '#7FA6CF' },
  stars: { label: 'Stars', icon: '⭐', glyphs: ['✦', '✨', '⭐'], mode: 'fall', size: [10, 20], dur: [6000, 12000], sway: 8, spin: false, opacity: 0.85, count: 22, color: '#FFE27A' },
  sparkles: { label: 'Sparkles', icon: '✨', glyphs: ['✨', '✦', '✧'], mode: 'rise', size: [12, 22], dur: [7000, 13000], sway: 14, spin: false, opacity: 0.85, count: 16 },
  hearts: { label: 'Hearts', icon: '💖', glyphs: ['💖', '💗', '💕', '❤️'], mode: 'rise', size: [14, 26], dur: [8000, 14000], sway: 24, spin: false, opacity: 0.85, count: 12 },
  bubbles: { label: 'Bubbles', icon: '🫧', glyphs: ['●'], mode: 'rise', size: [22, 64], dur: [10000, 20000], sway: 20, spin: false, opacity: 1, count: 12, color: 'rgba(255,140,200,0.3)' },
  butterflies: { label: 'Butterflies', icon: '🦋', glyphs: ['🦋', '🦋', '🐝'], mode: 'across', size: [18, 30], dur: [9000, 16000], sway: 40, spin: false, opacity: 0.95, count: 8 },
  fireflies: { label: 'Fireflies', icon: '🪲', glyphs: ['●'], mode: 'rise', size: [8, 16], dur: [9000, 16000], sway: 30, spin: false, opacity: 0.9, count: 16, color: '#E4FF6B', glow: '#E4FF6B' },
  lanterns: { label: 'Lanterns', icon: '🏮', glyphs: ['🏮'], mode: 'rise', size: [20, 34], dur: [12000, 20000], sway: 18, spin: false, opacity: 0.95, count: 8 },
  clouds: { label: 'Clouds', icon: '☁️', glyphs: ['☁️'], mode: 'across', size: [28, 56], dur: [18000, 32000], sway: 6, spin: false, opacity: 0.85, count: 6 },
  confetti: { label: 'Confetti', icon: '🎊', glyphs: ['🎊', '🟡', '🩷', '🟣', '🔵', '🟢'], mode: 'fall', size: [10, 22], dur: [6000, 10000], sway: 25, spin: true, opacity: 0.95, count: 18 },
  peace: { label: 'Peace signs', icon: '☮️', glyphs: ['☮️', '✌️', '☮️'], mode: 'fall', size: [16, 28], dur: [8000, 13000], sway: 28, spin: false, opacity: 0.9, count: 12 },
  notes: { label: 'Music notes', icon: '🎵', glyphs: ['🎵', '🎶', '♪'], mode: 'rise', size: [16, 28], dur: [8000, 14000], sway: 26, spin: false, opacity: 0.9, count: 12 },
  moons: { label: 'Moons', icon: '🌙', glyphs: ['🌙', '🌛', '⭐'], mode: 'fall', size: [16, 28], dur: [10000, 18000], sway: 14, spin: false, opacity: 0.9, count: 10 },
  pills: { label: 'Pills', icon: '💊', glyphs: ['💊', '💊', '💊'], mode: 'fall', size: [16, 26], dur: [8000, 14000], sway: 22, spin: true, opacity: 0.9, count: 12 },
  embers: { label: 'Embers', icon: '🔥', glyphs: ['●', '✦'], mode: 'rise', size: [6, 14], dur: [4000, 8000], sway: 24, spin: false, opacity: 0.9, count: 20, color: '#FF8A3D', glow: '#FF5E1A' },
  mushrooms: { label: 'Mushrooms', icon: '🍄', glyphs: ['🍄', '🍄', '🌈'], mode: 'fall', size: [16, 28], dur: [8000, 14000], sway: 26, spin: false, opacity: 0.95, count: 12 },
  rainbows: { label: 'Rainbows', icon: '🌈', glyphs: ['🌈'], mode: 'fall', size: [22, 40], dur: [10000, 18000], sway: 18, spin: false, opacity: 0.9, count: 8 },
  doves: { label: 'Doves', icon: '🕊️', glyphs: ['🕊️'], mode: 'across', size: [20, 32], dur: [10000, 18000], sway: 30, spin: false, opacity: 0.95, count: 6 },
  spirals: { label: 'Spirals', icon: '🌀', glyphs: ['🌀', '🌀', '💫'], mode: 'fall', size: [16, 30], dur: [6000, 11000], sway: 22, spin: true, opacity: 0.95, count: 12 },
  seeds: { label: 'Seeds', icon: '✺', glyphs: ['✺', '✧'], mode: 'fall', size: [14, 24], dur: [9000, 15000], sway: 40, spin: true, opacity: 0.95, count: 14, color: '#FFFFFF' },
  smoke: { label: 'Smoke', icon: '💨', glyphs: ['💨', '☁️', '💨'], mode: 'rise', size: [18, 40], dur: [9000, 16000], sway: 30, spin: false, opacity: 0.7, count: 10 },
  greenleaf: { label: 'Green leaves', icon: '🌿', glyphs: ['🌿', '🍃', '☘️', '🌿'], mode: 'fall', size: [16, 30], dur: [8000, 14000], sway: 34, spin: true, opacity: 0.95, count: 14 },
  sparks: { label: 'Sparks', icon: '⚡', glyphs: ['▪', '■', '▪'], mode: 'rise', size: [5, 10], dur: [2500, 5000], sway: 30, spin: false, opacity: 0.95, count: 22, color: '#FF8A2A', glow: '#FFB04A' },
  deepbubbles: { label: 'Deep bubbles', icon: '🫧', glyphs: ['○', '◌', '○'], mode: 'rise', size: [14, 40], dur: [8000, 15000], sway: 22, spin: false, opacity: 0.8, count: 14, color: '#7FF5E0' },
  code: { label: 'Code rain', icon: '💻', glyphs: ['1', '0', '7', '3', 'A', 'F', '0', '1'], mode: 'fall', size: [12, 18], dur: [3500, 7000], sway: 0, spin: false, opacity: 0.85, count: 28, color: '#39FF6A', glow: '#39FF6A' },
  starfield: { label: 'Starfield', icon: '✨', glyphs: ['·', '✦', '·', '•'], mode: 'fall', size: [8, 16], dur: [14000, 26000], sway: 4, spin: false, opacity: 0.9, count: 30, color: '#FFFFFF' },
  storm: { label: 'Storm rain', icon: '⛈️', glyphs: ['╲', '╲', '╲'], mode: 'fall', size: [14, 24], dur: [900, 1600], sway: 0, spin: false, opacity: 0.65, count: 30, color: '#9FB4CC' },
  stonermix: { label: 'Chill mix', icon: '🚬', glyphs: ['🌿', '🍃', '🚬', '💨', '🍄', '🌿', '🚬'], mode: 'fall', size: [16, 30], dur: [8000, 14000], sway: 30, spin: true, opacity: 0.95, count: 16 },
};

export const PARTICLE_IDS = Object.keys(PARTICLES) as Exclude<ParticleId, 'none'>[];

interface P {
  glyph: string;
  size: number;
  x: number;
  y: number;
  dur: number;
  start: number;
  sway: number;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function makeParticles(cfg: Cfg, w: number, h: number, speed: number): P[] {
  return Array.from({ length: cfg.count }, () => ({
    glyph: cfg.glyphs[Math.floor(Math.random() * cfg.glyphs.length)],
    size: rnd(cfg.size[0], cfg.size[1]),
    x: rnd(0, w),
    y: rnd(0, h),
    dur: rnd(cfg.dur[0], cfg.dur[1]) / Math.max(0.25, speed),
    start: Math.random(),
    sway: rnd(cfg.sway * 0.5, cfg.sway),
  }));
}

function Particle({ p, cfg, w, h }: { p: P; cfg: Cfg; w: number; h: number }) {
  const t = useRef(new Animated.Value(p.start)).current;
  useEffect(() => {
    const run = Animated.loop(Animated.timing(t, { toValue: 1, duration: p.dur, easing: Easing.linear, useNativeDriver: true }));
    run.start();
    return () => run.stop();
  }, [t, p.dur]);
  const sway = t.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, p.sway, 0, -p.sway, 0] });
  const rot = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  let transform: any[];
  let left = p.x;
  let top = 0;
  if (cfg.mode === 'across') {
    top = p.y;
    transform = [{ translateX: t.interpolate({ inputRange: [0, 1], outputRange: [-80, w + 80] }) }, { translateY: sway }];
    left = 0;
  } else {
    const y = t.interpolate({ inputRange: [0, 1], outputRange: cfg.mode === 'rise' ? [h + 80, -80] : [-60, h + 60] });
    transform = [{ translateY: y }, { translateX: sway }, ...(cfg.spin ? [{ rotate: rot }] : [])];
  }
  return (
    <Animated.View style={{ position: 'absolute', left, top, opacity: cfg.opacity, transform }}>
      <Text
        style={{
          fontSize: p.size,
          color: cfg.color,
          fontFamily: 'System',
          ...(cfg.glow ? { textShadowColor: cfg.glow, textShadowRadius: 10, textShadowOffset: { width: 0, height: 0 } } : null),
        }}
      >
        {p.glyph}
      </Text>
    </Animated.View>
  );
}

function Particles({ id, speed }: { id: Exclude<ParticleId, 'none'>; speed: number }) {
  const { width, height } = Dimensions.get('window');
  const cfg = PARTICLES[id];
  const list = useMemo(() => makeParticles(cfg, width, height, speed), [cfg, width, height, speed]);
  return (
    <>
      {list.map((p, i) => (
        <Particle key={`${id}-${speed}-${i}`} p={p} cfg={cfg} w={width} h={height} />
      ))}
    </>
  );
}

function Aurora() {
  const { width, height } = Dimensions.get('window');
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 7000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    run.start();
    return () => run.stop();
  }, [a]);
  const blobs = [
    { c: '#2EE6A6', top: -height * 0.1, left: -width * 0.3, s: width * 1.2, from: 0.06, to: 0.22, dx: 60 },
    { c: '#8C7CFF', top: height * 0.25, left: width * 0.2, s: width * 1.1, from: 0.2, to: 0.05, dx: -70 },
    { c: '#38A9F5', top: height * 0.6, left: -width * 0.2, s: width * 1.0, from: 0.05, to: 0.18, dx: 50 },
  ];
  return (
    <>
      {blobs.map((b, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', top: b.top, left: b.left, width: b.s, height: b.s, borderRadius: b.s / 2, backgroundColor: b.c,
            opacity: a.interpolate({ inputRange: [0, 1], outputRange: [b.from, b.to] }),
            transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [0, b.dx] }) }],
          }}
        />
      ))}
    </>
  );
}

function Lightning() {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    const strike = () => {
      if (stop) return;
      Animated.sequence([
        Animated.timing(a, { toValue: 0.32, duration: 70, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 90, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0.22, duration: 60, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();
      timer = setTimeout(strike, 5000 + Math.random() * 7000);
    };
    timer = setTimeout(strike, 2500);
    return () => { stop = true; clearTimeout(timer); };
  }, [a]);
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF', opacity: a }]} />;
}

const WASH = ['#FF2D95', '#FF8A3D', '#F2D21E', '#2ECC71', '#38A9F5', '#8B5CF6'];

function RainbowWash() {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = Animated.loop(Animated.timing(t, { toValue: 1, duration: 18000, easing: Easing.linear, useNativeDriver: true }));
    run.start();
    return () => run.stop();
  }, [t]);
  const n = WASH.length;
  return (
    <View style={[StyleSheet.absoluteFill, { opacity: 0.13 }]}>
      {WASH.map((c, k) => {
        const input = k === 0 ? [0, 1 / n, (n - 1) / n, 1] : [(k - 1) / n, k / n, (k + 1) / n];
        const output = k === 0 ? [1, 0, 0, 1] : [0, 1, 0];
        return (
          <Animated.View
            key={c}
            style={[StyleSheet.absoluteFill, { backgroundColor: c, opacity: t.interpolate({ inputRange: input, outputRange: output, extrapolate: 'clamp' }) }]}
          />
        );
      })}
    </View>
  );
}

/** Animated overlay. Never blocks touches; off when the phone asks to reduce motion. */
export function ThemeFx({ fx, particle, speed = 1 }: { fx?: Fx; particle?: string | null; speed?: number }) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => sub.remove();
  }, []);
  if (reduce) return null;
  const pid = particle && particle !== 'none' && particle in PARTICLES ? (particle as Exclude<ParticleId, 'none'>) : null;
  if (!fx && !pid) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {fx === 'aurora' ? <Aurora /> : fx === 'rainbow' ? <RainbowWash /> : fx === 'lightning' ? <Lightning /> : null}
      {pid ? <Particles id={pid} speed={speed} /> : null}
    </View>
  );
}
