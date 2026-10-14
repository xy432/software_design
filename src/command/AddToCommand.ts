import { Group } from "../shape/Group";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class AddToCommand implements Command {
  private shape: Shape | null = null;
  private containerId = "";
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
    const containerId = this.tokens[1];
    const id = this.tokens[2];
    if (containerId === undefined || id === undefined) {
      throw new Error("usage: addto <gid> <id>");
    }
    const document = context.getDocument();
    const container = document.find(containerId);
    const shape = document.find(id);
    if (container === undefined) {
      throw new Error(`no such container: ${containerId}`);
    }
    if (!(container instanceof Group)) {
      throw new Error(`not a container: ${containerId}`);
    }
    if (shape === undefined) {
      throw new Error(`no such shape: ${id}`);
    }
    if (shape === container || shape.isAncestorOf(container)) {
      throw new Error(`cannot group a container into its own descendant: ${shape.getId()}`);
    }
    this.shape = shape;
    this.containerId = containerId;
    this.parentId = shape.getParent()?.getId() ?? null;
    this.index = document.siblingIndex(shape);
    document.detach(shape);
    document.insert(shape, container);
    return [`${shape.kind()}#${shape.getId()} added to g#${container.getId()}`];
  }

  undo(context: EditorContext): string[] {
    const shape = this.shape;
    if (shape === null) {
      throw new Error("nothing to undo");
    }
    const document = context.getDocument();
    document.detach(shape);
    let parent: Group | null = null;
    if (this.parentId !== null) {
      const found = document.find(this.parentId);
      if (!(found instanceof Group)) {
        throw new Error(`no such container: ${this.parentId}`);
      }
      parent = found;
    }
    document.insert(shape, parent, this.index);
    return [`${shape.kind()}#${shape.getId()} moved out of g#${this.containerId}`];
  }
}
