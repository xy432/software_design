import { Shape } from "../shape/Shape";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class FrontCommand implements Command {
  private id = "";
  private oldIndex = 0;
  private changed = false;

  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return false;
  }

  recordInHistory(): boolean {
    return this.changed;
  }

  execute(context: EditorContext): string[] {
    const shape = this.requireShape(context);
    const document = context.getDocument();
    const target = document.siblingCount(shape) - 1;
    const current = document.siblingIndex(shape);
    this.changed = current !== target;
    if (this.changed) {
      this.oldIndex = document.moveToIndex(shape, target);
    }
    return [`${shape.kind()}#${shape.getId()} brought to front`];
  }

  undo(context: EditorContext): string[] {
    const shape = this.requireShape(context);
    context.getDocument().moveToIndex(shape, this.oldIndex);
    return [`${shape.kind()}#${shape.getId()} sent to back`];
  }

  private requireShape(context: EditorContext): Shape {
    const id = this.id === "" ? this.tokens[1] : this.id;
    if (id === undefined) {
      throw new Error("usage: front <id>");
    }
    const shape = context.getDocument().find(id);
    if (shape === undefined) {
      throw new Error(`no such shape: ${id}`);
    }
    this.id = id;
    return shape;
  }
}
