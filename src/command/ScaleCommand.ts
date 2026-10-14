import { Group } from "../shape/Group";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class ScaleCommand implements Command {
  private id = "";
  private before: Array<{ id: string; values: Record<string, number | string> }> = [];

  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return false;
  }

  recordInHistory(): boolean {
    return true;
  }

  execute(context: EditorContext): string[] {
    const id = this.tokens[1];
    const factorToken = this.tokens[2];
    if (id === undefined || factorToken === undefined) {
      throw new Error("usage: scale <id> <factor>");
    }
    const factor = Number(factorToken);
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error("scale factor must be positive");
    }
    const shape = this.requireShape(context, id);
    this.id = id;
    this.before = [];
    this.capture(shape);
    shape.scale(factor);
    return [`${shape.kind()}#${shape.getId()} scaled by ${this.format(factor)}`];
  }

  undo(context: EditorContext): string[] {
    const shape = this.requireShape(context, this.id);
    const document = context.getDocument();
    for (const item of this.before) {
      document.find(item.id)?.restoreSnapshot(item.values);
    }
    return [`${shape.kind()}#${shape.getId()} scaled back`];
  }

  private capture(shape: Shape): void {
    this.before.push({ id: shape.getId(), values: { ...shape.snapshot() } });
    if (shape instanceof Group) {
      for (const child of shape.getChildren()) {
        this.capture(child);
      }
    }
  }

  private requireShape(context: EditorContext, id: string): Shape {
    const shape = context.getDocument().find(id);
    if (shape === undefined) {
      throw new Error(`no such shape: ${id}`);
    }
    return shape;
  }

  private format(value: number): string {
    return String(Math.round(value * 1e6) / 1e6);
  }
}
