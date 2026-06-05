import { pool } from '../infra/db';
import { Channel, NotificationType, Region } from '../domain/types';

const isBlocked = async (
  notificationType: NotificationType,
  channel: Channel,
  region: Region,
): Promise<boolean> => {
  const result = await pool.query(
    'SELECT 1 FROM global_policies WHERE notification_type = $1 AND channel = $2 AND region = $3',
    [notificationType, channel, region],
  );
  return (result.rowCount ?? 0) > 0;
};

export default { isBlocked };
