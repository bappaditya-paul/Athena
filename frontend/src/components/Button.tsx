import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { AppTheme } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: string;
  fullWidth?: boolean;
  testID?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
  testID,
}) => {
  const theme = useTheme() as AppTheme;
  
  const getButtonStyle = (): StyleProp<ViewStyle> => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.roundness,
      paddingVertical: 12,
      paddingHorizontal: 24,
      minWidth: 120,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      width: fullWidth ? '100%' : undefined,
    };

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: theme.colors.primary,
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      text: {
        backgroundColor: 'transparent',
        paddingHorizontal: 12,
      },
    };

    const disabledStyle: ViewStyle = {
      opacity: 0.6,
    };

    return [
      baseStyle,
      variantStyles[variant],
      disabled && disabledStyle,
      style,
    ];
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const baseStyle: TextStyle = {
      fontSize: 16,
      fontWeight: '600',
    };

    const variantStyles: Record<ButtonVariant, TextStyle> = {
      primary: {
        color: theme.colors.surface,
      },
      secondary: {
        color: theme.colors.surface,
      },
      outlined: {
        color: theme.colors.primary,
      },
      text: {
        color: theme.colors.primary,
      },
    };

    return [baseStyle, variantStyles[variant], textStyle];
  };

  const getIconColor = () => {
    if (variant === 'primary' || variant === 'secondary') {
      return theme.colors.surface;
    }
    return theme.colors.primary;
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={getIconColor()}
          size="small"
          style={styles.loader}
        />
      ) : (
        <>
          {icon && (
            <IconButton
              icon={icon}
              size={20}
              iconColor={getIconColor()}
              style={styles.icon}
              disabled={true}
            />
          )}
          <Text style={getTextStyle()}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loader: {
    marginRight: 8,
  },
  icon: {
    marginRight: 8,
    marginLeft: -4,
  },
});

export default Button;
