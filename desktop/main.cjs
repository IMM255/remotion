const electron = require('electron');
const { app, BrowserWindow, shell, dialog } = electron;
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

if (!app) {
  console.error('Electron berjalan dalam mode Node (ELECTRON_RUN_AS_NODE aktif). Jalankan dengan: npm run desktop');
  process.exit(1);
}

// Use a dedicated local data directory & disable GPU shader disk cache to prevent Windows 0x5 Access Denied cache errors.
const localDataDir = app.isPackaged
  ? path.join(app.getPath('appData'), 'RemotionMotionStudio')
  : path.join(path.resolve(__dirname, '..'), '.electron-data');
try {
  fs.mkdirSync(localDataDir, { recursive: true });
  app.setPath('userData', localDataDir);
  app.setPath('sessionData', path.join(localDataDir, 'session'));
} catch {}
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');
app.commandLine.appendSwitch('disable-gpu-cache');
app.commandLine.appendSwitch('disable-features', 'SkiaGraphite');

let mainWindow = null;
let previewWindow = null;
let server = null;
let stopStudioProcesses = null;

async function waitForLocalUrl(targetUrl, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(targetUrl);
      if (res.ok || res.status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 350));
  }
  return false;
}

async function openRemotionPreviewWindow(targetUrl) {
  if (previewWindow && !previewWindow.isDestroyed()) {
    if (previewWindow.isMinimized()) previewWindow.restore();
    previewWindow.focus();
    previewWindow.reload();
    return;
  }

  previewWindow = new BrowserWindow({
    title: 'Remotion Studio - Preview Timeline',
    width: 1400,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#111111',
    autoHideMenuBar: true,
    show: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  previewWindow.on('closed', () => {
    previewWindow = null;
  });

  await previewWindow.loadURL(
    'data:text/html;charset=utf-8,' +
      encodeURIComponent(
        '<!doctype html><html><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#161514;color:#f6f2eb;font-family:Segoe UI,sans-serif"><div><h2 style="margin:0 0 8px">Menyiapkan Remotion Studio...</h2><p style="margin:0;opacity:.75">Memuat preview timeline lokal (localhost:3000)</p></div></body></html>'
      )
  );

  const ready = await waitForLocalUrl(targetUrl, 25000);
  if (previewWindow && !previewWindow.isDestroyed()) {
    if (ready) {
      await previewWindow.loadURL(targetUrl);
      previewWindow.focus();
    } else {
      await previewWindow.loadURL(
        'data:text/html;charset=utf-8,' +
          encodeURIComponent(
            '<!doctype html><html><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#161514;color:#f6f2eb;font-family:Segoe UI,sans-serif"><div><h2 style="margin:0 0 8px">Remotion Studio belum merespons</h2><p style="margin:0;opacity:.75">Tutup jendela ini lalu klik ulang Buka Remotion Studio.</p></div></body></html>'
          )
      );
    }
  }
}

async function startEmbeddedServer() {
  const rootDir = path.resolve(__dirname, '..');
  const serverMod = await import(pathToFileURL(path.join(rootDir, 'server', 'index.mjs')).href);
  const workspaceMod = await import(pathToFileURL(path.join(rootDir, 'server', 'workspace.mjs')).href);

  stopStudioProcesses = serverMod.stopStudioProcesses;
  await workspaceMod.ensureDirs();
  const projects = await workspaceMod.listProjects();
  if (projects[0]) {
    await workspaceMod.syncProjectToRemotion(projects[0]);
  }

  const httpServer = serverMod.createStudioServer();
  const preferredPort = Number(process.env.STUDIO_PORT || 4100);

  const port = await new Promise((resolve, reject) => {
    const onError = (err) => {
      if (err && err.code === 'EADDRINUSE') {
        httpServer.removeListener('error', onError);
        httpServer.listen(0, '127.0.0.1', () => resolve(httpServer.address().port));
      } else {
        reject(err);
      }
    };
    httpServer.once('error', onError);
    httpServer.listen(preferredPort, '127.0.0.1', () => {
      httpServer.removeListener('error', onError);
      resolve(httpServer.address().port);
    });
  });

  server = httpServer;
  return `http://127.0.0.1:${port}`;
}

async function createWindow() {
  const studioUrl = await startEmbeddedServer();

  mainWindow = new BrowserWindow({
    title: 'Remotion Motion Studio',
    width: 1360,
    height: 880,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#f6f2eb',
    autoHideMenuBar: true,
    show: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Open local Remotion Studio (localhost:3000) inside a native Electron desktop window,
  // while opening external AI websites (Claude, ChatGPT, Gemini, AI Studio) in the default browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^http:\/\/(?:localhost|127\.0\.0\.1):3000(?:\/|$)/i.test(url)) {
      openRemotionPreviewWindow(url);
      return { action: 'deny' };
    }
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  await mainWindow.loadURL(studioUrl);
  mainWindow.show();
  mainWindow.focus();
  console.log(`Remotion Motion Studio Desktop aktif di ${studioUrl}`);
}

function shutdown() {
  try { stopStudioProcesses?.(); } catch {}
  if (server) {
    try { server.close(); } catch {}
    server = null;
  }
}

app.whenReady().then(async () => {
  try {
    await createWindow();
  } catch (err) {
    const msg = err?.stack || err?.message || String(err);
    try { fs.writeFileSync(path.join(path.resolve(__dirname, '..'), 'desktop-error.log'), msg, 'utf8'); } catch {}
    dialog.showErrorBox('Gagal Membuka Remotion Motion Studio', err?.message || String(err));
    app.quit();
  }
});

app.on('before-quit', shutdown);
app.on('window-all-closed', () => {
  shutdown();
  app.quit();
});
