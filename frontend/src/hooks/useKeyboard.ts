import {useState, useEffect} from 'react';
import {Keyboard, KeyboardEvent, Platform} from 'react-native';

type KeyboardMetrics = {
  height: number;
  duration: number;
  easing: 'easeIn' | 'easeInEaseOut' | 'easeOut' | 'linear' | 'keyboard';
};

const useKeyboard = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardWillShow, setKeyboardWillShow] = useState(false);
  const [keyboardWillHide, setKeyboardWillHide] = useState(false);
  const [keyboardHeightAndroid, setKeyboardHeightAndroid] = useState(0);

  const handleKeyboardWillShow = (e: KeyboardEvent) => {
    setKeyboardWillShow(true);
    setKeyboardHeight(e.endCoordinates.height);
    setKeyboardHeightAndroid(e.endCoordinates.height);
  };

  const handleKeyboardDidShow = (e: KeyboardEvent) => {
    setKeyboardWillShow(false);
    setKeyboardVisible(true);
    setKeyboardHeight(e.endCoordinates.height);
  };

  const handleKeyboardWillHide = () => {
    setKeyboardWillHide(true);
  };

  const handleKeyboardDidHide = () => {
    setKeyboardWillHide(false);
    setKeyboardVisible(false);
    setKeyboardHeight(0);
  };

  useEffect(() => {
    const showSubscription1 = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      handleKeyboardWillShow,
    );
    
    const showSubscription2 = Keyboard.addListener(
      'keyboardDidShow',
      handleKeyboardDidShow,
    );
    
    const hideSubscription1 = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      handleKeyboardWillHide,
    );
    
    const hideSubscription2 = Keyboard.addListener(
      'keyboardDidHide',
      handleKeyboardDidHide,
    );

    return () => {
      showSubscription1.remove();
      showSubscription2.remove();
      hideSubscription1.remove();
      hideSubscription2.remove();
    };
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return {
    keyboardHeight: Platform.OS === 'ios' ? keyboardHeight : keyboardHeightAndroid,
    keyboardVisible,
    keyboardWillShow,
    keyboardWillHide,
    dismissKeyboard,
  };
};

export default useKeyboard;
