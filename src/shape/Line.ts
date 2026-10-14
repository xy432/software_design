import { Shape } from "./Shape";

export class Line extends Shape {
  constructor(
    id: string,
    private x1: number,
    private y1: number,
    private x2: number,
    private y2: number,
  ) {
    super(id);
  }

  kind(): string {
    return "line";
  }

  move(dx: number, dy: number): void {
    this.x1 += dx;
    this.y1 += dy;
    this.x2 += dx;
    this.y2 += dy;
  }

  scale(factor: number): void {
    this.x1 *= factor;
    this.y1 *= factor;
    this.x2 *= factor;
    this.y2 *= factor;
  }

  snapshot(): Record<string, number | string> {
    return { x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2 };
  }

  toSvg(indent: string): string {
    return `${indent}<line id="${this.escapeXml(this.getId())}" x1="${this.formatNumber(this.x1)}" y1="${this.formatNumber(this.y1)}" x2="${this.formatNumber(this.x2)}" y2="${this.formatNumber(this.y2)}"${this.presentationAttributes()}/>`;
  }

  protected applyGeometry(name: string, value: string): boolean {
    const parsed = this.parseNumber(value);
    if (name === "x1") {
      this.x1 = parsed;
      return true;
    }
    if (name === "y1") {
      this.y1 = parsed;
      return true;
    }
    if (name === "x2") {
      this.x2 = parsed;
      return true;
    }
    if (name === "y2") {
      this.y2 = parsed;
      return true;
    }
    return false;
  }

  protected readGeometry(name: string): string | undefined {
    if (name === "x1") {
      return String(this.x1);
    }
    if (name === "y1") {
      return String(this.y1);
    }
    if (name === "x2") {
      return String(this.x2);
    }
    if (name === "y2") {
      return String(this.y2);
    }
    return undefined;
  }
}
