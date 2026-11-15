import * as fs from 'fs';
import * as path from 'path';

const dbPath = path.join(process.cwd(), 'ecom.db');
const walPath = path.join(process.cwd(), 'ecom.db-wal');
const shmPath = path.join(process.cwd(), 'ecom.db-shm');
const bakPath = path.join(process.cwd(), 'ecom.db.bak');

console.log('Rebuilding pristine ecom.db...');
if (fs.existsSync(dbPath)) {
  fs.copyFileSync(dbPath, bakPath);
  console.log('Backed up corrupt ecom.db to ecom.db.bak');
  try {
    fs.unlinkSync(walPath);
  } catch {}
  try {
    fs.unlinkSync(shmPath);
  } catch {}
  try {
    fs.unlinkSync(dbPath);
  } catch {}
}

// Now initialize fresh db
import { initDatabase } from '../src/lib/db';
initDatabase();
console.log('Fresh ecom.db created and schema initialized successfully!');
