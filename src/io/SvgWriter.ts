import { SvgDocument } from "../document/SvgDocument";

export class SvgWriter {
  write(document: SvgDocument): string {
    const width = this.formatNumber(document.getWidth());
    const height = this.formatNumber(document.getHeight());
    const body = document
      .getRoots()
      .map((shape) => shape.toSvg("  "))
      .join("\n");
    const inner = body.length === 0 ? "" : `\n${body}\n`;
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${inner}</svg>\n`;
  }

  private formatNumber(value: number): string {
    const rounded = Math.round(value * 1e6) / 1e6;
    return String(rounded);
  }
}
