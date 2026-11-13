import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const COLORS = ['#FF7A45', '#6C5CE7', '#2EB67D', '#3B82F6', '#EC4899', '#F5A524', '#FFD43B'];
const COUNT = 60;

interface Piece {
  x: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
}

/** Lightweight confetti burst using only core Animated (no extra native deps). */
export function Confetti() {
  const { width, height } = Dimensions.get('window');
  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        x: Math.random() * width,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 600,
        duration: 1800 + Math.random() * 1400,
        drift: (Math.random() - 0.5) * 120,
        spin: 2 + Math.random() * 4,
      })),
    [width],
  );
  const progress = useRef(pieces.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const anims = progress.map((v, i) =>
      Animated.timing(v, {
        toValue: 1,
        delay: pieces[i].delay,
        duration: pieces[i].duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    Animated.parallel(anims).start();
  }, [progress, pieces]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: -20,
            width: p.size,
            height: p.size * 1.6,
            backgroundColor: p.color,
            borderRadius: 2,
            opacity: progress[i].interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
            transform: [
              { translateY: progress[i].interpolate({ inputRange: [0, 1], outputRange: [0, height + 40] }) },
              { translateX: progress[i].interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
              { rotate: progress[i].interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spin * 360}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}
