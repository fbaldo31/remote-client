import { Client, ClientChannel, ConnectConfig } from 'ssh2';
import { Connexion } from './Connexion';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

export class Ssh {

    client: Client;

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
        this.client = new Client();
        this.config = config;
    }

    execute(command: string, event: any) {
        this.client = new Client();
        this.client.connect(this.connectionParams);
        console.log('Start execute on ' + this.connectionParams.host);
        return new Promise((resolve, reject) => {
            // this.client.on('error', (e) => reject(e));
            this.client
                .on('ready',  (error: Error, chan: ClientChannel) => {
                    if (error) {
                        reject(error.message);
                    }
                    console.log('Ready');
                    // Launch command
                    this.client.shell((err, stream) => {
                        if (err) {
                            reject(err);
                        }

                        stream.on('close', () => {
                            this.client.end();
                            resolve(true);
                        })
                        .on('data', (data) => {
                            console.log(data.toString());
                            event.sender.send('sftp-response', data.toString());
                        })
                        .stdin.on('data', (data) =>  reject(data))
                        .stderr.on('data', (data) =>  reject(data));
                        stream.end(command, () => console.log('Execute'));
                    });
                }
            ).connect(this.connectionParams);
        });
    }
}
