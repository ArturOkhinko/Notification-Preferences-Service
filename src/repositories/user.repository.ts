import { pool } from '../infra/db';

const ensureUser = async (userId: string): Promise<void> => {
  await pool.query(
    'INSERT INTO users (id) VALUES ($1) ON CONFLICT (id) DO NOTHING',
    [userId],
  );
};

export default { ensureUser };
