import { describe, it, expect, afterEach, mock } from "bun:test";
import { CacooClient, CacooApiError } from "./client";

const MOCK_BASE_URL = "https://mock.cacoo.com/api/v1";

function createClient() {
  return new CacooClient({ apiKey: "test-key", baseUrl: MOCK_BASE_URL });
}

describe("CacooClient", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("listDiagrams", () => {
    it("fetches diagrams with query parameters", async () => {
      const mockResponse = {
        result: [
          {
            diagramId: "abc123",
            title: "Test Diagram",
            ownerName: "user1",
            ownerNickname: "User One",
            sheetCount: 3,
            updated: "2024-01-01",
          },
        ],
        count: 1,
      };

      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const client = createClient();
      const result = await client.listDiagrams({ offset: 0, limit: 10 });

      expect(result.count).toBe(1);
      expect(result.result[0].diagramId).toBe("abc123");
      expect(result.result[0].title).toBe("Test Diagram");

      const calledUrl = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0][0] as string;
      expect(calledUrl).toContain("/diagrams.json");
      expect(calledUrl).toContain("apiKey=test-key");
      expect(calledUrl).toContain("offset=0");
      expect(calledUrl).toContain("limit=10");
    });
  });

  describe("getDiagram", () => {
    it("fetches a single diagram by ID", async () => {
      const mockDiagram = {
        diagramId: "abc123",
        title: "My Diagram",
        url: "https://cacoo.com/diagrams/abc123",
      };

      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockDiagram), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const client = createClient();
      const result = await client.getDiagram("abc123");

      expect(result.diagramId).toBe("abc123");
      expect(result.title).toBe("My Diagram");

      const calledUrl = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0][0] as string;
      expect(calledUrl).toContain("/diagrams/abc123.json");
    });
  });

  describe("deleteDiagram", () => {
    it("sends DELETE request", async () => {
      globalThis.fetch = mock(() => Promise.resolve(new Response("{}", { status: 200 })));

      const client = createClient();
      await client.deleteDiagram("abc123");

      const calledArgs = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0];
      expect(calledArgs[0]).toContain("/diagrams/abc123.json");
      expect((calledArgs[1] as RequestInit).method).toBe("DELETE");
    });
  });

  describe("copyDiagram", () => {
    it("sends POST to copy endpoint", async () => {
      const mockDiagram = { diagramId: "copy123", title: "Copy of Diagram" };

      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockDiagram), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const client = createClient();
      const result = await client.copyDiagram("abc123");

      expect(result.diagramId).toBe("copy123");
      const calledUrl = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0][0] as string;
      expect(calledUrl).toContain("/diagrams/abc123/copy.json");
    });
  });

  describe("listComments", () => {
    it("fetches comments for a diagram", async () => {
      const mockResponse = {
        result: [
          {
            commentId: 1,
            content: "Great work!",
            user: { name: "user1", nickname: "User One" },
            created: "2024-01-01",
          },
        ],
        count: 1,
      };

      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const client = createClient();
      const result = await client.listComments("abc123");

      expect(result.count).toBe(1);
      expect(result.result[0].content).toBe("Great work!");
    });
  });

  describe("createComment", () => {
    it("posts a new comment", async () => {
      const mockComment = {
        commentId: 2,
        content: "New comment",
        user: { name: "user1", nickname: "User One" },
      };

      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockComment), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const client = createClient();
      const result = await client.createComment("abc123", "New comment");

      expect(result.content).toBe("New comment");
      const calledArgs = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0];
      expect((calledArgs[1] as RequestInit).method).toBe("POST");
      expect((calledArgs[1] as RequestInit).body).toContain("content=New+comment");
    });
  });

  describe("listFolders", () => {
    it("fetches folders", async () => {
      const mockResponse = {
        result: [{ folderId: 1, folderName: "My Folder", type: "normal" }],
        count: 1,
      };

      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockResponse), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const client = createClient();
      const result = await client.listFolders();

      expect(result.count).toBe(1);
      expect(result.result[0].folderName).toBe("My Folder");
    });
  });

  describe("getAccount", () => {
    it("fetches account info", async () => {
      const mockAccount = {
        name: "testuser",
        nickname: "Test User",
        type: "free",
        imageUrl: "https://example.com/avatar.png",
      };

      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockAccount), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
      );

      const client = createClient();
      const result = await client.getAccount();

      expect(result.name).toBe("testuser");
      expect(result.nickname).toBe("Test User");
    });
  });

  describe("error handling", () => {
    it("throws CacooApiError on non-ok response", async () => {
      globalThis.fetch = mock(() =>
        Promise.resolve(
          new Response('{"error":"Not found"}', {
            status: 404,
            statusText: "Not Found",
          }),
        ),
      );

      const client = createClient();

      try {
        await client.getDiagram("nonexistent");
        expect(true).toBe(false); // Should not reach
      } catch (err) {
        expect(err).toBeInstanceOf(CacooApiError);
        const apiErr = err as CacooApiError;
        expect(apiErr.status).toBe(404);
        expect(apiErr.statusText).toBe("Not Found");
      }
    });
  });
});
