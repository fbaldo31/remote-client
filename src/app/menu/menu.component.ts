import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, Route } from '@angular/router';
import {MenuItem} from 'primeng/api';

import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, AfterViewInit {

  userExists = false;
  menu: MenuItem[];

  constructor(private router: Router, private server: ElectronService) { }

  ngOnInit() {
    this.initMenu();

    // Initialize app
    this.server.ipcRenderer.addListener('user-exist-false', () => {
      console.log('App not initialized');
      // Redirect
      this.router.navigate(['register']);
    });
    // User already exist
    this.server.ipcRenderer.addListener('user-exist-true', () => {
      this.userExists = true;
      console.log('App initialized');
    });
  }

  initMenu() {
    this.menu = // this.server.remote.Menu.buildFromTemplate(
      this.router.config.map((route: Route) => {
      return { label: route.path, routerLink: [route.path] };
        // click: () => this.router.navigate([route.path]) };
   });
   // );
    // this.server.remote.Menu.setApplicationMenu(menu);
  }

  ngAfterViewInit() {
    // Check if a user exists
    this.server.ipcRenderer.send('check-user-exists');
  }

}
