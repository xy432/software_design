import { Group } from "../shape/Group";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class UngroupCommand implements Command {
  private group: Group | null = null;
  private children: Shape[] = [];
  private parentId = "";
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
      throw new Error("usage: ungroup <gid>");
    }
    const document = context.getDocument();
    const shape = document.find(id);
    if (!(shape instanceof Group)) {
      throw new Error(shape === undefined ? `no such shape: ${id}` : `not a container: ${id}`);
    }
    const parent = shape.getParent();
    if (!(parent instanceof Group)) {
      throw new Error(`cannot ungroup top-level container: ${id}`);
    }
    const index = document.siblingIndex(shape);
    const children = [...shape.getChildren()];
    for (const child of children) {
      document.detach(child);
    }
    document.detach(shape);
    children.forEach((child, childIndex) => {
      document.insert(child, parent, index + childIndex);
    });
    this.group = shape;
    this.children = children;
    this.parentId = parent.getId();
    this.index = index;
    return [`g#${id} ungrouped into ${parent.kind()}#${parent.getId()}`];
  }

  undo(context: EditorContext): string[] {
    const group = this.group;
    if (group === null) {
      throw new Error("nothing to undo");
    }
    const document = context.getDocument();
    const parent = document.find(this.parentId);
    if (!(parent instanceof Group)) {
      throw new Error(`no such container: ${this.parentId}`);
    }
    for (const child of this.children) {
      document.detach(child);
    }
    document.insert(group, parent, this.index);
    for (const child of this.children) {
      document.insert(child, group);
    }
    return [`g#${group.getId()} created with ${this.children.length} children`];
  }
}
