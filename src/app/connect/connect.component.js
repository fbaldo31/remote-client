"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var core_1 = require("@angular/core");
var ConnectComponent = /** @class */ (function () {
    function ConnectComponent(route, server) {
        this.route = route;
        this.server = server;
        this.tree = [];
        this.currentPath = '/';
    }
    ConnectComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.isLoading = true;
        this.route.params.subscribe(function (params) {
            _this.connection = params.name;
            console.log('Try to connect to ' + _this.connection);
            _this.connect(params.name);
        });
        this.listenEvents();
    };
    ConnectComponent.prototype.connect = function (serverName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.isLoading = true;
                this.server.ipcRenderer.send('connect', serverName);
                return [2 /*return*/];
            });
        });
    };
    ConnectComponent.prototype.listenEvents = function () {
        var _this = this;
        this.server.ipcRenderer.on('sftp-data', function (event, data) {
            _this.tree = _this.handleResult(data);
            console.log('sftp-data', _this.tree);
            _this.isLoading = false;
        });
        this.server.ipcRenderer.on('sftp-message', function (event, data) {
            console.log(data);
            _this.isLoading = false;
        });
        this.server.ipcRenderer.on('sftp-error', function (event, error) {
            console.error(error);
            _this.isLoading = false;
        });
    };
    ConnectComponent.prototype.disconnect = function () {
        this.server.ipcRenderer.send('disconnect');
        return true;
    };
    ConnectComponent.prototype.openfolder = function (folderName) {
        this.currentPath += '/' + folderName;
        this.server.ipcRenderer.send('sftp-navigate', this.currentPath);
    };
    /**
     * @desc Make TreeNode from FileInfo
     */
    ConnectComponent.prototype.handleResult = function (data) {
        return data.map(function (e) {
            return {
                label: e.name,
                icon: 'fa fa-folder',
                expandedIcon: 'fa fa-folder-open',
                collapsedIcon: 'fa fa-folder',
                type: e.type,
                data: e,
                draggable: true,
                droppable: true,
                selectable: true
            };
        });
    };
    ConnectComponent.prototype.ngOnDestroy = function () {
        this.server.ipcRenderer.send('disconnect');
    };
    ConnectComponent = __decorate([
        core_1.Component({
            selector: 'app-connect',
            templateUrl: './connect.component.html',
            styleUrls: ['./connect.component.scss']
        })
    ], ConnectComponent);
    return ConnectComponent;
}());
exports.ConnectComponent = ConnectComponent;
