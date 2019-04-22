import { TreeNode } from 'primeng/api';

export interface FileInfo {
    type: string;
    name: string;
    size: number;
    modifyTime: number;
    accessTime: number;
    rights: {
      user: string;
      group: string;
      other: string;
    };
    owner: number;
    group: number;
    children?: FileInfo[];
}

export interface ITreeNode extends TreeNode {
    fullPath: string;
    data: FileInfo;
    parent?: ITreeNode;
    children?: ITreeNode[];
}
