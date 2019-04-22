import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MenuItem } from 'primeng/api';
import {TerminalService} from 'primeng/components/terminal/terminalservice';
import { ITreeNode } from '../models/File';
import { ElectronService } from 'ngx-electron';
@Component({
  selector: 'app-execute',
  templateUrl: './execute.component.html',
  styleUrls: ['./execute.component.scss'],
  providers: [TerminalService]
})
export class ExecuteComponent implements OnInit {

  @Input() selected: ITreeNode;
  @Output() action = new EventEmitter<string>();
  fileMenu: MenuItem[];
  folderMenu: MenuItem[];
  terminalOpened = true;
  logs = '';

  constructor(private terminal: TerminalService, private server: ElectronService) { }

  ngOnInit() {
    this.fileMenu = [
      { label: '', icon: 'fas fa-book-open', command: () => this.open() },
      { label: '', icon: 'fas fa-download', command: () => this.download() },
      { label: '', icon: 'fas fa-lock-open', command: () => this.chmod() },
      { label: '', icon: 'fas fa-window-close', command: () => this.deleteItem() },
      { label: '', icon: 'fas fa-terminal', command: () => this.showHideTerminal() }
    ];
    this.folderMenu = [
      { label: '', icon: 'fas fa-folder-open', command: () => this.navigate()},
      { label: '', icon: 'fas fa-plus', items: [
        { label: 'file', icon: 'fas fa-file', command: () => this.create('file') },
        { label: 'folder', icon: 'fas fa-folder', command: () => this.create('folder') },
      ] },
      { label: '', icon: 'fas fa-lock-open', command: () => this.chmod() },
      { label: '', icon: 'fas fa-window-close', command: () => this.deleteItem() },
      { label: '', icon: 'fas fa-terminal', command: () => this.showHideTerminal() }
    ];
    this.listenEvents();
  }

  /**
   * @todo
   */
  listenEvents() {
    // Messages
    this.server.ipcRenderer.on('sftp-message', (event, data: string) => {
      // console.log('sftp-message', data);
      this.logs += `${data}<br>`;
    });

    // Errors
    this.server.ipcRenderer.on('sftp-error', (event, data: string) => {
      // console.log('sftp-error', data);
      this.logs += `<span style="color: red;">${data}</span><br>`;
    });

    this.terminal.commandHandler
      .subscribe((command: string) => {
        console.log(command);

        this.server.ipcRenderer.send('execute', command);

        this.server.ipcRenderer.on('sftp-response', (event, res) => {
          this.terminal.sendResponse(res);
          this.logs += `${res}<br>`;
        })
        .on('sftp-error', (event, data: string) => {
          // console.log('sftp-error', data);
          this.terminal.sendResponse(data);
          this.logs += `<span style="color: red;">${data}</span><br>`;
      });
    });
  }

  download() {
    this.action.emit('download');
  }

  navigate() {
    this.action.emit('openFolder');
  }

  open() {
    this.action.emit('openFile');
  }

  create(type: 'file'|'folder') {
    this.action.emit('create-file');
  }

  chmod() {
    // @todo
  }

  showHideTerminal() {
    this.terminalOpened = !this.terminalOpened;
  }

  deleteItem() {
    this.action.emit('delete');
  }

}
