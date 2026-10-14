import { SvgDocument } from "../document/SvgDocument";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class InitCommand implements Command {
  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return true;
  }

  recordInHistory(): boolean {
    return false;
  }

  execute(context: EditorContext): string[] {
    const width = this.dimension(this.tokens[1], 800);
    const height = this.dimension(this.tokens[2], 600);
    if ((this.tokens[1] === undefined) !== (this.tokens[2] === undefined)) {
      throw new Error("usage: init [w] [h]");
    }
    context.replaceDocument(new SvgDocument(width, height));
    return [`canvas ${this.format(width)}x${this.format(height)} created`];
  }

  undo(): string[] {
    throw new Error("undo not allowed after io command");
  }

  private dimension(token: string | undefined, fallback: number): number {
    if (token === undefined) {
      return fallback;
    }
    const value = Number(token);
    if (!Number.isFinite(value)) {
      throw new Error(`invalid number: ${token}`);
    }
    return value;
  }

  private format(value: number): string {
    const rounded = Math.round(value * 1e6) / 1e6;
    return String(rounded);
  }
}
