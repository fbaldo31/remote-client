import * as Client from 'ssh2-sftp-client';
import { FileInfo } from 'ssh2-sftp-client';
import * as path from 'path';
import { ConnectConfig, SFTPWrapper, ClientChannel } from 'ssh2';
import { Connexion } from './Connexion';

export interface FileInfoTree extends FileInfo {
    children?: FileInfo[]|void;
}

export default class Sftp {

    private conn: Client;

    private connectionParams: ConnectConfig = {
        host: '',
        username: '',
        password: ''
    };

    private config: Connexion;

    constructor(config: Connexion) {
        this.connectionParams.host = config.host;
        this.connectionParams.username = config.user;
        if (config.pass) {
        this.connectionParams.password = config.pass; }
        if (config.privateKey) {
            this.connectionParams.privateKey = require('fs').readFileSync(config.privateKey); }
        this.conn = new Client();
        this.config = config;
    }

    public edit(item, action: string) {
        // this.conn.exec(cmd, (err: Error, stream: ClientChannel) => {
        //     if (err) { throw err; }

        //     stream.on('close', () => {
        //         console.log('Stream :: close');
        //         this.conn.end();
        //     }).on('data', (data) => {
        //         console.log('STDOUT: ' + data);
        //         this.sendResponse('sftp-message', data);
        //     }).stderr.on('data', (data) => {
        //         console.log('STDERR: ' + data);
        //         this.sendResponse('sftp-error', data);
        //     });
        //     stream.end('ls -l\nexit\n');
        // });
    }

    public async startSftp(event: any): Promise<FileInfoTree[]|Error> {
        let searchPath = '';
        return await this.conn.connect(this.connectionParams)
            .then(() => {
                searchPath += this.config.remotePath || '/';
                return this.conn.list(searchPath);
            })
            .then((data: FileInfo[]) => {
                return this.getChildrenData(searchPath, data, event);
            }).then((tree: FileInfoTree[]) => {
                // console.log(tree);
                return tree;
            })
            .catch((err: Error) => {
                console.error(err);
                event.sender.send('sftp-error', err.message);
                return err;
            });
    }

    public async getChildrenData(searchPath: string, data: FileInfoTree[], event: any): Promise<any> {
        // console.log(searchPath, data);
        const tree: FileInfoTree[] = [];
        return await new Promise((resolve, reject) => {
            data.forEach(async (item: FileInfoTree, i: number) => {
                // Get folder content
                if (item.type === 'd' && item.rights.user.includes('x')) {
                    await this.conn.list(path.join(searchPath, item.name))
                        .then((items: any[]) => {
                            item.children = items;
                            event.sender.send('sftp-message', `open folder ${searchPath}/${item.name}`);
                        })
                        .catch((err: Error) => { // Error should be forbidden
                            event.sender.send('sftp-error', 'Error on path: ' + searchPath + ' ' + err.message);
                            return;
                        });
                } else {
                    console.log(item.name + ' is a file');
                }
                tree.push(item);
                if (i === data.length - 1) {
                    resolve(tree);
                }
            });
        });
    }

    public async upload(from: string, to: string) {
        return await this.conn.fastPut(from, to);
    }

    public async download(from: string, to: string) {
        return await this.conn.fastGet(from, to);
    }

    public endConnection() {
        this.conn.end();
        console.log('Connection closed');
    }
}

