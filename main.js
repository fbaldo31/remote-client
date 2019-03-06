const _a = require("electron"), app = _a.app, BrowserWindow = _a.BrowserWindow;
const path = require("path");
const url = require("url");
const win;
const isDevelopment = process.env.NODE_ENV !== 'production'

function createWindow() {
    win = new BrowserWindow({ width: 800, height: 600 });

    if (isDevelopment) {
        win.webContents.openDevTools();
        win.loadURL(`http://localhost:${4200}`);
    } else {
        // load the dist folder from Angular
        // win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
        win.loadURL(url.format({
            pathname: path.join(__dirname, "dist", "index.html"),
            protocol: "file:",
            slashes: true
        }));
    }

    
    // The following is optional and will open the DevTools:
    // win.webContents.openDevTools()
    win.on("closed", function () {
        win = null;
    });
}
app.on("ready", createWindow);
// on macOS, closing the window doesn't quit the app
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
// initialize the app's main window
app.on("activate", function () {
    if (win === null) {
        createWindow();
    }
});
