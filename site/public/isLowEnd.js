export function isLowEnd() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false; // Default to false on server-side
  }
  const deviceMemory = navigator.deviceMemory || 4;
  return deviceMemory <= 4;
}
