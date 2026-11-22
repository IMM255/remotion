import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const electronPath = require('electron');
const rootDir = resolve(import.meta.dirname, '..');

// Ensure Electron launches as a real Desktop GUI app even when invoked from
// an Electron-based IDE terminal that sets ELECTRON_RUN_AS_NODE=1.
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronPath, ['.'], {
  cwd: rootDir,
  stdio: 'inherit',
  env
});

child.on('exit', (code) => process.exit(code ?? 0));
