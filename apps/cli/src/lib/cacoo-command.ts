import { Command } from "commander";

interface Example {
  description: string;
  command: string;
}

export class CacooCommand extends Command {
  readonly cacooExamples: Example[] = [];
  readonly cacooEnvVars: [string, string][] = [];

  examples(examples: Example[]): this {
    this.cacooExamples.push(...examples);
    return this;
  }

  envVars(vars: [string, string][]): this {
    this.cacooEnvVars.push(...vars);
    return this;
  }

  override createCommand(name?: string): CacooCommand {
    return new CacooCommand(name);
  }

  async addCommands(mods: Promise<{ default: Command }>[]): Promise<this> {
    const resolved = await Promise.all(mods);
    for (const mod of resolved) {
      this.addCommand(mod.default);
    }
    return this;
  }

  override helpInformation(): string {
    let help = super.helpInformation();

    if (this.cacooExamples.length > 0) {
      help += "\nExamples:\n";
      for (const ex of this.cacooExamples) {
        help += `  $ ${ex.command}\n`;
        help += `    ${ex.description}\n\n`;
      }
    }

    if (this.cacooEnvVars.length > 0) {
      help += "Environment variables:\n";
      for (const [name, desc] of this.cacooEnvVars) {
        help += `  ${name.padEnd(24)} ${desc}\n`;
      }
      help += "\n";
    }

    return help;
  }
}
