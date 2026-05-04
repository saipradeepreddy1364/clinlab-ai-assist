import { View } from 'react-native';

// This is a shim for React Native's internal codegenNativeComponent
// It must be a function that returns a component.
const codegenNativeComponent = (name: string) => {
  return View;
};

export default codegenNativeComponent;
