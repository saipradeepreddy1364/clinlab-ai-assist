import { AppRegistry, Platform } from "react-native";

// Shim for LegacyEventEmitter which is missing in some expo-notifications web builds
if (Platform.OS === 'web') {
  const LegacyEventEmitter = class LegacyEventEmitter {
    addListener() { return { remove: () => {} }; }
    removeAllListeners() {}
    emit() {}
  };
  (window as any).LegacyEventEmitter = LegacyEventEmitter;
  (globalThis as any).LegacyEventEmitter = LegacyEventEmitter;
}

import App from "./App";

AppRegistry.registerComponent("main", () => App);
AppRegistry.runApplication("main", {
  initialProps: {},
  rootTag: document.getElementById("root"),
});
