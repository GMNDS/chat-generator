import { browser } from '$app/environment';
import { handleError } from '../utils/errorHandler';
import { isValidAppState } from '../utils/validation';
import type { AppState } from '../types';
import { loadState as loadLegacyState, clearStorage as clearLegacyStorage } from './storageService';

const STATE_KEY = 'app_state';
const SAVE_DEBOUNCE_MS = 200;

type PGliteClient = import('@electric-sql/pglite').PGlite;

let dbPromise: Promise<PGliteClient | null> | null = null;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingState: AppState | null = null;

async function initDb(): Promise<PGliteClient | null> {
  if (!browser) return null;

  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const { PGlite } = await import('@electric-sql/pglite');
        // Use IndexedDB storage in the browser to avoid NodeFS resolution issues
        const db = await PGlite.create('idb://chat-generator', {
          relaxedDurability: true,
        });
        await db.exec('CREATE TABLE IF NOT EXISTS kv (key text primary key, value jsonb)');
        return db as PGliteClient;
      } catch (err) {
        handleError(err, { action: 'pglite:init' });
        return null;
      }
    })();
  }

  return dbPromise;
}

async function writeState(state: AppState): Promise<void> {
  const db = await initDb();
  if (!db) return;

  try {
    await db.query(
      'INSERT INTO kv (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
      [STATE_KEY, state]
    );
  } catch (err) {
    handleError(err, { action: 'pglite:writeState' });
  }
}

export async function loadPersistedState(): Promise<AppState | null> {
  const db = await initDb();
  if (!db) return null;

  try {
    const result = await db.query('SELECT value FROM kv WHERE key = $1', [STATE_KEY]);
    const raw = (result?.rows?.[0] as { value?: unknown } | undefined)?.value;
    if (!raw) return null;

    if (!isValidAppState(raw)) {
      handleError(new Error('Invalid state in pgLite'), {
        action: 'pglite:loadPersistedState',
        data: { raw },
      });
      return null;
    }

    return raw as AppState;
  } catch (err) {
    handleError(err, { action: 'pglite:loadPersistedState' });
    return null;
  }
}

export function savePersistedState(state: AppState): void {
  pendingState = state;

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    if (!pendingState) return;
    void writeState(pendingState);
    pendingState = null;
    saveTimeout = null;
  }, SAVE_DEBOUNCE_MS);
}

export function flushPendingSave(): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }

  if (pendingState) {
    void writeState(pendingState);
    pendingState = null;
  }
}

export async function clearPersistedState(): Promise<void> {
  const db = await initDb();
  if (db) {
    try {
      await db.query('DELETE FROM kv WHERE key = $1', [STATE_KEY]);
    } catch (err) {
      handleError(err, { action: 'pglite:clearPersistedState' });
    }
  }

  clearLegacyStorage();
}

export async function migrateLegacyLocalStorage(): Promise<AppState | null> {
  if (!browser) return null;

  const legacyState = loadLegacyState();
  if (!legacyState) return null;

  if (!isValidAppState(legacyState)) {
    handleError(new Error('Invalid legacy state'), {
      action: 'pglite:migrateLegacy',
      data: { legacyState },
    });
    return null;
  }

  await writeState(legacyState);
  clearLegacyStorage();
  return legacyState;
}
