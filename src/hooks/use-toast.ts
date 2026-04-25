import { Alert } from "react-native";

export const toast = ({ title, description }: { title?: string, description?: string }) => {
  Alert.alert(title || "Notice", description || "");
};

export function useToast() {
  return {
    toast,
    dismiss: () => {},
    toasts: [],
  };
}
