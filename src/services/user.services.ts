import { mergePreferences } from '../domain/preferences';
import { Preference } from '../domain/types';
import preferencesRepository from '../repositories/preferences.repository';

const getUserPreferences = async (userId: string): Promise<Preference[]> => {
  const [defaultPreferences, userPreferences] = await Promise.all([
    preferencesRepository.findDefaults(),
    preferencesRepository.findUserOverrides(userId),
  ]);
  return mergePreferences(defaultPreferences, userPreferences);
};

export default { getUserPreferences };
