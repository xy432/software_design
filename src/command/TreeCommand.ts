import { Command } from "./Command";
import { EditorContext } from "./EditorContext";
import { TreeText } from "./TreeText";

export class TreeCommand implements Command {
  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return false;
  }

  recordInHistory(): boolean {
    return false;
  }

  execute(context: EditorContext): string[] {
    const id = this.tokens[1];
    const document = context.getDocument();
    const tree = new TreeText();
    if (id === undefined) {
      return [tree.renderDocument(document)];
    }
    const shape = document.find(id);
    if (shape === undefined) {
      throw new Error(`no such shape: ${id}`);
    }
    return [tree.renderShape(shape)];
  }

  undo(): string[] {
    return [];
  }
}
