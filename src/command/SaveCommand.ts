import fs from "node:fs";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class SaveCommand implements Command {
  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return false;
  }

  recordInHistory(): boolean {
    return false;
  }

  execute(context: EditorContext): string[] {
    const document = context.getDocument();
    const file = this.tokens[1] ?? document.getSourcePath();
    if (file === null || file === "") {
      throw new Error("no file path. use 'save <file.svg>'");
    }
    try {
      fs.writeFileSync(file, context.writeSvg(document), "utf8");
    } catch {
      throw new Error(`cannot write file: ${file}`);
    }
    document.setSourcePath(file);
    context.lockHistory();
    return [`saved to ${file} (${document.size()} elements)`];
  }

  undo(): string[] {
    throw new Error("undo not allowed after io command");
  }
}
