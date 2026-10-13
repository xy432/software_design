import { CommandLineParser } from "./CommandLineParser";
import { HelpText } from "./HelpText";

export class EditorSession {
  constructor(private readonly parser = new CommandLineParser()) {}

  executeLine(line: string): string[] {
    let tokens: string[] | null;
    try {
      tokens = this.parser.parse(line);
    } catch (error) {
      const message = error instanceof Error ? error.message : "error: invalid command";
      return [message];
    }
    if (tokens === null) {
      return [];
    }
    const name = tokens[0];
    if (name === "help") {
      return [HelpText.content];
    }
    return ["error: no document. use 'init' or 'read' first"];
  }
}
