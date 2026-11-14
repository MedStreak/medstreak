import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import type { ThemeDef } from '../lib/theme';

type Fx = NonNullable<ThemeDef['fx']>;
type Kind = 'petals' | 'stars' | 'bubbles';

interface P {
  glyph: string;
  size: number;
  x: number;
  dur: number;
  start: number;
  sway: number;
  spin: boolean;
  color?: string;
  opacity: number;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function makeParticles(kind: Kind, w: number): P[] {
  const n = kind === 'stars' ? 22 : kind === 'petals' ? 14 : 12;
  return Array.from({ length: n }, () => {
    if (kind === 'petals') {
      return { glyph: Math.random() > 0.25 ? '🌸' : '🌷', size: rnd(14, 26), x: rnd(0, w), dur: rnd(9000, 16000), start: Math.random(), sway: rnd(20, 50), spin: true, opacity: 0.8 };
    }
    if (kind === 'stars') {
      return { glyph: Math.random() > 0.5 ? '✦' : '✨', size: rnd(10, 20), x: rnd(0, w), dur: rnd(6000, 12000), start: Math.random(), sway: rnd(5, 15), spin: false, color: '#FFE27A', opacity: 0.85 };
    }
    const colors = ['rgba(255,140,60,0.35)', 'rgba(255,80,150,0.35)', 'rgba(255,210,63,0.3)'];
    return { glyph: '●', size: rnd(22, 64), x: rnd(0, w), dur: rnd(10000, 20000), start: Math.random(), sway: rnd(10, 30), spin: false, color: colors[Math.floor(Math.random() * 3)], opacity: 1 };
  });
}

function Particle({ p, kind, h }: { p: P; kind: Kind; h: number }) {
  const t = useRef(new Animated.Value(p.start)).current;
  useEffect(() => {
    const run = Animated.loop(
      Animated.timing(t, { toValue: 1, duration: p.dur, easing: Easing.linear, useNativeDriver: true }),
    );
    run.start();
    return () => run.stop();
  }, [t, p.dur]);
  const up = kind === 'bubbles';
  const y = t.interpolate({ inputRange: [0, 1], outputRange: up ? [h + 80, -80] : [-60, h + 60] });
  const x = t.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, p.sway, 0, -p.sway, 0] });
  const r = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View
      style={{ position: 'absolute', left: p.x, top: 0, opacity: p.opacity, transform: [{ translateY: y }, { translateX: x }, ...(p.spin ? [{ rotate: r }] : [])] }}
    >
      <Text style={{ fontSize: p.size, color: p.color }}>{p.glyph}</Text>
    </Animated.View>
  );
}

function Particles({ kind }: { kind: Kind }) {
  const { width, height } = Dimensions.get('window');
  const list = useMemo(() => makeParticles(kind, width), [kind, width]);
  return (
    <>
      {list.map((p, i) => (
        <Particle key={i} p={p} kind={kind} h={height} />
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

/** Animated overlay for the unlockable themes. Never blocks touches; off when the phone asks to reduce motion. */
export function ThemeFx({ fx }: { fx?: Fx }) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
  }, []);
  if (!fx || reduce) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {fx === 'aurora' ? <Aurora /> : fx === 'rainbow' ? <RainbowWash /> : <Particles kind={fx} />}
    </View>
  );
}
