import { SvgDocument } from "../document/SvgDocument";
import { Group } from "../shape/Group";
import { Shape } from "../shape/Shape";

export class TreeText {
  renderDocument(document: SvgDocument): string {
    const lines = [`svg (${this.format(document.getWidth())}x${this.format(document.getHeight())})`];
    this.renderChildren(document.getRoots(), "", lines);
    return lines.join("\n");
  }

  renderShape(shape: Shape): string {
    const lines = [this.label(shape)];
    if (shape instanceof Group) {
      this.renderChildren(shape.getChildren(), "", lines);
    }
    return lines.join("\n");
  }

  private renderChildren(shapes: readonly Shape[], prefix: string, lines: string[]): void {
    shapes.forEach((shape, index) => {
      const last = index === shapes.length - 1;
      lines.push(`${prefix}${last ? "└── " : "├── "}${this.label(shape)}`);
      if (shape instanceof Group) {
        this.renderChildren(shape.getChildren(), `${prefix}${last ? "    " : "│   "}`, lines);
      }
    });
  }

  private label(shape: Shape): string {
    const head = `${shape.kind()}#${shape.getId()}`;
    const detail = shape.treeDetail();
    if (detail === "") {
      return head;
    }
    return `${head.padEnd(14, " ")} ${detail}`;
  }

  private format(value: number): string {
    return String(Math.round(value * 1e6) / 1e6);
  }
}
