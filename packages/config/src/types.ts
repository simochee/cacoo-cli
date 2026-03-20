export interface ApiKeyAuth {
  method: "api-key";
  apiKey: string;
}

export interface OAuthAuth {
  method: "oauth";
  accessToken: string;
  refreshToken: string;
  clientId?: string;
  clientSecret?: string;
}

export type CacooAuth = ApiKeyAuth | OAuthAuth;

export interface CacooConfig {
  auth?: CacooAuth;
  baseUrl?: string;
  organization?: string;
}
