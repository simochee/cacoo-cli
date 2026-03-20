import { CacooCommand } from "../../lib/cacoo-command";
import { createClient, resolveOrg } from "../../lib/client-factory";
import { offsetOption, limitOption, jsonOption, orgOption } from "../../lib/common-options";
import { outputResult, printTable } from "@repo/cli-utils";
import type { Comment } from "@repo/cacoo-api";
import consola from "consola";

const list = new CacooCommand("list")
  .summary("List comments on a diagram")
  .description("List all comments on a specific diagram.")
  .argument("<diagram-id>", "The diagram ID")
  .addOption(offsetOption())
  .addOption(limitOption())
  .addOption(jsonOption())
  .addOption(orgOption())
  .examples([{ description: "List comments", command: "cacoo comment list abc123" }])
  .action(
    async (
      diagramId: string,
      options: { offset?: number; limit?: number; json?: string; org?: string },
    ) => {
      const org = resolveOrg(options.org);
      const client = createClient();
      const result = await client.listComments(diagramId, {
        offset: options.offset,
        limit: options.limit,
      });

      outputResult(result.result, options.json, (comments: Comment[]) => {
        if (comments.length === 0) {
          consola.info("No comments found.");
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
