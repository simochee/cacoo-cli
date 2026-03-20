import { CacooCommand } from "../../lib/cacoo-command";
import { createClient } from "../../lib/client-factory";
import { jsonOption, orgOption } from "../../lib/common-options";
import { outputResult } from "@cacoo/cli-utils";
import type { Comment } from "@cacoo/api";

const add = new CacooCommand("add")
  .summary("Add a comment to a diagram")
  .description("Post a new comment on a specific diagram.")
  .argument("<diagram-id>", "The diagram ID")
  .requiredOption("-b, --body <text>", "Comment text")
  .addOption(jsonOption())
  .addOption(orgOption())
  .examples([
    {
      description: "Add a comment",
      command: 'cacoo comment add abc123 --body "Looks good!"',
    },
  ])
  .action(async (diagramId: string, options: { body: string; json?: string; org?: string }) => {
    const client = createClient();
    const comment = await client.createComment(diagramId, options.body);

    outputResult(comment, options.json, (c: Comment) => {
      console.log(`Comment added by ${c.user.nickname ?? c.user.name}`);
      console.log(c.content);
    });
  });

export default add;
