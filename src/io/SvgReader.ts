import { DOMParser } from "@xmldom/xmldom";
import { SvgDocument } from "../document/SvgDocument";
import { Group } from "../shape/Group";
import { Shape } from "../shape/Shape";
import { ShapeFactory } from "../shape/ShapeFactory";

type XmlElement = NonNullable<ReturnType<DOMParser["parseFromString"]>["documentElement"]>;

export class SvgReadResult {
  constructor(
    readonly document: SvgDocument,
    readonly warnings: string[],
  ) {}
}

export class SvgReader {
  constructor(private readonly factory = new ShapeFactory()) {}

  read(xml: string): SvgReadResult {
    let dom: ReturnType<DOMParser["parseFromString"]>;
    try {
      dom = new DOMParser({
        onError: (level) => {
          if (level === "fatalError" || level === "error") {
            throw new Error("invalid svg");
          }
        },
      }).parseFromString(xml, "image/svg+xml");
    } catch {
      throw new Error("cannot read file");
    }
    const svg = dom.documentElement;
    if (svg === null || svg.localName !== "svg") {
      throw new Error("cannot read file");
    }
    const document = new SvgDocument(this.readLength(svg, "width", 800), this.readLength(svg, "height", 600));
    const warnings: string[] = [];
    const reserved = new Set<string>();
    this.collectExplicitIds(svg, reserved);
    const counters = new Map<string, number>();
    this.readChildren(svg, document, null, warnings, reserved, counters);
    return new SvgReadResult(document, warnings);
  }

  private readChildren(
    parentElement: XmlElement,
    document: SvgDocument,
    parent: Group | null,
    warnings: string[],
    reserved: Set<string>,
    counters: Map<string, number>,
  ): void {
    for (let index = 0; index < parentElement.childNodes.length; index += 1) {
      const node = parentElement.childNodes.item(index);
      if (node === null || node.nodeType !== 1) {
        continue;
      }
      this.readElement(node as XmlElement, document, parent, warnings, reserved, counters);
    }
  }

  private readElement(
    element: XmlElement,
    document: SvgDocument,
    parent: Group | null,
    warnings: string[],
    reserved: Set<string>,
    counters: Map<string, number>,
  ): void {
    const tag = element.localName ?? "";
    if (!this.factory.knows(tag)) {
      warnings.push(`warning: skipped unknown element: ${tag}`);
      return;
    }
    const shape = this.factory.create(tag, this.assignId(element, tag, document, reserved, counters, warnings));
    this.applyAttributes(element, shape);
    if (tag === "text") {
      shape.applyAttribute("text", element.textContent ?? "");
    }
    document.insert(shape, parent);
    if (shape instanceof Group) {
      this.readChildren(element, document, shape, warnings, reserved, counters);
    }
  }

  private assignId(
    element: XmlElement,
    tag: string,
    document: SvgDocument,
    reserved: Set<string>,
    counters: Map<string, number>,
    warnings: string[],
  ): string {
    const existing = element.getAttribute("id");
    if (existing !== null && existing !== "") {
      return existing;
    }
    let next = counters.get(tag) ?? 0;
    let id = "";
    do {
      next += 1;
      id = `${tag}${next}`;
    } while (document.find(id) !== undefined || reserved.has(id));
    counters.set(tag, next);
    warnings.push(`warning: assigned id ${id} to unnamed <${tag}>`);
    return id;
  }

  private applyAttributes(element: XmlElement, shape: Shape): void {
    for (let index = 0; index < element.attributes.length; index += 1) {
      const attribute = element.attributes.item(index);
      if (attribute === null) {
        continue;
      }
      const name = attribute.name;
      if (name === "id" || name === "xmlns" || name.startsWith("xmlns:")) {
        continue;
      }
      try {
        shape.applyAttribute(name, attribute.value);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith("unknown attribute:")) {
          continue;
        }
        throw error;
      }
    }
  }

  private collectExplicitIds(element: XmlElement, ids: Set<string>): void {
    const id = element.getAttribute("id");
    if (id !== null && id !== "") {
      ids.add(id);
    }
    for (let index = 0; index < element.childNodes.length; index += 1) {
      const node = element.childNodes.item(index);
      if (node !== null && node.nodeType === 1) {
        this.collectExplicitIds(node as XmlElement, ids);
      }
    }
  }

  private readLength(element: XmlElement, name: string, fallback: number): number {
    const raw = element.getAttribute(name);
    if (raw === null || raw.trim() === "") {
      return fallback;
    }
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
