import { SvgDocument } from "../document/SvgDocument";
import { Group } from "../shape/Group";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

interface Placement {
  shape: Shape;
  parentId: string | null;
  index: number;
}

export class GroupCommand implements Command {
  private placements: Placement[] = [];
  private group: Group | null = null;

  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return false;
  }

  recordInHistory(): boolean {
    return true;
  }

  execute(context: EditorContext): string[] {
    const newId = this.tokens[1];
    const ids = this.tokens.slice(2);
    if (newId === undefined || ids.length < 1) {
      throw new Error("usage: group <newGid> <id1> <id2>…");
    }
    const document = context.getDocument();
    if (document.find(newId) !== undefined) {
      throw new Error(`id already exists: ${newId}`);
    }
    const shapes = ids.map((id) => {
      const shape = document.find(id);
      if (shape === undefined) {
        throw new Error(`no such shape: ${id}`);
      }
      return shape;
    });
    this.rejectAncestorMix(shapes);
    const anchor = shapes[0];
    if (anchor === undefined) {
      throw new Error("usage: group <newGid> <id1> <id2>…");
    }
    const parent = anchor.getParent();
    const index = document.siblingIndex(anchor);
    this.placements = shapes.map((shape) => ({
      shape,
      parentId: shape.getParent()?.getId() ?? null,
      index: document.siblingIndex(shape),
    }));
    for (const shape of shapes) {
      document.detach(shape);
    }
    const group = new Group(newId);
    const groupParent = parent instanceof Group ? parent : null;
    const room = groupParent === null ? document.getRoots().length : groupParent.getChildren().length;
    document.insert(group, groupParent, Math.min(index, room));
    for (const shape of shapes) {
      document.insert(shape, group);
    }
    this.group = group;
    return [`g#${newId} created with ${shapes.length} children`];
  }

  undo(context: EditorContext): string[] {
    const group = this.group;
    if (group === null) {
      throw new Error("nothing to undo");
    }
    const document = context.getDocument();
    for (const placement of this.placements) {
      document.detach(placement.shape);
    }
    document.detach(group);
    const ordered = [...this.placements].sort((left, right) => left.index - right.index);
    for (const placement of ordered) {
      document.insert(placement.shape, this.parentOf(document, placement.parentId), placement.index);
    }
    return [`g#${group.getId()} deleted`];
  }

  private parentOf(document: SvgDocument, parentId: string | null): Group | null {
    if (parentId === null) {
      return null;
    }
    const parent = document.find(parentId);
    if (!(parent instanceof Group)) {
      throw new Error(`no such container: ${parentId}`);
    }
    return parent;
  }

  private rejectAncestorMix(shapes: Shape[]): void {
    for (const shape of shapes) {
      for (const other of shapes) {
        if (shape !== other && shape.isAncestorOf(other)) {
          throw new Error(`cannot group a container into its own descendant: ${shape.getId()}`);
        }
      }
    }
  }

}
