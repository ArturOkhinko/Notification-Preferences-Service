import { pool } from '../infra/db';
import { QuietHours } from '../domain/types';

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

export default { upsertQuietHours };
