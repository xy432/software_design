import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class CanvasCommand implements Command {
  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return false;
  }

  recordInHistory(): boolean {
    return false;
  }

  execute(context: EditorContext): string[] {
    const document = context.getDocument();
    if (this.tokens.length === 1) {
      return [`canvas ${this.format(document.getWidth())}x${this.format(document.getHeight())}`];
    }
    const width = this.tokens[1];
    const height = this.tokens[2];
    if (width === undefined || height === undefined) {
      throw new Error("usage: canvas [w] [h]");
    }
    document.resize(this.parse(width), this.parse(height));
    context.lockHistory();
    return [`canvas resized to ${this.format(document.getWidth())}x${this.format(document.getHeight())}`];
  }

  undo(): string[] {
    throw new Error("undo not allowed after io command");
  }

  private parse(token: string): number {
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
