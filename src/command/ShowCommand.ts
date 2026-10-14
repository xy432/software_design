import { Shape } from "../shape/Shape";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class ShowCommand implements Command {
  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return false;
  }

  recordInHistory(): boolean {
    return false;
  }

  execute(context: EditorContext): string[] {
    const id = this.tokens[1];
    if (id === undefined) {
      throw new Error("usage: show <id>");
    }
    const shape = context.getDocument().find(id);
    if (shape === undefined) {
      throw new Error(`no such shape: ${id}`);
    }
    const parent = shape.getParent();
    const parentLabel = parent === null ? "svg" : `${parent.kind()}#${parent.getId()}`;
    const lines = [`${shape.kind()}#${shape.getId()}  parent=${parentLabel}`, `  ${this.geometry(shape)}`];
    for (const name of ["fill", "stroke", "stroke-width"]) {
      const value = shape.readAttribute(name);
      if (value !== undefined) {
        lines.push(`  ${name}=${value}`);
      }
    }
    const text = shape.readAttribute("text");
    if (shape.kind() === "text" && text !== undefined) {
      lines.push(`  text="${text}"`);
    }
    return [lines.join("\n")];
  }

  undo(): string[] {
    return [];
  }

  private geometry(shape: Shape): string {
    if (shape.kind() === "text") {
      return `x=${shape.readAttribute("x")} y=${shape.readAttribute("y")}`;
    }
    if (shape.kind() === "rect") {
      return `x=${shape.readAttribute("x")} y=${shape.readAttribute("y")} width=${shape.readAttribute("width")} height=${shape.readAttribute("height")}`;
    }
    return shape.treeDetail().replace(/ fill=.*$/, "");
  }
}
