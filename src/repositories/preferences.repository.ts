import { pool } from '../infra/db';
import { Channel, NotificationType, Preference } from '../domain/types';

interface PreferenceRow {
  notification_type: string;
  channel: string;
  enabled: boolean;
}

const toPreference = (row: PreferenceRow): Preference => ({
  notificationType: row.notification_type as NotificationType,
  channel: row.channel as Channel,
  enabled: row.enabled,
});

const findDefaults = async (): Promise<Preference[]> => {
  const result = await pool.query<PreferenceRow>(
    'SELECT notification_type, channel, enabled FROM default_preferences',
  );
  return result.rows.map(toPreference);
};

const findUserOverrides = async (userId: string): Promise<Preference[]> => {
  const result = await pool.query<PreferenceRow>(
    'SELECT notification_type, channel, enabled FROM user_preferences WHERE user_id = $1',
    [userId],
  );
  return result.rows.map(toPreference);
};

export default { findDefaults, findUserOverrides };
