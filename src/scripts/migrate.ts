import 'dotenv/config';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../infra/db';
import { logger } from '../infra/logger';

const MIGRATIONS_DIR = join(__dirname, '..', '..', 'migrations');

const ensureMigrationsTable = async (): Promise<void> => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       name       TEXT PRIMARY KEY,
       applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
     )`,
  );
};

const isApplied = async (name: string): Promise<boolean> => {
  const result = await pool.query(
    'SELECT 1 FROM schema_migrations WHERE name = $1',
    [name],
  );
  return (result.rowCount ?? 0) > 0;
};

const apply = async (name: string, sql: string): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [
      name,
    ]);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const listMigrationFiles = (): string[] =>
  readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

const migrate = async (): Promise<void> => {
  await ensureMigrationsTable();
  for (const file of listMigrationFiles()) {
    if (await isApplied(file)) {
      logger.info('migration_skipped', { file });
      continue;
    }
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    await apply(file, sql);
    logger.info('migration_applied', { file });
  }
};

migrate()
  .then(() => pool.end())
  .catch((e) => {
    logger.error('migration_failed', { message: (e as Error).message });
    process.exit(1);
  });
