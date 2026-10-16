/**
 * ============================================================
 * SAKARIA REPAIR MANAGER - Main Server Entry Point
 * Delegates directly to backend.cjs (Port 3001 / SQLite / JWT)
 * ============================================================
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('./backend.cjs');
