import { Group } from "../shape/Group";
import { Shape } from "../shape/Shape";
import { Command } from "./Command";
import { EditorContext } from "./EditorContext";

export class CreateCommand implements Command {
  private createdId = "";

  constructor(private readonly tokens: string[]) {}

  allowsMissingDocument(): boolean {
    return false;
  }

  recordInHistory(): boolean {
    return true;
  }

  execute(context: EditorContext): string[] {
    const parsed = this.parse(context);
    const shape = parsed.shape;
    context.getDocument().insert(shape, parsed.parent);
    this.createdId = shape.getId();
    if (parsed.parent === null) {
      return [`${shape.kind()}#${shape.getId()} created`];
    }
    return [`${shape.kind()}#${shape.getId()} created in ${parsed.parent.kind()}#${parsed.parent.getId()}`];
  }

  undo(context: EditorContext): string[] {
    const shape = context.getDocument().find(this.createdId);
    if (shape === undefined) {
      throw new Error(`no such shape: ${this.createdId}`);
    }
    context.getDocument().detach(shape);
    return [`${shape.kind()}#${shape.getId()} deleted`];
  }

  private parse(context: EditorContext): { shape: Shape; parent: Group | null } {
    const type = this.tokens[1];
    const id = this.tokens[2];
    if (type === undefined || id === undefined) {
      throw new Error("usage: create <type> <id> [params…] [in <containerId>]");
    }
    const { params, containerId } = this.splitContainer(this.tokens.slice(3));
    const document = context.getDocument();
    if (document.find(id) !== undefined) {
      throw new Error(`id already exists: ${id}`);
    }
    const parent = this.resolveParent(document.find(containerId ?? ""), containerId);
    const shape = context.createShape(type, id);
    this.applyParams(shape, params);
    return { shape, parent };
  }

  private splitContainer(tokens: string[]): { params: string[]; containerId?: string } {
    const inIndex = tokens.lastIndexOf("in");
    if (inIndex < 0) {
      return { params: tokens };
    }
    const containerId = tokens[inIndex + 1];
    if (containerId === undefined || inIndex + 2 !== tokens.length) {
      throw new Error("usage: create <type> <id> [params…] [in <containerId>]");
    }
    return { params: tokens.slice(0, inIndex), containerId };
  }

  private resolveParent(found: Shape | undefined, containerId: string | undefined): Group | null {
    if (containerId === undefined) {
      return null;
    }
    if (found === undefined) {
      throw new Error(`no such container: ${containerId}`);
    }
    if (!(found instanceof Group)) {
      throw new Error(`not a container: ${containerId}`);
    }
    return found;
  }

  private applyParams(shape: Shape, params: string[]): void {
    const spec = parameterSpec(shape.kind());
    if (params.length < spec.numbers || params.length > spec.numbers + (spec.optional === null ? 0 : 1)) {
      throw new Error(`usage: create ${shape.kind()} <id> ${spec.usage}`.trim());
    }
    const names = geometryNames(shape.kind());
    for (let index = 0; index < spec.numbers; index += 1) {
      const token = params[index];
      const name = names[index];
      if (token === undefined || name === undefined) {
        throw new Error(`usage: create ${shape.kind()}`);
      }
      if (name === "text") {
        shape.applyAttribute(name, token);
      } else {
        this.requireNumber(token);
        shape.applyAttribute(name, token);
      }
    }
    const optional = params[spec.numbers];
    if (optional !== undefined && spec.optional !== null) {
      shape.applyAttribute(spec.optional, optional);
    }
  }

  private requireNumber(token: string): void {
    if (!Number.isFinite(Number(token))) {
      throw new Error(`invalid number: ${token}`);
    }
  }
}

function parameterSpec(kind: string): { numbers: number; optional: string | null; usage: string } {
  if (kind === "rect") {
    return { numbers: 4, optional: "fill", usage: "<x> <y> <w> <h> [fill]" };
  }
  if (kind === "circle") {
    return { numbers: 3, optional: "fill", usage: "<cx> <cy> <r> [fill]" };
  }
  if (kind === "ellipse") {
    return { numbers: 4, optional: "fill", usage: "<cx> <cy> <rx> <ry> [fill]" };
  }
  if (kind === "line") {
    return { numbers: 4, optional: "stroke", usage: "<x1> <y1> <x2> <y2> [stroke]" };
  }
  if (kind === "text") {
    return { numbers: 3, optional: null, usage: '<x> <y> "content"' };
  }
  if (kind === "g") {
    return { numbers: 0, optional: null, usage: "" };
  }
  return { numbers: 0, optional: null, usage: "" };
}

function geometryNames(kind: string): string[] {
  if (kind === "rect") {
    return ["x", "y", "width", "height"];
  }
  if (kind === "circle") {
    return ["cx", "cy", "r"];
  }
  if (kind === "ellipse") {
    return ["cx", "cy", "rx", "ry"];
  }
  if (kind === "line") {
    return ["x1", "y1", "x2", "y2"];
  }
  if (kind === "text") {
    return ["x", "y", "text"];
  }
  return [];
}
