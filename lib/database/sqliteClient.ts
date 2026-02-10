import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
let initPromise: Promise<Database> | null = null;

/**
 * Initialize the SQLite database from the cached or remote file
 */
export async function initDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // Initialize sql.js
      const SQL = await initSqlJs({
        locateFile: (file: string) => `/sql-wasm.wasm`,
      });

      // Fetch the database file
      const response = await fetch('/scholars.db');
      if (!response.ok) {
        throw new Error(`Failed to fetch database: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Create database from file
      db = new SQL.Database(uint8Array);

      console.log('✓ Database initialized successfully');
      return db;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Get the database instance (must be initialized first)
 */
export function getDatabase(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    initPromise = null;
  }
}

/**
 * Execute a SQL query and return results
 */
export function query<T = any>(sql: string, params: any[] = []): T[] {
  const database = getDatabase();
  const results = database.exec(sql, params);

  if (results.length === 0) {
    return [];
  }

  const { columns, values } = results[0];

  return values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, index: number) => {
      obj[col] = row[index];
    });
    return obj as T;
  });
}

/**
 * Execute a SQL query and return the first result
 */
export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const results = query<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}
