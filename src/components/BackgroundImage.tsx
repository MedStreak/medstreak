import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

/** The user's own background picture or GIF, with an adjustable dark wash so text stays readable. */
export function BackgroundImage({ uri, dim }: { uri: string; dim: number }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image source={{ uri }} resizeMode="cover" style={StyleSheet.absoluteFill} fadeDuration={0} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: Math.max(0, Math.min(80, dim)) / 100 }]} />
    </View>
  );
}
