import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ElectronService } from 'ngx-electron';

export enum connectionTypes { 'ssh' = 1, 'ftp' = 2, 'sftp' = 3 }

@Component({
  selector: 'app-create-connection',
  templateUrl: './create-connection.component.html',
  styleUrls: ['./create-connection.component.scss']
})
export class CreateConnectionComponent implements OnInit {
  choiceTypes = [
    { label: 'ssh', value: 1 }, { label: 'ftp', value: 2 }, { label: 'sftp', value: 3 }
  ];
  passVisible = false;
  passConfVisible = false;
  addConnectionForm: FormGroup;

  constructor(private fb: FormBuilder, private server: ElectronService) { }

  ngOnInit() {
    this.addConnectionForm = this.fb.group({
      'type': new FormControl(1, [Validators.required]),
      'name': new FormControl('', [Validators.required]),
      'host': new FormControl('', [Validators.required]),
      'user': new FormControl('', [Validators.required]),
      'pass': new FormControl('', [Validators.required]),
      'passConf': new FormControl('', [Validators.required]),
      'remotePath': new FormControl(''),
      'localPath': new FormControl('')
    });
    this.server.ipcRenderer.on('get-connections', (event, data) => {
      console.log(data);
    });
    this.server.ipcRenderer.on('error', (event, msg: string) => {
      console.error(msg);
    });
  }

  register(event: Event) {
    if (this.addConnectionForm.valid) {
      this.server.ipcRenderer.send('post-connection', this.addConnectionForm.value);
      console.log(this.addConnectionForm.value);
    } else {
      console.log('ko');
    }
  }

  openFolder(event: Event) {
    this.server.ipcRenderer.send('selectDirectory');
    this.server.ipcRenderer.on('directorySelected', (event: Event, dir: string) => {
      console.log(dir);
      this.addConnectionForm.controls['localPath'].setValue(dir);
    });
  }

}
