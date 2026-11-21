const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');

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

let mainWindow = null;
let server = null;
let stopStudioProcesses = null;

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
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Open external links (Claude, ChatGPT, Gemini, AI Studio, localhost:3000) in user's default browser
  // so existing browser logins work seamlessly.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  await mainWindow.loadURL(studioUrl);
}

function shutdown() {
  try { stopStudioProcesses?.(); } catch {}
  if (server) {
    try { server.close(); } catch {}
    server = null;
  }
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    try {
      await createWindow();
    } catch (err) {
      dialog.showErrorBox('Gagal Membuka Remotion Motion Studio', err?.message || String(err));
      app.quit();
    }
  });

  app.on('before-quit', shutdown);
  app.on('window-all-closed', () => {
    shutdown();
    app.quit();
  });
}
