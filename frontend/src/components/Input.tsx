import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { 
  TextInput as PaperInput, 
  useTheme, 
  TextInputProps as PaperTextInputProps,
  HelperText, 
  MD3Theme,
  TextInputIconProps
} from 'react-native-paper';

type InputProps = Omit<PaperTextInputProps, 'theme'> & {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
  errorText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
};

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  error = false,
  errorText,
  containerStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const theme = useTheme<MD3Theme>();
  
  return (
    <>
      <PaperInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        mode="outlined"
        error={error}
        style={[styles.input, containerStyle]}
        theme={{
          ...theme,
          colors: {
            ...theme.colors,
            primary: error ? theme.colors.error : theme.colors.primary,
            background: theme.colors.surface,
          },
        }}
left={leftIcon ? (() => {
          const iconProps: TextInputIconProps = {
            icon: leftIcon,
            color: error ? theme.colors.error : theme.colors.onSurfaceVariant,
            forceTextInputFocus: false
          };
          return <PaperInput.Icon {...iconProps} />;
        })() : undefined}
        right={
          rightIcon ? (() => {
            const iconProps: TextInputIconProps = {
              icon: rightIcon,
              onPress: onRightIconPress,
              color: error ? theme.colors.error : theme.colors.onSurfaceVariant,
              forceTextInputFocus: false
            };
            return <PaperInput.Icon {...iconProps} />;
          })() : undefined
        }
        {...props}
      />
      <HelperText type="error" visible={error}>
        {errorText}
      </HelperText>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
});

export default Input;
