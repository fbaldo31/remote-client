import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import {MenubarModule} from 'primeng/menubar';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {PasswordModule} from 'primeng/password';
import {SelectButtonModule} from 'primeng/selectbutton';
import { ContextMenuModule } from 'primeng/contextmenu';
import {TerminalModule} from 'primeng/terminal';
import {TreeModule} from 'primeng/tree';
import {AccordionModule} from 'primeng/accordion';
import {EditorModule} from 'primeng/editor';

import {NgxElectronModule} from 'ngx-electron';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './menu/menu.component';
import { LoginComponent } from './login/login.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { CreateConnectionComponent } from './create-connection/create-connection.component';
import { ManageConnectionComponent } from './manage-connection/manage-connection.component';
import { PasswordConfirmDirective } from './directives/password-confirm.directive';
import { ConnectComponent } from './connect/connect.component';
import { ExecuteComponent } from './execute/execute.component';

@NgModule({
  declarations: [
    AppComponent,
    MenuComponent,
    ManageConnectionComponent,
    CreateConnectionComponent,
    CreateUserComponent,
    LoginComponent,
    PasswordConfirmDirective,
    ConnectComponent,
    ExecuteComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule, ReactiveFormsModule,
    NgxElectronModule,
    MenubarModule,
    InputTextModule, EditorModule,
    ButtonModule, TerminalModule, AccordionModule,
    PasswordModule, TreeModule, ContextMenuModule,
    SelectButtonModule, CardModule, MenubarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
