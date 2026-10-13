import readline from "node:readline";
import { EditorSession } from "../app/EditorSession";
import { HelpText } from "../app/HelpText";

export class CliRepl {
  constructor(
    private readonly session: EditorSession,
    private readonly input: NodeJS.ReadStream = process.stdin,
    private readonly output: NodeJS.WritableStream = process.stdout,
  ) {}

  async run(): Promise<void> {
    this.output.write(`${HelpText.banner}\n`);
    const reader = readline.createInterface({
      input: this.input,
      output: this.output,
      prompt: "svg> ",
      terminal: this.input.isTTY === true,
    });

    reader.prompt();
    for await (const line of reader) {
      for (const message of this.session.executeLine(line)) {
        this.output.write(`${message}\n`);
      }
      reader.prompt();
    }
    reader.close();
  }
}
