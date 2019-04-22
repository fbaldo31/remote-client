"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var Client = require("ssh2-sftp-client");
var path = require("path");
var Sftp = /** @class */ (function () {
    function Sftp(config) {
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
        this.conn = new Client();
        this.config = config;
    }
    Sftp.prototype.edit = function (item, action) {
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
    };
    Sftp.prototype.startSftp = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var searchPath;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        searchPath = '';
                        return [4 /*yield*/, this.conn.connect(this.connectionParams)
                                .then(function () {
                                searchPath += _this.config.remotePath || '/';
                                return _this.conn.list(searchPath);
                            })
                                .then(function (data) {
                                return _this.getChildrenData(searchPath, data, event);
                            }).then(function (tree) {
                                // console.log(tree);
                                return tree;
                            })["catch"](function (err) {
                                console.error(err);
                                event.sender.send('sftp-error', err.message);
                                return err;
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Sftp.prototype.getChildrenData = function (searchPath, data, event) {
        return __awaiter(this, void 0, void 0, function () {
            var tree;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tree = [];
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                data.forEach(function (item, i) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!(item.type === 'd' && item.rights.user.includes('x'))) return [3 /*break*/, 2];
                                                return [4 /*yield*/, this.conn.list(path.join(searchPath, item.name))
                                                        .then(function (items) {
                                                        item.children = items;
                                                        event.sender.send('sftp-message', "open folder " + searchPath + "/" + item.name);
                                                    })["catch"](function (err) {
                                                        event.sender.send('sftp-error', 'Error on path: ' + searchPath + ' ' + err.message);
                                                        return;
                                                    })];
                                            case 1:
                                                _a.sent();
                                                return [3 /*break*/, 3];
                                            case 2:
                                                console.log(item.name + ' is a file');
                                                _a.label = 3;
                                            case 3:
                                                tree.push(item);
                                                if (i === data.length - 1) {
                                                    resolve(tree);
                                                }
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Sftp.prototype.upload = function (from, to) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.conn.fastPut(from, to)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Sftp.prototype.download = function (from, to) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.conn.fastGet(from, to)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Sftp.prototype.endConnection = function () {
        this.conn.end();
        console.log('Connection closed');
    };
    return Sftp;
}());
exports["default"] = Sftp;
