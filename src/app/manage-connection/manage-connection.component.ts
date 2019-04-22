import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { EventEmitter } from 'events';

@Component({
  selector: 'app-manage-connection',
  templateUrl: './manage-connection.component.html',
  styleUrls: ['./manage-connection.component.scss']
})
export class ManageConnectionComponent implements OnInit {

  isLoading = true;
  connectionNames: string[] = [];
  connections: any = {};

  constructor(private server: ElectronService, private router: Router) { }

  ngOnInit() {
    this.getConnection();
    this.server.ipcRenderer.send('ask-connections');
  }

  getConnection() {
    this.server.ipcRenderer.on('get-connections', (event: EventEmitter, data: any) => {
        console.log('get-connections', data);
        this.connections = data;
        this.connectionNames = Object.keys(data);
        console.log(this.connectionNames);
        this.isLoading = false;
      }
    );
  }
}

