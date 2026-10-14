export abstract class Shape {
  private parent: Shape | null = null;
  private fillValue: string | undefined;
  private strokeValue: string | undefined;
  private strokeWidthValue: string | undefined;

  protected constructor(private readonly shapeId: string) {}

  getId(): string {
    return this.shapeId;
  }

  getParent(): Shape | null {
    return this.parent;
  }

  bindParent(parent: Shape | null): void {
    this.parent = parent;
  }

  isAncestorOf(other: Shape): boolean {
    let current = other.getParent();
    while (current !== null) {
      if (current === this) {
        return true;
      }
      current = current.getParent();
    }
    return false;
  }

  getFill(): string | undefined {
    return this.fillValue;
  }

  getStroke(): string | undefined {
    return this.strokeValue;
  }

  getStrokeWidth(): string | undefined {
    return this.strokeWidthValue;
  }

  applyAttribute(name: string, value: string): void {
    if (this.applyPresentation(name, value) || this.applyGeometry(name, value)) {
      return;
    }
    throw new Error(`unknown attribute: ${name}`);
  }

  readAttribute(name: string): string | undefined {
    const presentation = this.readPresentation(name);
    if (presentation !== undefined) {
      return presentation;
    }
    return this.readGeometry(name);
  }

  abstract kind(): string;

  abstract move(dx: number, dy: number): void;

  abstract scale(factor: number): void;

  abstract snapshot(): Record<string, number | string>;

  abstract toSvg(indent: string): string;

  abstract location(): string;

  abstract treeDetail(): string;

  protected fillSuffix(): string {
    const fill = this.getFill();
    return fill === undefined ? "" : ` fill=${fill}`;
  }

  abstract restoreSnapshot(values: Record<string, number | string>): void;

  clearAttribute(name: string): void {
    if (name === "fill") {
      this.fillValue = undefined;
      return;
    }
    if (name === "stroke") {
      this.strokeValue = undefined;
      return;
    }
    if (name === "stroke-width") {
      this.strokeWidthValue = undefined;
      return;
    }
    throw new Error(`unknown attribute: ${name}`);
  }

  protected asNumber(value: number | string | undefined): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`invalid number: ${String(value)}`);
    }
    return parsed;
  }

  protected abstract applyGeometry(name: string, value: string): boolean;

  protected abstract readGeometry(name: string): string | undefined;

  protected parseNumber(value: string): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`invalid number: ${value}`);
    }
    return parsed;
  }

  protected formatNumber(value: number): string {
    const rounded = Math.round(value * 1e6) / 1e6;
    return String(rounded);
  }

  protected escapeXml(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  protected presentationAttributes(): string {
    const parts: string[] = [];
    const fill = this.getFill();
    const stroke = this.getStroke();
    const strokeWidth = this.getStrokeWidth();
    if (fill !== undefined) {
      parts.push(`fill="${this.escapeXml(fill)}"`);
    }
    if (stroke !== undefined) {
      parts.push(`stroke="${this.escapeXml(stroke)}"`);
    }
    if (strokeWidth !== undefined) {
      parts.push(`stroke-width="${this.escapeXml(strokeWidth)}"`);
    }
    return parts.length === 0 ? "" : ` ${parts.join(" ")}`;
  }

  private applyPresentation(name: string, value: string): boolean {
    if (name === "fill") {
      this.fillValue = value;
      return true;
    }
    if (name === "stroke") {
      this.strokeValue = value;
      return true;
    }
    if (name === "stroke-width") {
      this.strokeWidthValue = value;
      return true;
    }
    return false;
  }

  private readPresentation(name: string): string | undefined {
    if (name === "fill") {
      return this.fillValue;
    }
    if (name === "stroke") {
      return this.strokeValue;
    }
    if (name === "stroke-width") {
      return this.strokeWidthValue;
    }
    return undefined;
  }
}
