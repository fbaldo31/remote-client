import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ITreeNode, FileInfo } from '../models/File';
import { MenuItem, TreeNode } from 'primeng/api';
@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss']
})
export class ConnectComponent implements OnInit, OnDestroy {

  public isLoading: boolean;
  public connection: string;
  @Input() selected: ITreeNode;
  public currentFolder: ITreeNode[];
  public tree: ITreeNode[] = [];
  private treeLevel = 0;
  private currentPath = '/';
  name: string;
  contextMenu: MenuItem[] = [
    { label: 'Copy', icon: 'fas fa-copy' },
    { label: 'Cut', icon: 'fas fa-cut' },
    { label: 'Paste', icon: 'fas fa-paste' },
  ];
  copied: string;
  cuted: string;

  constructor(
    private route: ActivatedRoute,
    private server: ElectronService,
    private router: Router) { }

  ngOnInit() {
    this.isLoading = true;
    this.route.params.subscribe((params: Params) => {
      this.connection = params.name;
      console.log('Try to connect to ' + this.connection);
      this.connect(params.name);
    });
    this.listenEvents();
  }

  connect(serverName: string) {
    this.isLoading = true;
    this.server.ipcRenderer.send('connect', serverName);
  }

  listenEvents() {
    // Root Data
    this.server.ipcRenderer.on('sftp-root', (event, data) => {
      this.tree = this.handleResult(data);
      this.currentPath = '/';
      this.currentFolder = this.tree;
      this.selected = {
        label: '/',
        type: 'd',
        children: this.tree,
        fullPath: '/',
        data: data
      };
      console.log('sftp-root', this.tree);
      this.isLoading = false;
    });

    // Folder Data
    this.server.ipcRenderer.on('sftp-folder', (event, data) => {
      // console.log('sftp-folder', event,  data);
      this.selected.children = this.handleResult(data);
      this.updateTreeContent(this.selected.children, this.tree);
      this.currentFolder = this.handleResult(data);
      this.selected.children = this.currentFolder;
      this.isLoading = false;
    });

    // this.server.ipcRenderer.on('sftp-error', (event, error) => {
    //   console.error(error);
    //   this.isLoading = false;
    // });
  }

  disconnect() {
    this.server.ipcRenderer.send('disconnect');
    this.router.navigate(['/connect']);
  }

  execute(event: string) {
    console.log(event);
    switch (event) {
      case 'download':
      case 'upload':
        if (this.selected.type === 'd') {
          return;
        }
        this.server.ipcRenderer.send('sftp-' + event, this.selected.fullPath);
        break;
      default: console.error('Unhandled command to execute.');
        return;
    }
  }

  /**
   * @desc Make ITreeNode from FileInfo
   */
  private handleResult(data: FileInfo[]|Error): ITreeNode[] {
    if (data instanceof Error) {
      throw data;
    }
    // console.log(data);
    return data.map((e: FileInfo) => {
      const forbidden = e.rights.group === '';
      const style = forbidden ? 'ban fa' : '';
      let icon = 'fas ';
      icon += e.type === 'd' ? (e.children ? 'fa-folder fa-w-16 fa-lg' : 'fa-folder')
        // (forbidden ? 'fa-folder' : 'fa-folder') : // folder icon
        // (forbidden ? 'fa-file' : 'fa-file');    // file icon
        : 'fa-file';
      // console.log('Convert response ', e.name, icon);
      return <ITreeNode>{
        label: e.name,
        icon: icon,
        expandedIcon: e.type === 'd' ? 'fas fa-folder-open' : undefined,
        collapsedIcon: e.type === 'd' ? 'fas fa-folder' : undefined,
        type: e.type,
        styleClass: e.type === 'd' ? style + 'folder' : style + 'file',
        data: e,
        draggable: !forbidden,
        droppable: !forbidden,
        selectable: !forbidden,
        leaf: e.children ? true : null,
        fullPath: '',
        children: e.children ? this.handleResult(e.children) : null
      };
    }).map((e) => {
      return e = this.addPathAndParent(e);
    });
  }

  /**
   * @desc Add recusively the fullPath and the parent to each element
   */
  addPathAndParent(treeNode: ITreeNode, parent?: ITreeNode): ITreeNode {
    if (parent) {
      treeNode.fullPath = `${parent.fullPath}/${treeNode.label}`;
      treeNode.parent = parent;
    } else {
      const currentPath = this.currentPath === '/' ? this.currentPath : this.currentPath + '/';
      treeNode.fullPath = currentPath + treeNode.label;
    }
    if (treeNode.children) {
      treeNode.children = treeNode.children.map((e) => {
        return e = this.addPathAndParent(e, treeNode);
      });
    }
    return treeNode;
  }

  /**
   * @desc Update recursively tree content
   */
  updateTreeContent(content: ITreeNode[], tree: ITreeNode[]) {
    // Loop on folder
    tree.forEach(node => {
      if (node.fullPath === this.currentPath) {
        node.children = content;
      } else if (node.children && node.children.length) {
        // repeat if needed on children
        this.updateTreeContent(content, node.children);
      }
    });
  }

  openFolder(event: any) {
    this.isLoading = true;
    // console.log(event.node);
    this.selected = event.node;
    this.currentPath = this.selected.fullPath;
    const tree = this.selected.children.map((e: ITreeNode) => {
      return e.data;
    });
    console.log('open', this.selected);
    this.treeLevel++;
    this.server.ipcRenderer.send('sftp-navigate', this.selected.fullPath, tree, event);
    // console.log('open', this.treeLevel, this.currentPath, this.selected.fullPath);
  }

  closeFolder(event: any) {
    if (this.treeLevel === 1) {
      this.currentPath = '/';
      return;
    }
    const paths = this.currentPath.split('/');
    this.currentPath = paths.splice(paths.length - 1).join('/');
    this.treeLevel--;
    console.log('close', this.treeLevel, this.currentPath);
  }

  selectTreeNode(event: any) {
    this.selected = event.node;
    // Reconstruct the path
    const paths = this.currentPath.split('/');
    this.treeLevel = paths.findIndex(item => item === this.selected.label);
    this.currentPath = paths.slice(undefined, this.treeLevel).join('/');
    console.log('select', this.treeLevel, this.currentPath);
  }

  copy(event: any) {
    this.copied = this.selected.fullPath;
    console.log(this.copied, event.node);
  }

  paste(event: any) {
    this.isLoading = true;
    if (!this.copied && !this.cuted) {
      return;
    }
    if (this.copied && this.cuted) {
      throw new Error(this.copied + this.cuted);
    }
    const toMove = this.copied ? this.copied : this.cuted;
    this.server.ipcRenderer.send('sftp-move', { from: toMove, to: event.node });
  }

  cut() {
    this.cuted = this.selected.fullPath;
  }

  ngOnDestroy() {
    this.currentPath = '';
    this.server.ipcRenderer.send('disconnect');
  }

}
