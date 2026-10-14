import { Shape } from "./Shape";

export class Rect extends Shape {
  constructor(
    id: string,
    private x: number,
    private y: number,
    private width: number,
    private height: number,
  ) {
    super(id);
  }

  kind(): string {
    return "rect";
  }

  move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  scale(factor: number): void {
    this.x *= factor;
    this.y *= factor;
    this.width *= factor;
    this.height *= factor;
  }

  snapshot(): Record<string, number | string> {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  treeDetail(): string {
    return `x=${this.formatNumber(this.x)} y=${this.formatNumber(this.y)} w=${this.formatNumber(this.width)} h=${this.formatNumber(this.height)}${this.fillSuffix()}`;
  }

  location(): string {
    return `(${this.formatNumber(this.x)},${this.formatNumber(this.y)})`;
  }

  restoreSnapshot(values: Record<string, number | string>): void {
    this.x = this.asNumber(values.x);
    this.y = this.asNumber(values.y);
    this.width = this.asNumber(values.width);
    this.height = this.asNumber(values.height);
  }

  toSvg(indent: string): string {
    return `${indent}<rect id="${this.escapeXml(this.getId())}" x="${this.formatNumber(this.x)}" y="${this.formatNumber(this.y)}" width="${this.formatNumber(this.width)}" height="${this.formatNumber(this.height)}"${this.presentationAttributes()}/>`;
  }

  protected applyGeometry(name: string, value: string): boolean {
    const parsed = this.parseNumber(value);
    if (name === "x") {
      this.x = parsed;
      return true;
    }
    if (name === "y") {
      this.y = parsed;
      return true;
    }
    if (name === "width") {
      this.width = parsed;
      return true;
    }
    if (name === "height") {
      this.height = parsed;
      return true;
    }
    return false;
  }

  protected readGeometry(name: string): string | undefined {
    if (name === "x") {
      return String(this.x);
    }
    if (name === "y") {
      return String(this.y);
    }
    if (name === "width") {
      return String(this.width);
    }
    if (name === "height") {
      return String(this.height);
    }
    return undefined;
  }
}
