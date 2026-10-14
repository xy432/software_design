import { Group } from "../shape/Group";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class MoveCommand implements Command {
  private id = "";
  private dx = 0;
  private dy = 0;

  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return false;
  }

  recordInHistory(): boolean {
    return true;
  }

  execute(context: EditorContext): string[] {
    const parsed = this.parse();
    const shape = this.requireShape(context, parsed.id);
    this.id = parsed.id;
    this.dx = parsed.dx;
    this.dy = parsed.dy;
    shape.move(parsed.dx, parsed.dy);
    return [this.describe(shape, parsed.dx, parsed.dy, false)];
  }

  undo(context: EditorContext): string[] {
    const shape = this.requireShape(context, this.id);
    shape.move(-this.dx, -this.dy);
    return [this.describe(shape, -this.dx, -this.dy, true)];
  }

  private describe(shape: { kind(): string; getId(): string; location(): string }, dx: number, dy: number, back: boolean): string {
    const verb = back ? "moved back" : "moved";
    if (shape instanceof Group) {
      return `${shape.kind()}#${shape.getId()} ${verb} by (${this.format(dx)},${this.format(dy)})`;
    }
    return `${shape.kind()}#${shape.getId()} ${verb} to ${shape.location()}`;
  }

  private parse(): { id: string; dx: number; dy: number } {
    const id = this.tokens[1];
    const dx = this.tokens[2];
    const dy = this.tokens[3];
    if (id === undefined || dx === undefined || dy === undefined) {
      throw new Error("usage: move <id> <dx> <dy>");
    }
    return { id, dx: this.number(dx), dy: this.number(dy) };
  }

  private requireShape(context: EditorContext, id: string) {
    const shape = context.getDocument().find(id);
    if (shape === undefined) {
      throw new Error(`no such shape: ${id}`);
    }
    return shape;
  }

  private number(token: string): number {
    const value = Number(token);
    if (!Number.isFinite(value)) {
      throw new Error(`invalid number: ${token}`);
    }
    return value;
  }

  private format(value: number): string {
    return String(Math.round(value * 1e6) / 1e6);
  }
}
