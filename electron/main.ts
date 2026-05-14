import { app, BrowserWindow, shell, Menu, dialog } from "electron";
import { appendFileSync, copyFileSync, existsSync, mkdirSync } from "fs";
import { spawn, ChildProcess } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let isDev: boolean;
let mainWindow: BrowserWindow | null = null;
let nextServerProcess: ChildProcess | null = null;

function log(message: string) {
  const logPath = join(app.getPath("userData"), "revoice-electron.log");
  const timestamp = new Date().toISOString();
  appendFileSync(logPath, `[${timestamp}] ${message}\n`, "utf8");
}

process.on("uncaughtException", (error) => {
  app.whenReady().then(() => {
    log(`uncaughtException: ${error.stack || error.message}`);
    dialog.showErrorBox("Unexpected error", `${error.stack || error.message}`);
  });
});

process.on("unhandledRejection", (reason) => {
  app.whenReady().then(() => {
    log(`unhandledRejection: ${reason}`);
    dialog.showErrorBox("Unexpected rejection", `${reason}`);
  });
});

async function loadIsDev() {
  const { default: dev } = await import("electron-is-dev");
  isDev = dev;
}

function getSeedDatabasePath() {
  if (!app.isPackaged) {
    return join(__dirname, "..", "prisma", "dev.db");
  }

  return join(process.resourcesPath, "prisma", "dev.db");
}

function getDataDatabasePath() {
  const userDataDir = app.getPath("userData");
  const databaseDir = join(userDataDir, "prisma");

  if (!existsSync(databaseDir)) {
    mkdirSync(databaseDir, { recursive: true });
  }

  return join(databaseDir, "dev.db");
}

function ensureDatabaseIsWritable() {
  const sourceDbPath = getSeedDatabasePath();
  const destinationDbPath = getDataDatabasePath();

  log(`Database source: ${sourceDbPath}`);
  log(`Database destination: ${destinationDbPath}`);

  if (!existsSync(destinationDbPath)) {
    copyFileSync(sourceDbPath, destinationDbPath);
    log("Database copied to userData");
  }

  process.env.DATABASE_URL = `file:${destinationDbPath}`;
}

async function waitForNextServer(url: string, retries = 50, delayMs = 200) {
  for (let i = 0; i < retries; i += 1) {
    try {
      await fetch(url, { method: "HEAD" });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw new Error(`Next server did not start at ${url}`);
}

async function startNextStandaloneServer() {
  const standalonePath = app.isPackaged
    ? join(process.resourcesPath, "app.asar.unpacked", ".next", "standalone", "server.js")
    : join(__dirname, "..", ".next", "standalone", "server.js");

  log(`Checking for server at: ${standalonePath}`);

  if (!existsSync(standalonePath)) {
    throw new Error(`Server.js not found at ${standalonePath}`);
  }

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: "production",
    PORT: "3000",
    HOSTNAME: "127.0.0.1"
  };

  const execPath = process.execPath;

  nextServerProcess = spawn(execPath, [standalonePath], {
    env,
    cwd: join(standalonePath, ".."),
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (!nextServerProcess.stdout || !nextServerProcess.stderr) {
    throw new Error("Failed to open log streams for Next server process.");
  }

  nextServerProcess.stdout.on("data", (chunk) => {
    log(`next-server stdout: ${chunk.toString().trim()}`);
  });

  nextServerProcess.stderr.on("data", (chunk) => {
    log(`next-server stderr: ${chunk.toString().trim()}`);
  });

  nextServerProcess.on("error", (error) => {
    log(`next-server error: ${error.message}`);
  });

  nextServerProcess.on("exit", (code, signal) => {
    log(`next-server exit: code=${code} signal=${signal}`);
  });

  const nextUrl = "http://127.0.0.1:3000/dashboard";
  await waitForNextServer(nextUrl);
  return nextUrl;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "preload.js"),
    },
  });

  try {
    if (isDev) {
      mainWindow.loadURL("http://localhost:3000/dashboard");
      mainWindow.webContents.openDevTools();
    } else {
      const nextUrl = await startNextStandaloneServer();
      mainWindow.loadURL(nextUrl);
    }
  } catch (error) {
    log(`createWindow error: ${(error as Error).stack || (error as Error).message}`);
    dialog.showErrorBox("Startup error", `${(error as Error).stack || (error as Error).message}`);
  }

  // Open links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

const createMenu = () => {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Exit",
          accelerator: "CmdOrCtrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", role: "undo" },
        { label: "Redo", accelerator: "CmdOrCtrl+Y", role: "redo" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", role: "cut" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", role: "copy" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        {
          label: "Toggle Developer Tools",
          accelerator: "CmdOrCtrl+Shift+I",
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          },
        },
        { type: "separator" },
        { label: "Reload", accelerator: "CmdOrCtrl+R", role: "reload" },
        {
          label: "Hard Reload",
          accelerator: "CmdOrCtrl+Shift+R",
          role: "forceReload",
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template as any);
  Menu.setApplicationMenu(menu);
};

app.whenReady().then(async () => {
  await loadIsDev();
  ensureDatabaseIsWritable();
  await createWindow();
  createMenu();
});

app.on("before-quit", () => {
  if (nextServerProcess) {
    nextServerProcess.kill();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", async () => {
  if (mainWindow === null) await createWindow();
});
