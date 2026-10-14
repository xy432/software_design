import { CommandHistory } from "../command/CommandHistory";
import { CommandRegistry } from "../command/CommandRegistry";
import { EditorContext } from "../command/EditorContext";
import { CommandLineParser } from "./CommandLineParser";

export class EditorSession {
  private readonly context: EditorContext;
  private readonly registry = new CommandRegistry();

  constructor(private readonly parser = new CommandLineParser()) {
    this.context = new EditorContext(new CommandHistory());
  }

  executeLine(line: string): string[] {
    let tokens: string[] | null;
    try {
      tokens = this.parser.parse(line);
    } catch (error) {
      return [this.errorLine(error)];
    }
    if (tokens === null) {
      return [];
    }
    const name = tokens[0];
    if (name === undefined) {
      return [];
    }
    const command = this.registry.create(name, tokens);
    if (command === null) {
      if (!this.context.hasDocument()) {
        return ["error: no document. use 'init' or 'read' first"];
      }
      return [`error: unknown command: ${name}`];
    }
    if (!command.allowsMissingDocument() && !this.context.hasDocument()) {
      return ["error: no document. use 'init' or 'read' first"];
    }
    try {
      const messages = command.execute(this.context);
      if (command.recordInHistory()) {
        this.context.history.push(command);
      }
      return messages;
    } catch (error) {
      return [this.errorLine(error)];
    }
  }

  private errorLine(error: unknown): string {
    const message = error instanceof Error ? error.message : "invalid command";
    return message.startsWith("error:") || message.startsWith("warning:") ? message : `error: ${message}`;
  }
}
