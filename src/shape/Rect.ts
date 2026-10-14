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
