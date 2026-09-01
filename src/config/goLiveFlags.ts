/** Go-live slice: VISITOR + museum ADMIN. Extra products stay off unless env is true. */
function envFlag(name: string, defaultValue = false): boolean {
  const value = (import.meta.env as Record<string, string | undefined>)[name];
  if (value === undefined || value === "") return defaultValue;
  return value === "true" || value === "1";
}

export const goLiveFlags = {
  municipal: envFlag("VITE_FEATURE_MUNICIPAL", false),
  theater: envFlag("VITE_FEATURE_THEATER", false),
  rpg: envFlag("VITE_FEATURE_RPG", false),
  totem: envFlag("VITE_FEATURE_TOTEM", false),
  sponsor: envFlag("VITE_FEATURE_SPONSOR", false),
  producer: envFlag("VITE_FEATURE_PRODUCER", false),
  provider: envFlag("VITE_FEATURE_PROVIDER", false),
  extraFinance: envFlag("VITE_FEATURE_EXTRA_FINANCE", false),
  analytics: envFlag("VITE_FEATURE_ANALYTICS", false),
} as const;

export function isGoLiveFlagOn(flag: keyof typeof goLiveFlags): boolean {
  return goLiveFlags[flag];
}
