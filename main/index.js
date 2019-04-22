"use strict";
exports.__esModule = true;
var electron = require("electron");
var app = electron.app, BrowserWindow = electron.BrowserWindow, ipc = electron.ipcMain, dialog = electron.dialog;
var electron_1 = require("electron");
var path = require("path");
var crypto = require("crypto");
var url = require("url");
var sftp_1 = require("./sftp");
var ssh_1 = require("./ssh");
var ProgressBar = require('electron-progressbar');
var ElectronStore = require('electron-store');
var win;
var isDevelopment = process.env.NODE_ENV !== 'production';
var db = new ElectronStore();
function createWindow() {
    win = new BrowserWindow({
        // nodeIntegration: false,
        // nodeIntegrationInWorker: false,
        width: 800,
        height: 1200,
        icon: path.join(__dirname, 'src/assets/img/terminal.png')
    });
    if (isDevelopment) {
        win.webContents.openDevTools();
        win.loadURL("http://localhost:" + 4200);
    }
    else {
        // load the dist folder from Angular
        // win.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
        win.loadURL(url.format({
            pathname: path.join(__dirname, '..', 'dist', 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
    // win.once('show', listenEvents);
    // The following is optional and will open the DevTools:
    // win.webContents.openDevTools()
    win.on('closed', function () {
        win = null;
    });
}
function hash(word) {
    return crypto.createHash('md5').update(word).digest('hex');
}
// --> Progress Bar
function showProgressBar(text, details) {
    var bar = new ProgressBar({ text: text, details: details });
    bar.on('completed', function () {
        bar.detail = 'Task completed. Exiting...';
    })
        .on('aborted', function () { return console.warn("aborted..."); });
    return bar;
}
function closeProgressBar(bar) {
    bar.setCompleted();
}
// Progress Bar <--
function displayNotification(msg, type) {
    var opts = {
        title: 'Remote Client',
        subtitle: type,
        body: msg
    };
    var notif = new electron_1.Notification(opts);
    notif.show();
}
app.on('ready', createWindow);
// on macOS, closing the window doesn't quit the app
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
// initialize the app's main window
app.on('activate', function () {
    if (win === null) {
        createWindow();
    }
});
ipc.addListener('check-user-exists', function (event, arg) {
    var userExists = db.has('user');
    console.log('User exists: ' + userExists);
    event.sender.send('user-exist-' + userExists);
});
ipc.addListener('ask-connections', function (event, arg) {
    var data = db.get('connections');
    event.sender.send('get-connections', data);
});
/**
 * POST user
 */
ipc.addListener('post-user', function (event, user) {
    console.log(user);
    user.password = hash(user.password);
    user.createdAt = new Date();
    console.log(user);
    // Save user
    db.set('user', user);
    // return event
    event.sender.send('current-user', user);
});
/**
 * @event POST connection
 * @desc Save a connection config
 */
ipc.addListener('post-connection', function (event, item) {
    console.log(item);
    item.owner = db.get('user');
    var connexions = {};
    // Init object
    if (db.has('connections')) {
        console.log('connexion exists');
        connexions = db.get('connections');
    }
    else {
        console.log('No connexion yet');
        db.set('connections', {});
    }
    // Check if the connexion exists
    if (!connexions[item.name]) {
        db.set('connections.' + item.name, item);
        event.sender.send('get-connections', db.get('connections'));
    }
    else {
        event.sender.send('error', 'The connexion name alreaydy exists.');
    }
});
ipc.addListener('selectDirectory', function (event) {
    console.log('openDirectory');
    dialog.showOpenDialog({ properties: ['openDirectory'] }, function (dirPath) { return event.sender.send('directorySelected', dirPath[0]); });
    // console.log(dirPath);
});
/** @var conn */
var conn;
var config;
/**
 * @event connect
 * @desc Open a connection
 */
ipc.addListener('connect', function (event, name) {
    config = db.get('connections.' + name);
    if (!config) {
        event.sender.send('sftp-error', "Connection " + name + " doest not exists");
        return;
    }
    // console.log(config);
    conn = new sftp_1["default"](config);
    // conn.interactiveSession();
    conn.startSftp(event)
        .then(function (res) { return event.sender.send('sftp-root', res); })["catch"](function (error) { return event.sender.send('error', error.message); });
});
/**
 * @event Execute
 * @desc Execute a command
 */
ipc.addListener('execute', function (event, cmd) {
    if (!config) {
        event.sender.send('sftp-error', "Connection " + name + " doest not exists");
        return;
    }
    // conn.endConnection();
    var ssh = new ssh_1.Ssh(config);
    /*
                        //@@@.
                    .///////@@@@@@@&.
               ,////////////@@@@@@@@@@@@@/
          ./////////////////#@@@@@@@@@@@@@@@@@,
     ,/////////////////.         ,&@@@@@@@@@@@@@@@@#
    /////////////.                     %@@@@@@@@@@@@@
    /////////.                             .%@@@@@@@@
    //////.                                   /@@@@@@
    ///////     @@%     .@@/    .@@@@@@/      %@@@@@@
    .//////     @@@@(   .@@/   @@@%. ,@@@#    @@@@@@&
    .//////     @@%@@@  .@@/  &@@             @@@@@@(
     //////     @@# ,@@@.@@/  @@@   &@@@@@.   @@@@@@.
     //////,    @@#   %@@@@/  ,@@@    *@@#   ,@@@@@@
     //////.    @@#     @@@/    @@@@@@@@,    #@@@@@@
     ,//////                                 @@@@@@&
     .//////                                 @@@@@@/
      //////.      @@@  @@@  @@  @ @@@@     .@@@@@@.
      //////,     @    @   @ @ @ @ @==      (@@@@@@
      .//////      @@@  @@@  @  @@ @        &@@@@@@
      .///////.                           %@@@@@@@&
       ///////////                    ,@@@@@@@@@@@(
         ,///////////,             #@@@@@@@@@@@&
            .///////////.       &@@@@@@@@@@@%
               ./////////////@@@@@@@@@@@@*
                  ./////////@@@@@@@@@@,
                      ./////@@@@@@%
                         .//@@@#*/
    // Execute command
    ssh.execute(cmd, event)
        .then(function (ok) { return event.sender.send('sftp-response', ok); })["catch"](function (err) { return event.sender.send('sftp-error', err.message); });
});
/**
 * @event Navigate
 */
ipc.addListener('sftp-navigate', function (event) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    conn.getChildrenData(args[0], args[1], event)
        .then(function (data) { return event.sender.send('sftp-folder', data); })["catch"](function (err) { return event.sender.send('sftp-error', err.message); });
});
/**
 * @event Move
 */
ipc.addListener('sftp-move', function (event, args) {
    //
});
/**
 * @event download
 */
ipc.addListener('sftp-download', function (event, remote) {
    // Open dialog
    dialog.showSaveDialog(win, {}, function (filename) {
        var bar = showProgressBar('Download is processing, please wait', '');
        conn.download(remote, filename)
            .then(function (data) {
            event.sender.send('sftp-download', data);
            closeProgressBar(bar);
        })["catch"](function (err) {
            closeProgressBar(bar);
            event.sender.send('sftp-error', err.message);
        });
    });
});
/**
 * @event upload
 */
ipc.addListener('sftp-upload', function (event, local) {
    // Open dialog
    dialog.showSaveDialog(win, {}, function (filename) {
        // Show ProgressBar
        var bar = showProgressBar('Upload is processing, please wait', '');
        conn.upload(filename, local)
            .then(function (data) {
            event.sender.send('sftp-upload', data);
            closeProgressBar(bar);
        })["catch"](function (err) {
            closeProgressBar(bar);
            event.sender.send('sftp-error', err.message);
        });
    });
});
ipc.addListener('disconnect', function (event) { return conn.endConnection(); });
