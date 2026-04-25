// sonner.tsx — Toast notifications for React Native
// Sonner is a web library; we provide a native no-op shim.
// Use the useToast hook + Toaster component in toaster.tsx for actual toasts.

export const Toaster = () => null;
export const toast = {
  success: (msg: string) => console.log("[toast/success]", msg),
  error: (msg: string) => console.log("[toast/error]", msg),
  info: (msg: string) => console.log("[toast/info]", msg),
  warning: (msg: string) => console.log("[toast/warning]", msg),
  message: (msg: string) => console.log("[toast]", msg),
};
