import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const getCurrentDir = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};
const currentDir = getCurrentDir();

export interface MigrationRecord {
  id: string;
  name: string;
  appliedAt: string;
}

export class SchemaMigrator {
  private migrationsDir: string;

  constructor() {
    this.migrationsDir = path.resolve(currentDir, 'migrations');
  }

  /**
   * Run all pending migrations against Postgres pool or local state
   */
  async runMigrations(pool?: pg.Pool | null): Promise<MigrationRecord[]> {
    const applied: MigrationRecord[] = [];
    if (!fs.existsSync(this.migrationsDir)) {
      return applied;
    }

    const migrationFiles = fs
      .readdirSync(this.migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (pool) {
      // Ensure migrations table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const executedResult = await pool.query('SELECT id FROM schema_migrations');
      const executedSet = new Set(executedResult.rows.map(r => r.id));

      for (const file of migrationFiles) {
        const id = file.replace('.sql', '');
        if (!executedSet.has(id)) {
          const sql = fs.readFileSync(path.join(this.migrationsDir, file), 'utf8');
          await pool.query(sql);
          await pool.query('INSERT INTO schema_migrations (id, name) VALUES ($1, $2)', [id, file]);
          applied.push({ id, name: file, appliedAt: new Date().toISOString() });
          console.log(`[Migrator] Applied migration: ${file}`);
        }
      }
    } else {
      // In-memory or local mock execution
      for (const file of migrationFiles) {
        const id = file.replace('.sql', '');
        applied.push({ id, name: file, appliedAt: new Date().toISOString() });
      }
    }

    return applied;
  }
}

export const migrator = new SchemaMigrator();
