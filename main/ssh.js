"use strict";
exports.__esModule = true;
var ssh2_1 = require("ssh2");
var Ssh = /** @class */ (function () {
    function Ssh(config) {
        this.connectionParams = {
            host: '',
            username: '',
            password: ''
        };
        this.connectionParams.host = config.host;
        this.connectionParams.username = config.user;
        if (config.pass) {
            this.connectionParams.password = config.pass;
        }
        if (config.privateKey) {
            this.connectionParams.privateKey = require('fs').readFileSync(config.privateKey);
        }
        this.client = new ssh2_1.Client();
        this.config = config;
    }
    Ssh.prototype.execute = function (command, event) {
        var _this = this;
        this.client = new ssh2_1.Client();
        this.client.connect(this.connectionParams);
        console.log('Start execute on ' + this.connectionParams.host);
        return new Promise(function (resolve, reject) {
            // this.client.on('error', (e) => reject(e));
            _this.client
                .on('ready', function (error, chan) {
                if (error) {
                    reject(error.message);
                }
                console.log('Ready');
                // Launch command
                _this.client.shell(function (err, stream) {
                    if (err) {
                        reject(err);
                    }
                    stream.on('close', function () {
                        _this.client.end();
                        resolve(true);
                    })
                        .on('data', function (data) {
                        console.log(data.toString());
                        event.sender.send('sftp-response', data.toString());
                    })
                        .stdin.on('data', function (data) { return reject(data); })
                        .stderr.on('data', function (data) { return reject(data); });
                    stream.end(command, function () { return console.log('Execute'); });
                });
            }).connect(_this.connectionParams);
        });
    };
    return Ssh;
}());
exports.Ssh = Ssh;
