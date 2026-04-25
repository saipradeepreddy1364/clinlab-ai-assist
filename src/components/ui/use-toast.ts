// use-toast.ts — Native toast state management
import * as React from "react";

export type ToastVariant = "default" | "destructive" | "success";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

type ToastState = { toasts: Toast[] };

let listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(state: ToastState) {
  memoryState = state;
  listeners.forEach((l) => l(state));
}

export function toast(props: Omit<Toast, "id">) {
  const id = Math.random().toString(36).slice(2);
  const newToast: Toast = { id, duration: 3000, ...props };
  dispatch({ toasts: [...memoryState.toasts, newToast] });
  if (newToast.duration) {
    setTimeout(() => dismiss(id), newToast.duration);
  }
  return { id };
}

export function dismiss(id?: string) {
  dispatch({ toasts: id ? memoryState.toasts.filter((t) => t.id !== id) : [] });
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { listeners = listeners.filter((l) => l !== setState); };
  }, []);
  return { ...state, toast, dismiss };
}
