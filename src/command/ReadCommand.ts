import fs from "node:fs";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class ReadCommand implements Command {
  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return true;
  }

  recordInHistory(): boolean {
    return false;
  }

  execute(context: EditorContext): string[] {
    const file = this.tokens[1];
    if (file === undefined || file === "") {
      throw new Error("usage: read <file.svg>");
    }
    let xml: string;
    try {
      xml = fs.readFileSync(file, "utf8");
    } catch {
      throw new Error(`cannot read file: ${file}`);
    }
    let result;
    try {
      result = context.readSvg(xml);
    } catch {
      throw new Error(`cannot read file: ${file}`);
    }
    result.document.setSourcePath(file);
    context.replaceDocument(result.document);
    return [...result.warnings, `read ${file} (${result.document.size()} elements)`];
  }

  undo(): string[] {
    throw new Error("undo not allowed after io command");
  }
}
