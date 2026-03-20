export interface CacooUser {
  name: string;
  nickname: string;
  type: string;
  imageUrl: string;
}

export interface Diagram {
  url: string;
  imageUrl: string;
  imageUrlForApi: string;
  diagramId: string;
  title: string;
  description: string;
  security: string;
  type: string;
  owner: CacooUser;
  ownerName: string;
  ownerNickname: string;
  editing: boolean;
  own: boolean;
  shared: boolean;
  folderId: number;
  folderName: string;
  sheetCount: number;
  created: string;
  updated: string;
}

export interface DiagramList {
  result: Diagram[];
  count: number;
}

export interface Folder {
  folderId: number;
  folderName: string;
  type: string;
  diagramCount: number;
  created: string;
  updated: string;
}

export interface FolderList {
  result: Folder[];
  count: number;
}

export interface Comment {
  commentId: number;
  content: string;
  user: CacooUser;
  created: string;
  updated: string;
}

export interface CommentList {
  result: Comment[];
  count: number;
}

export interface Account {
  name: string;
  nickname: string;
  type: string;
  imageUrl: string;
}

export interface Organization {
  key: string;
  name: string;
  url: string;
  imageUrl: string;
  description: string;
  plan: string;
}

export interface OrganizationList {
  result: Organization[];
  count: number;
}

export type CacooClientOptions =
  | { apiKey: string; baseUrl?: string }
  | { accessToken: string; baseUrl?: string };

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}
