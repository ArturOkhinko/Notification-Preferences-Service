import { mergePreferences } from '../domain/preferences';
import { Preference, PreferencesUpdate } from '../domain/types';
import preferencesRepository from '../repositories/preferences.repository';
import quietHoursRepository from '../repositories/quietHours.repository';
import usersRepository from '../repositories/user.repository';

const getUserPreferences = async (userId: string): Promise<Preference[]> => {
  const [defaultPreferences, userPreferences] = await Promise.all([
    preferencesRepository.findDefaults(),
    preferencesRepository.findUserOverrides(userId),
  ]);
  return mergePreferences(defaultPreferences, userPreferences);
};

const changeUserPreferences = async (
  userId: string,
  update: PreferencesUpdate,
) => {
  await usersRepository.ensureUser(userId);
  if (update.preference) {
    await preferencesRepository.upsertUserPreference(userId, update.preference);
  }
  if (update.quietHours) {
    await quietHoursRepository.upsertQuietHours(userId, update.quietHours);
  }
};

export default { getUserPreferences, changeUserPreferences };
