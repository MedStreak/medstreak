import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, themedStyles } from '../lib/theme';
import { useApp } from '../state/AppState';
import { Confetti } from './Confetti';

const EMOJI = { dose: '🎉', milestone: '🔥', goal: '🏆' } as const;

export function CelebrationOverlay() {
  const { celebration, dismissCelebration } = useApp();
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!celebration) return;
    scale.setValue(0.6);
    Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  }, [celebration, scale]);

  if (!celebration) return null;
  return (
    <Modal transparent animationType="fade" visible onRequestClose={dismissCelebration}>
      <Pressable style={styles.backdrop} onPress={dismissCelebration}>
        <Confetti key={celebration.title + celebration.subtitle} />
        <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
          <Text style={styles.emoji}>{EMOJI[celebration.kind]}</Text>
          <Text style={styles.title}>{celebration.title}</Text>
          <Text style={styles.subtitle}>{celebration.subtitle}</Text>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Keep going</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = themedStyles(() => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(43,34,51,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: 28, alignItems: 'center', width: '100%', maxWidth: 360 },
  emoji: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.muted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  button: { marginTop: 20, backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 999 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
}));
