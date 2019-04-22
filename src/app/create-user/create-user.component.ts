import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ElectronService } from 'ngx-electron';

import { User } from '../models/User';
import { EventEmitter } from 'electron';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {

  passVisible = false;
  passConfVisible = false;
  registerForm: FormGroup;
  user: User;

  constructor(private fb: FormBuilder, private server: ElectronService) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
        'user': new FormControl('', [Validators.required]),
        'email': new FormControl('', [Validators.required, Validators.email]),
        'pass': new FormControl('', [Validators.required]),
        'passConf': new FormControl('', [Validators.required])
    });
  }

  register(event: Event) {
    if (this.registerForm.valid) {
      const user: User = {
        userName: this.registerForm.value.user,
        email: this.registerForm.value.email,
        password: this.registerForm.value.pass,
      };
      this.server.ipcRenderer.send('post-user', user);
      this.server.ipcRenderer.on('current-user',
        (event: EventEmitter, data: User) => console.log(this.user = data));
        console.log(user);
    } else {
      console.log('ko');
    }
  }

}
