import * as electron from 'electron';
const app = electron.app, BrowserWindow = electron.BrowserWindow,
ipc = electron.ipcMain, dialog = electron.dialog;
import { Notification, NotificationConstructorOptions, EventEmitter } from 'electron';
import * as path from 'path';
import * as crypto from 'crypto';
import * as url from 'url';
import Sftp from './sftp';
import { Connexion } from './Connexion';
import { Ssh } from './ssh';
const ProgressBar = require('electron-progressbar');
const ElectronStore = require('electron-store');
let win: electron.BrowserWindow;
const isDevelopment = process.env.NODE_ENV !== 'production';
const db = new ElectronStore();

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
        win.loadURL(`http://localhost:${4200}`);
    } else {
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

function hash(word: string) {
    return crypto.createHash('md5').update(word).digest('hex');
}

// --> Progress Bar
function showProgressBar(text: string, details: string) {
    const bar = new ProgressBar({ text: text, details: details });
    bar.on('completed', () => {
        bar.detail = 'Task completed. Exiting...';
      })
      .on('aborted', () => console.warn(`aborted...`));
      return bar;
}

function closeProgressBar(bar: any) {
    bar.setCompleted();
}
// Progress Bar <--

function displayNotification(msg: string, type: string) {
    const opts: NotificationConstructorOptions = {
        title: 'Remote Client',
        subtitle: type,
        body: msg
    };
    const notif = new Notification(opts);
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

ipc.addListener('check-user-exists', (event, arg) => {
    const userExists = db.has('user');
    console.log('User exists: ' + userExists);
    event.sender.send('user-exist-' + userExists);
});

ipc.addListener('ask-connections', (event, arg) => {
    const data = db.get('connections');
    event.sender.send('get-connections', data);
});

/**
 * POST user
 */
ipc.addListener('post-user', (event, user) => {
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
ipc.addListener('post-connection', (event, item: any) => {
    console.log(item);
    item.owner = db.get('user');
    let connexions: {[key: string]: any} = {};
    // Init object
    if (db.has('connections')) {
        console.log('connexion exists');
        connexions = db.get('connections');
    } else {
        console.log('No connexion yet');
        db.set('connections', {});
    }
    // Check if the connexion exists
    if (!connexions[item.name]) {
        db.set('connections.' + item.name, item);
        event.sender.send('get-connections', db.get('connections'));
    } else {
        event.sender.send('error', 'The connexion name alreaydy exists.');
    }
});

ipc.addListener('selectDirectory', (event) => {
    console.log('openDirectory');
    dialog.showOpenDialog({ properties: ['openDirectory'] },
        (dirPath: string[]) => event.sender.send('directorySelected', dirPath[0]));
    // console.log(dirPath);
});

/** @var conn */
let conn: Sftp;
let config: Connexion;

/**
 * @event connect
 * @desc Open a connection
 */
ipc.addListener('connect', (event, name) => {
    config = db.get('connections.' + name);
    if (!config) {
        event.sender.send('sftp-error', `Connection ${name} doest not exists`);
        return;
    }
    // console.log(config);
    conn = new Sftp(config);
    // conn.interactiveSession();
    conn.startSftp(event)
        .then(res =>  event.sender.send('sftp-root', res))
        .catch(error =>  event.sender.send('error', error.message));
});

/**
 * @event Execute
 * @desc Execute a command
 */
ipc.addListener('execute', (event, cmd) => {
    if (!config) {
        event.sender.send('sftp-error', `Connection ${name} doest not exists`);
        return;
    }
    // conn.endConnection();
    const ssh = new Ssh(config);
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
        .then((ok: boolean) => event.sender.send('sftp-response', ok))
        .catch((err: Error) => event.sender.send('sftp-error', err.message));
});

/**
 * @event Navigate
 */
ipc.addListener('sftp-navigate', (event: any, ...args: any[]) => {
    conn.getChildrenData(args[0], args[1], event)
        .then((data) => event.sender.send('sftp-folder', data))
        .catch((err) => event.sender.send('sftp-error', err.message));
});

/**
 * @event Move
 */
ipc.addListener('sftp-move', (event: any, args: { from: string, to: string }) => {
    //
});

/**
 * @event download
 */
ipc.addListener('sftp-download', (event: any, remote: string) => {
    // Open dialog
    dialog.showSaveDialog(win, {}, (filename) => {
        const bar = showProgressBar('Download is processing, please wait', '');
        conn.download(remote, filename)
            .then((data) => {
                event.sender.send('sftp-download', data);
                closeProgressBar(bar);
            })
            .catch((err) => {
                closeProgressBar(bar);
                event.sender.send('sftp-error', err.message);
            });
    });
});

/**
 * @event upload
 */
ipc.addListener('sftp-upload', (event: any, local: string) => {
    // Open dialog
    dialog.showSaveDialog(win, {}, (filename) => {
        // Show ProgressBar
        const bar = showProgressBar('Upload is processing, please wait', '');
        conn.upload(filename, local)
            .then((data) => {
                event.sender.send('sftp-upload', data);
                closeProgressBar(bar);
            })
            .catch((err) => {
                closeProgressBar(bar);
                event.sender.send('sftp-error', err.message);
            });
        });
});

ipc.addListener('disconnect', (event) => conn.endConnection());

