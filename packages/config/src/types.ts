import * as v from "valibot";

export const ApiKeyAuthSchema = v.object({
  method: v.literal("api-key"),
  apiKey: v.string(),
});

export const OAuthAuthSchema = v.object({
  method: v.literal("oauth"),
  accessToken: v.string(),
  refreshToken: v.string(),
  clientId: v.string(),
  clientSecret: v.string(),
});

export const AuthSchema = v.variant("method", [ApiKeyAuthSchema, OAuthAuthSchema]);

export const ConfigSchema = v.object({
  defaultOrganization: v.optional(v.string()),
  auth: v.optional(AuthSchema),
});

export type ApiKeyAuth = v.InferOutput<typeof ApiKeyAuthSchema>;
export type OAuthAuth = v.InferOutput<typeof OAuthAuthSchema>;
export type CacooAuth = v.InferOutput<typeof AuthSchema>;
export type CacooConfig = v.InferOutput<typeof ConfigSchema>;
