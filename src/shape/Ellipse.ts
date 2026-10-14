import { Shape } from "./Shape";

export class Ellipse extends Shape {
  constructor(
    id: string,
    private cx: number,
    private cy: number,
    private rx: number,
    private ry: number,
  ) {
    super(id);
  }

  kind(): string {
    return "ellipse";
  }

  move(dx: number, dy: number): void {
    this.cx += dx;
    this.cy += dy;
  }

  scale(factor: number): void {
    this.cx *= factor;
    this.cy *= factor;
    this.rx *= factor;
    this.ry *= factor;
  }

  snapshot(): Record<string, number | string> {
    return { cx: this.cx, cy: this.cy, rx: this.rx, ry: this.ry };
  }

  toSvg(indent: string): string {
    return `${indent}<ellipse id="${this.escapeXml(this.getId())}" cx="${this.formatNumber(this.cx)}" cy="${this.formatNumber(this.cy)}" rx="${this.formatNumber(this.rx)}" ry="${this.formatNumber(this.ry)}"${this.presentationAttributes()}/>`;
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
    if (name === "rx") {
      this.rx = parsed;
      return true;
    }
    if (name === "ry") {
      this.ry = parsed;
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
    if (name === "rx") {
      return String(this.rx);
    }
    if (name === "ry") {
      return String(this.ry);
    }
    return undefined;
  }
}
