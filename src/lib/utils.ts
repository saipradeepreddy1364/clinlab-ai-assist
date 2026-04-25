// cn() is a no-op in React Native — styles use StyleSheet, not className strings.
// Kept as shim to avoid import errors in any file that still references it.
export function cn(...inputs: any[]): string {
  return "";
}
