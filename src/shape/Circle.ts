import { Shape } from "./Shape";

export class Circle extends Shape {
  constructor(
    id: string,
    private cx: number,
    private cy: number,
    private r: number,
  ) {
    super(id);
  }

  kind(): string {
    return "circle";
  }

  move(dx: number, dy: number): void {
    this.cx += dx;
    this.cy += dy;
  }

  scale(factor: number): void {
    this.cx *= factor;
    this.cy *= factor;
    this.r *= factor;
  }

  snapshot(): Record<string, number | string> {
    return { cx: this.cx, cy: this.cy, r: this.r };
  }

  toSvg(indent: string): string {
    return `${indent}<circle id="${this.escapeXml(this.getId())}" cx="${this.formatNumber(this.cx)}" cy="${this.formatNumber(this.cy)}" r="${this.formatNumber(this.r)}"${this.presentationAttributes()}/>`;
  }

  protected applyGeometry(name: string, value: string): boolean {
    const parsed = this.parseNumber(value);
    if (name === "cx") {
      this.cx = parsed;
      return true;
    }
    if (name === "cy") {
      this.cy = parsed;
      return true;
    }
    if (name === "r") {
      this.r = parsed;
      return true;
    }
    return false;
  }

  protected readGeometry(name: string): string | undefined {
    if (name === "cx") {
      return String(this.cx);
    }
    if (name === "cy") {
      return String(this.cy);
    }
    if (name === "r") {
      return String(this.r);
    }
    return undefined;
  }
}
