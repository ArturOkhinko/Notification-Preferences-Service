import { pool } from '../infra/db';
import { QuietHours } from '../domain/types';

interface QuietHoursRow {
  start_time: string;
  end_time: string;
  timezone: string;
}

const toQuietHours = (row: QuietHoursRow): QuietHours => ({
  startTime: row.start_time.slice(0, 5),
  endTime: row.end_time.slice(0, 5),
  timezone: row.timezone,
});

const findByUser = async (userId: string): Promise<QuietHours | null> => {
  const result = await pool.query<QuietHoursRow>(
    'SELECT start_time, end_time, timezone FROM quiet_hours WHERE user_id = $1',
    [userId],
  );
  const row = result.rows[0];
  return row ? toQuietHours(row) : null;
};

const upsertQuietHours = async (
  userId: string,
  quietHours: QuietHours,
): Promise<void> => {
  await pool.query(
    `INSERT INTO quiet_hours (user_id, start_time, end_time, timezone)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id)
     DO UPDATE SET start_time = EXCLUDED.start_time,
                   end_time = EXCLUDED.end_time,
                   timezone = EXCLUDED.timezone`,
    [userId, quietHours.startTime, quietHours.endTime, quietHours.timezone],
  );
};

export default { findByUser, upsertQuietHours };
