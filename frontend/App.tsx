import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { lightTheme } from './src/theme';
import { ThemeProvider } from './src/contexts/ThemeContext';
import MaterialCommunityIcon from './src/components/MaterialCommunityIcon';

// Create a placeholder screen for now
const HomeScreen = () => null;

// Create stack navigator
const Stack = createNativeStackNavigator();

// Create a navigation theme that matches our app theme
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lightTheme.colors.primary,
    background: lightTheme.colors.background,
    card: lightTheme.colors.surface,
    text: lightTheme.colors.text,
    border: lightTheme.colors.border,
    notification: lightTheme.colors.notification,
  },
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaperProvider
          theme={lightTheme}
          settings={{
            icon: (props) => <MaterialCommunityIcon {...props} color={props.color || ''} />
          }}>
          <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator screenOptions={{
              headerStyle: {
                backgroundColor: lightTheme.colors.primary,
              },
              headerTintColor: lightTheme.colors.surface,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{
                  title: 'Athena',
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
