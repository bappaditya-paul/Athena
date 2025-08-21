import React from 'react';
import {StyleSheet, StyleProp, ViewStyle, TextInput as RNTextInput} from 'react-native';
import {TextInput as PaperInput, useTheme, TextInputProps} from 'react-native-paper';
import {Theme} from '../theme';

type InputProps = TextInputProps & {
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
  const theme = useTheme<Theme>();
  
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
        left={leftIcon ? <PaperInput.Icon name={leftIcon} color={theme.colors.placeholder} /> : undefined}
        right={
          rightIcon ? (
            <PaperInput.Icon
              name={rightIcon}
              onPress={onRightIconPress}
              color={error ? theme.colors.error : theme.colors.placeholder}
              forceTextInputFocus={false}
            />
          ) : undefined
        }
        {...props}
      />
      {error && errorText && (
        <PaperInput.HelperText type="error" visible={error}>
          {errorText}
        </PaperInput.HelperText>
      )}
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
