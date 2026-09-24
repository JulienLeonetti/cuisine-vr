export const DEBUG_MODE = false;

export function isDebugEnabled(feature = "debug") {
  if (DEBUG_MODE) return true;
  return new URLSearchParams(window.location.search).has(feature);
}
