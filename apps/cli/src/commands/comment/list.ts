import { CacooCommand } from "../../lib/cacoo-command";
import { createClient } from "../../lib/client-factory";
import { offsetOption, limitOption, jsonOption } from "../../lib/common-options";
import { outputResult, printTable } from "@cacoo/cli-utils";
import type { Comment } from "@cacoo/api";

const list = new CacooCommand("list")
  .summary("List comments on a diagram")
  .description("List all comments on a specific diagram.")
  .argument("<diagram-id>", "The diagram ID")
  .addOption(offsetOption())
  .addOption(limitOption())
  .addOption(jsonOption())
  .examples([
    {
      description: "List comments",
      command: "cacoo comment list abc123",
    },
  ])
  .action(
    async (diagramId: string, options: { offset?: number; limit?: number; json?: string }) => {
      const client = createClient();
      const result = await client.listComments(diagramId, {
        offset: options.offset,
        limit: options.limit,
      });

      outputResult(result.result, options.json, (comments: Comment[]) => {
        if (comments.length === 0) {
          console.log("No comments found.");
          return;
        }
        printTable(
          ["ID", "USER", "CONTENT", "CREATED"],
          comments.map((c) => [
            String(c.commentId),
            c.user.nickname ?? c.user.name,
            c.content.length > 50 ? c.content.slice(0, 47) + "..." : c.content,
            c.created,
          ]),
        );
      });
    },
  );

export default list;
