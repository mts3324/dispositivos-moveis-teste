import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ChallengeTimerProps {
  seconds: number;
  showIcon?: boolean;
  variant?: 'header' | 'footer';
}

export default function ChallengeTimer({ seconds, showIcon = true, variant = 'header' }: ChallengeTimerProps) {
  const { colors } = useTheme();

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const secsRemaining = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secsRemaining).padStart(2, '0')}`;
  };

  if (variant === 'header') {
    return (
      <View style={styles.timer}>
        {showIcon && <Ionicons name="time" size={16} color="#fff" />}
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.footerTimer}>
      <Text style={[styles.footerTime, { color: '#34d399' }]}>
        Tempo decorrido: {formatTime(seconds)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footerTimer: {
    marginBottom: 4,
  },
  footerTime: {
    fontSize: 14,
    fontWeight: '600',
  },
});

