export interface Connexion {
    host: string;
    localPath: string;
    name: string;
    remotePath: string;
    type: number;
    user: string;
    owner: any;
    pass?: string;
    privateKey?: string;
}

