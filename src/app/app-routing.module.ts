import { CreateUserComponent } from './create-user/create-user.component';
import { LoginComponent } from './login/login.component';
import { CreateConnectionComponent } from './create-connection/create-connection.component';
import { ManageConnectionComponent } from './manage-connection/manage-connection.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConnectComponent } from './connect/connect.component';
import { ExecuteComponent } from './execute/execute.component';

const routes: Routes = [
  { path: 'connect', component: ManageConnectionComponent },
  { path: 'add-connection', component: CreateConnectionComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: CreateUserComponent },
  { path: 'connect/:name', component: ConnectComponent, children: [
    { path: '', component: ExecuteComponent },
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
