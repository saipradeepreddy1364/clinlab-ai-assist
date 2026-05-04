import { NativeModules, Platform } from 'react-native';

// This is a safe shim for react-native-gesture-handler on web
const ReactNative = {
  NativeModules,
  Platform,
};

export default ReactNative;
