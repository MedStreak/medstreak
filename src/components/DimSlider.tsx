import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { colors, themedStyles } from '../lib/theme';

/** A small slider (no native module needed). Drag anywhere on the bar. */
export function DimSlider({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  const [w, setW] = useState(0);
  const wRef = useRef(0);
  const cb = useRef(onChange);
  cb.current = onChange;
  const set = (x: number) => {
    if (!wRef.current) return;
    cb.current(Math.round(Math.max(0, Math.min(1, x / wRef.current)) * max));
  };
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => set(e.nativeEvent.locationX),
      onPanResponderMove: (e) => set(e.nativeEvent.locationX),
    }),
  ).current;
  const x = w ? (Math.max(0, Math.min(max, value)) / max) * w : 0;
  return (
    <View
      style={styles.hit}
      onLayout={(e) => {
        wRef.current = e.nativeEvent.layout.width;
        setW(e.nativeEvent.layout.width);
      }}
      {...pan.panHandlers}
      accessibilityRole="adjustable"
      accessibilityLabel="Dim the background"
      accessibilityValue={{ min: 0, max, now: value }}
    >
      <View pointerEvents="none" style={styles.track} />
      <View pointerEvents="none" style={[styles.fill, { width: x }]} />
      <View pointerEvents="none" style={[styles.thumb, { left: Math.max(0, x - 13) }]} />
    </View>
  );
}

const styles = themedStyles(() => StyleSheet.create({
  hit: { height: 40, justifyContent: 'center' },
  track: { height: 6, borderRadius: 3, backgroundColor: 'rgba(128,128,128,0.35)' },
  fill: { position: 'absolute', left: 0, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  thumb: { position: 'absolute', top: 7, width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', borderWidth: 3, borderColor: colors.primary },
}));
