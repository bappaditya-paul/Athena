import React, {useState} from 'react';
import {View, StyleSheet, Image, KeyboardAvoidingView, Platform} from 'react-native';
import {Button, Text, TextInput, Title, useTheme} from 'react-native-paper';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

const AuthScreen = ({navigation}: Props) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  const handleAuth = () => {
    if (!email || !password) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.replace('Home');
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('@assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Title style={styles.title}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Title>
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          left={<TextInput.Icon icon="email" />}
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
          left={<TextInput.Icon icon="lock" />}
        />
        
        <Button
          mode="contained"
          onPress={handleAuth}
          loading={isLoading}
          disabled={!email || !password}
          style={styles.button}
          labelStyle={styles.buttonLabel}>
          {isLogin ? 'Sign In' : 'Sign Up'}
        </Button>
        
        <Button
          mode="text"
          onPress={() => setIsLogin(!isLogin)}
          style={styles.toggleButton}
          labelStyle={styles.toggleButtonLabel}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </Button>
        
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>
        
        <Button
          mode="outlined"
          icon="google"
          onPress={() => {}}
          style={styles.socialButton}
          labelStyle={styles.socialButtonLabel}>
          Continue with Google
        </Button>
        
        <Button
          mode="outlined"
          icon="facebook"
          onPress={() => {}}
          style={[styles.socialButton, {marginBottom: 0}]}
          labelStyle={styles.socialButtonLabel}>
          Continue with Facebook
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#2c3e50',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 6,
  },
  toggleButton: {
    marginTop: 16,
  },
  toggleButtonLabel: {
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    marginHorizontal: 12,
    color: '#7f8c8d',
    fontSize: 14,
  },
  socialButton: {
    borderColor: '#e0e0e0',
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 8,
  },
  socialButtonLabel: {
    fontSize: 15,
    paddingVertical: 6,
  },
});

export default AuthScreen;
