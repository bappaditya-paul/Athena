import React from 'react';
import {StyleSheet, StyleProp, ViewStyle, TouchableOpacity} from 'react-native';
import {Button as PaperButton, Text, useTheme} from 'react-native-paper';
import {Theme} from '../theme';

type ButtonProps = React.ComponentProps<typeof PaperButton> & {
  mode?: 'text' | 'outlined' | 'contained';
  style?: StyleProp<ViewStyle>;
  labelStyle?: any;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  onPress: () => void;
};

const Button: React.FC<ButtonProps> = ({
  mode = 'contained',
  style,
  labelStyle,
  children,
  loading = false,
  disabled = false,
  icon,
  onPress,
  ...props
}) => {
  const theme = useTheme<Theme>();

  const buttonStyles = [
    styles.button,
    mode === 'contained' && styles.contained,
    mode === 'outlined' && styles.outlined,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    mode === 'contained' && styles.containedText,
    mode === 'outlined' && styles.outlinedText,
    disabled && styles.disabledText,
    labelStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <Text style={textStyles}>Loading...</Text>
      ) : (
        <Text style={textStyles}>
          {icon && <Text style={styles.icon}>{icon} </Text>}
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minWidth: 120,
  },
  contained: {
    backgroundColor: '#3498db',
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#3498db',
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  containedText: {
    color: '#fff',
  },
  outlinedText: {
    color: '#3498db',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 8,
  },
});

export default Button;
