import type {
  Account,
  CacooClientOptions,
  CacooUser,
  Comment,
  CommentList,
  Diagram,
  DiagramList,
  Folder,
  FolderList,
  Organization,
  OrganizationList,
} from "./types";

const DEFAULT_BASE_URL = "https://cacoo.com/api/v1";

export class CacooApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public body: string,
  ) {
    super(`Cacoo API error: ${status} ${statusText}`);
    this.name = "CacooApiError";
  }
}

export class CacooClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: CacooClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  }

  private async request<T>(
    method: string,
    path: string,
    params?: Record<string, string>,
    body?: Record<string, string>,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.set("apiKey", this.apiKey);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const init: RequestInit = { method };

    if (body) {
      init.headers = { "Content-Type": "application/x-www-form-urlencoded" };
      init.body = new URLSearchParams(body).toString();
    }

    const response = await fetch(url.toString(), init);

    if (!response.ok) {
      const text = await response.text();
      throw new CacooApiError(response.status, response.statusText, text);
    }

    return response.json() as Promise<T>;
  }

  async rawRequest(
    method: string,
    path: string,
    body?: Record<string, string>,
  ): Promise<{ status: number; headers: Record<string, string>; body: unknown }> {
    const url = new URL(`${this.baseUrl}${path}`);
    url.searchParams.set("apiKey", this.apiKey);

    const init: RequestInit = { method: method.toUpperCase() };

    if (body) {
      init.headers = { "Content-Type": "application/x-www-form-urlencoded" };
      init.body = new URLSearchParams(body).toString();
    }

    const response = await fetch(url.toString(), init);
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    if (!response.ok) {
      const text = await response.text();
      throw new CacooApiError(response.status, response.statusText, text);
    }

    const responseBody = await response.json();
    return { status: response.status, headers: responseHeaders, body: responseBody };
  }

  // --- Diagrams ---

  async listDiagrams(params?: {
    offset?: number;
    limit?: number;
    folderId?: number;
    type?: string;
    sort?: string;
  }): Promise<DiagramList> {
    const query: Record<string, string> = {};
    if (params?.offset !== undefined) query.offset = String(params.offset);
    if (params?.limit !== undefined) query.limit = String(params.limit);
    if (params?.folderId !== undefined) query.folderId = String(params.folderId);
    if (params?.type) query.type = params.type;
    if (params?.sort) query.sort = params.sort;
    return this.request<DiagramList>("GET", "/diagrams.json", query);
  }

  async getDiagram(diagramId: string): Promise<Diagram> {
    return this.request<Diagram>("GET", `/diagrams/${diagramId}.json`);
  }

  async deleteDiagram(diagramId: string): Promise<void> {
    await this.request<void>("DELETE", `/diagrams/${diagramId}.json`);
  }

  async copyDiagram(diagramId: string): Promise<Diagram> {
    return this.request<Diagram>("POST", `/diagrams/${diagramId}/copy.json`);
  }

  // --- Comments ---

  async listComments(
    diagramId: string,
    params?: { offset?: number; limit?: number },
  ): Promise<CommentList> {
    const query: Record<string, string> = {};
    if (params?.offset !== undefined) query.offset = String(params.offset);
    if (params?.limit !== undefined) query.limit = String(params.limit);
    return this.request<CommentList>("GET", `/diagrams/${diagramId}/comments.json`, query);
  }

  async createComment(diagramId: string, content: string): Promise<Comment> {
    return this.request<Comment>("POST", `/diagrams/${diagramId}/comments.json`, undefined, {
      content,
    });
  }

  // --- Folders ---

  async listFolders(params?: {
    offset?: number;
    limit?: number;
    type?: string;
  }): Promise<FolderList> {
    const query: Record<string, string> = {};
    if (params?.offset !== undefined) query.offset = String(params.offset);
    if (params?.limit !== undefined) query.limit = String(params.limit);
    if (params?.type) query.type = params.type;
    return this.request<FolderList>("GET", "/folders.json", query);
  }

  async createFolder(name: string): Promise<Folder> {
    return this.request<Folder>("POST", "/folders.json", undefined, {
      folderName: name,
    });
  }

  // --- Account ---

  async getAccount(): Promise<Account> {
    return this.request<Account>("GET", "/account.json");
  }

  // --- Users ---

  async getUser(username: string): Promise<CacooUser> {
    return this.request<CacooUser>("GET", `/users/${username}.json`);
  }

  // --- Organizations ---

  async listOrganizations(): Promise<OrganizationList> {
    return this.request<OrganizationList>("GET", "/organizations.json");
  }

  async getOrganization(orgKey: string): Promise<Organization> {
    return this.request<Organization>("GET", `/organizations/${orgKey}.json`);
  }
}
