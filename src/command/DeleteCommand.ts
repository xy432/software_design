import { Group } from "../shape/Group";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class DeleteCommand implements Command {
  private removed: Shape | null = null;
  private parentId: string | null = null;
  private index = 0;

  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return false;
  }

  recordInHistory(): boolean {
    return true;
  }

  execute(context: EditorContext): string[] {
    const id = this.tokens[1];
    if (id === undefined) {
      throw new Error("usage: delete <id>");
    }
    const document = context.getDocument();
    const shape = document.find(id);
    if (shape === undefined) {
      throw new Error(`no such shape: ${id}`);
    }
    const place = document.detach(shape);
    this.removed = shape;
    this.parentId = place.parent?.getId() ?? null;
    this.index = place.index;
    return [`${shape.kind()}#${shape.getId()} deleted`];
  }

  undo(context: EditorContext): string[] {
    const shape = this.removed;
    if (shape === null) {
      throw new Error("nothing to undo");
    }
    const document = context.getDocument();
    let parent: Group | null = null;
    if (this.parentId !== null) {
      const found = document.find(this.parentId);
      if (!(found instanceof Group)) {
        throw new Error(`no such container: ${this.parentId}`);
      }
      parent = found;
    }
    document.insert(shape, parent, this.index);
    if (parent === null) {
      return [`${shape.kind()}#${shape.getId()} restored`];
    }
    return [`${shape.kind()}#${shape.getId()} restored into ${parent.kind()}#${parent.getId()}`];
  }
}
