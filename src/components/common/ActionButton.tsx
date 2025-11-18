import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function ActionButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}: ActionButtonProps) {
  const { colors } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 25,
      borderWidth: variant === 'outline' ? 1 : 0,
    };

    if (variant === 'primary') {
      return { ...baseStyle, backgroundColor: colors.primary };
    }
    if (variant === 'secondary') {
      return { ...baseStyle, backgroundColor: 'transparent', borderColor: colors.border };
    }
    if (variant === 'outline') {
      return { ...baseStyle, backgroundColor: 'transparent', borderColor: colors.border };
    }
    return baseStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 14,
      fontWeight: '600',
    };

    if (variant === 'primary') {
      return { ...baseStyle, color: '#fff' };
    }
    return { ...baseStyle, color: colors.text };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), disabled && { opacity: 0.5 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={16}
              color={variant === 'primary' ? '#fff' : colors.text}
            />
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

