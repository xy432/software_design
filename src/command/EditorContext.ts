import { SvgDocument } from "../document/SvgDocument";
import { SvgReader, SvgReadResult } from "../io/SvgReader";
import { SvgWriter } from "../io/SvgWriter";
import { CommandHistory } from "./CommandHistory";

export class EditorContext {
  private document: SvgDocument | null = null;

  constructor(
    readonly history: CommandHistory,
    private readonly reader = new SvgReader(),
    private readonly writer = new SvgWriter(),
  ) {}

  hasDocument(): boolean {
    return this.document !== null;
  }

  getDocument(): SvgDocument {
    if (this.document === null) {
      throw new Error("no document. use 'init' or 'read' first");
    }
    return this.document;
  }

  replaceDocument(document: SvgDocument): void {
    this.document = document;
    this.history.clear();
    this.history.lock();
  }

  lockHistory(): void {
    this.history.lock();
  }

  readSvg(xml: string): SvgReadResult {
    return this.reader.read(xml);
  }

  writeSvg(document: SvgDocument): string {
    return this.writer.write(document);
  }
}
