import { Shape } from "./Shape";

export class Group extends Shape {
  private readonly children: Shape[] = [];

  constructor(id: string) {
    super(id);
  }

  kind(): string {
    return "g";
  }

  getChildren(): readonly Shape[] {
    return this.children;
  }

  location(): string {
    return "";
  }

  restoreSnapshot(_values: Record<string, number | string>): void {}

  moveChild(child: Shape, index: number): number {
    const oldIndex = this.children.indexOf(child);
    if (oldIndex < 0) {
      throw new Error(`shape is not a child: ${child.getId()}`);
    }
    this.children.splice(oldIndex, 1);
    const at = Math.min(Math.max(index, 0), this.children.length);
    this.children.splice(at, 0, child);
    return oldIndex;
  }

  insertChildAt(index: number, child: Shape): void {
    this.children.splice(index, 0, child);
    child.bindParent(this);
  }

  removeChild(child: Shape): number {
    const index = this.children.indexOf(child);
    if (index < 0) {
      throw new Error(`shape is not a child: ${child.getId()}`);
    }
    this.children.splice(index, 1);
    child.bindParent(null);
    return index;
  }

  move(dx: number, dy: number): void {
    for (const child of this.children) {
      child.move(dx, dy);
    }
  }

  scale(factor: number): void {
    for (const child of this.children) {
      child.scale(factor);
    }
  }

  snapshot(): Record<string, number | string> {
    return {};
  }

  toSvg(indent: string): string {
    const open = `${indent}<g id="${this.escapeXml(this.getId())}"${this.presentationAttributes()}`;
    if (this.children.length === 0) {
      return `${open}/>`;
    }
    const body = this.children.map((child) => child.toSvg(`${indent}  `)).join("\n");
    return `${open}>\n${body}\n${indent}</g>`;
  }

  protected applyGeometry(_name: string, _value: string): boolean {
    return false;
  }

  protected readGeometry(_name: string): string | undefined {
    return undefined;
  }
}
