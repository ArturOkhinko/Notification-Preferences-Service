import { mergePreferences } from '../domain/preferences';
import { Preference, PreferencesUpdate } from '../domain/types';
import { logger } from '../infra/logger';
import { metrics } from '../infra/metrics';
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
    logger.info('preference_changed', {
      userId,
      notificationType: update.preference.notificationType,
      channel: update.preference.channel,
      enabled: update.preference.enabled,
    });
    metrics.increment('preference_changes_total', {
      notificationType: update.preference.notificationType,
      channel: update.preference.channel,
    });
  }
  if (update.quietHours) {
    await quietHoursRepository.upsertQuietHours(userId, update.quietHours);
    logger.info('quiet_hours_set', {
      userId,
      startTime: update.quietHours.startTime,
      endTime: update.quietHours.endTime,
      timezone: update.quietHours.timezone,
    });
    metrics.increment('quiet_hours_updates_total');
  }
};

export default { getUserPreferences, changeUserPreferences };
