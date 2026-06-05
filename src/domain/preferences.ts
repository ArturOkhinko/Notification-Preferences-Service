import { Preference } from './types';

const keyOf = (p: Preference) => `${p.notificationType}:${p.channel}`;

export const mergePreferences = (
  defaults: Preference[],
  overrides: Preference[],
): Preference[] => {
  const merged = new Map(defaults.map((p) => [keyOf(p), p]));
  overrides.forEach((p) => merged.set(keyOf(p), p));
  return [...merged.values()];
};
