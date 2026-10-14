import { Shape } from "../shape/Shape";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class SetCommand implements Command {
  private id = "";
  private attribute = "";
  private previous: string | undefined;
  private hadPrevious = false;

  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return false;
  }

  recordInHistory(): boolean {
    return true;
  }

  execute(context: EditorContext): string[] {
    const id = this.tokens[1];
    const attribute = this.tokens[2];
    const value = this.tokens[3];
    if (id === undefined || attribute === undefined || value === undefined) {
      throw new Error("usage: set <id> <attr> <value>");
    }
    const shape = this.requireShape(context, id);
    this.id = id;
    this.attribute = attribute;
    this.previous = shape.readAttribute(attribute);
    this.hadPrevious = this.previous !== undefined || this.isGeometry(shape, attribute);
    shape.applyAttribute(attribute, value);
    return [this.message(shape, value)];
  }

  undo(context: EditorContext): string[] {
    const shape = this.requireShape(context, this.id);
    if (this.hadPrevious && this.previous !== undefined) {
      shape.applyAttribute(this.attribute, this.previous);
    } else {
      shape.clearAttribute(this.attribute);
    }
    return [this.message(shape, this.previous ?? "")];
  }

  private message(shape: Shape, value: string): string {
    const shown = this.attribute === "text" || value.includes(" ") ? `${this.attribute}="${value}"` : `${this.attribute}=${value}`;
    return `${shape.kind()}#${shape.getId()} updated: ${shown}`;
  }

  private isGeometry(shape: Shape, attribute: string): boolean {
    return shape.readAttribute(attribute) !== undefined;
  }

  private requireShape(context: EditorContext, id: string): Shape {
    const shape = context.getDocument().find(id);
    if (shape === undefined) {
      throw new Error(`no such shape: ${id}`);
    }
    return shape;
  }
}
