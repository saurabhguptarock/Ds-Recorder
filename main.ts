import { app, BrowserWindow, dialog, nativeImage } from "electron";
import * as path from "path";
import * as url from "url";
import { autoUpdater } from "electron-updater";

let win: BrowserWindow = null;
const iconPath = nativeImage.createFromPath(
  path.join(__dirname, "/src/assets/icons/icon.png")
);
const args = process.argv.slice(1),
  serve = args.some(val => val === "--serve");

autoUpdater.on("checking-for-update", () => {
  dialog.showMessageBox({
    title: "Ds Recorder",
    message: "Checking for Update",
    icon: iconPath
  });
});

autoUpdater.on("update-available", info => {
  dialog.showMessageBox({
    title: "Ds Recorder",
    message: `A new update is ready to install
       Version ${info.version} is downloaded and will be automatically installed.`,
    buttons: ["OK"],
    icon: iconPath
  });
});

autoUpdater.on("update-not-available", () => {
  dialog.showMessageBox({
    title: "Ds Recorder",
    message: "There is no update Currently",
    buttons: ["OK"],
    icon: iconPath
  });
});

autoUpdater.on("update-downloaded", info => {
  autoUpdater.quitAndInstall();
});

autoUpdater.on("error", error => {
  dialog.showMessageBox({
    title: "Ds Recorder",
    message: error,
    buttons: ["OK"],
    icon: iconPath
  });
});

function createWindow(): BrowserWindow {
  win = new BrowserWindow({
    x: 0,
    y: 0,
    icon: path.join(__dirname, "/src/assets/icons/icon.ico"),
    show: false,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: serve ? true : false
    }
  });
  if (serve) {
    require("electron-reload")(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL("http://localhost:4200");
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, "dist/index.html"),
        protocol: "file:",
        slashes: true
      })
    );
  }

  if (serve) {
    win.webContents.openDevTools();
  }
  win.on("closed", () => {
    win = null;
    app.quit();
  });
  win.once("ready-to-show", () => {
    win.show();
  });
  win.maximize();
  return win;
}

try {
  app.on("ready", createWindow);
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
  app.on("activate", () => {
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {}
