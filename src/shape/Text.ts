import { Shape } from "./Shape";

export class Text extends Shape {
  constructor(
    id: string,
    private x: number,
    private y: number,
    private content: string,
  ) {
    super(id);
  }

  kind(): string {
    return "text";
  }

  move(dx: number, dy: number): void {
    this.x += dx;
    this.y += dy;
  }

  scale(factor: number): void {
    this.x *= factor;
    this.y *= factor;
  }

  snapshot(): Record<string, number | string> {
    return { x: this.x, y: this.y, text: this.content };
  }

  protected applyGeometry(name: string, value: string): boolean {
    if (name === "text") {
      this.content = value;
      return true;
    }
    const parsed = this.parseNumber(value);
    if (name === "x") {
      this.x = parsed;
      return true;
    }
    if (name === "y") {
      this.y = parsed;
      return true;
    }
    return false;
  }

  protected readGeometry(name: string): string | undefined {
    if (name === "text") {
      return this.content;
    }
    if (name === "x") {
      return String(this.x);
    }
    if (name === "y") {
      return String(this.y);
    }
    return undefined;
  }
}
