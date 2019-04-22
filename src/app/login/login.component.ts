import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private server: ElectronService) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      'user': new FormControl('', [Validators.required]),
      'pass': new FormControl('', [Validators.required]),
    });
  }

  login() {
    this.server.ipcRenderer.send('login', this.loginForm.value);
  }

}
