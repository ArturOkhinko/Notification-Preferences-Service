import 'dotenv/config';
import { createApp } from './app';
import { pool } from './infra/db';

const PORT = Number(process.env.PORT ?? 3000);

const main = async () => {
  await pool.query('SELECT 1');
  const app = createApp();
  app.listen(PORT, () => console.log(`Server on :${PORT}`));
};

main().catch((e) => {
  console.error('Failed to start', e);
  process.exit(1);
});
