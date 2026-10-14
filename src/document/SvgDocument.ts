import { Group } from "../shape/Group";
import { Shape } from "../shape/Shape";

export class SvgDocument {
  private readonly roots: Shape[] = [];
  private readonly index = new Map<string, Shape>();
  private sourcePath: string | null = null;

  constructor(
    private width = 800,
    private height = 600,
  ) {}

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  getSourcePath(): string | null {
    return this.sourcePath;
  }

  setSourcePath(path: string | null): void {
    this.sourcePath = path;
  }

  getRoots(): readonly Shape[] {
    return this.roots;
  }

  find(id: string): Shape | undefined {
    return this.index.get(id);
  }

  size(): number {
    return this.index.size;
  }

  insert(shape: Shape, parent: Group | null, index?: number): void {
    if (parent !== null && !this.index.has(parent.getId())) {
      throw new Error(`no such container: ${parent.getId()}`);
    }
    if (parent !== null && (shape === parent || shape.isAncestorOf(parent))) {
      throw new Error(`cannot group a container into its own descendant: ${shape.getId()}`);
    }
    this.indexSubtree(shape);
    if (parent === null) {
      const at = index ?? this.roots.length;
      this.roots.splice(at, 0, shape);
      shape.bindParent(null);
      return;
    }
    const at = index ?? parent.getChildren().length;
    parent.insertChildAt(at, shape);
  }

  moveToIndex(shape: Shape, index: number): number {
    if (!this.index.has(shape.getId())) {
      throw new Error(`no such shape: ${shape.getId()}`);
    }
    const parent = shape.getParent();
    if (parent instanceof Group) {
      return parent.moveChild(shape, index);
    }
    const oldIndex = this.roots.indexOf(shape);
    this.roots.splice(oldIndex, 1);
    const at = Math.min(Math.max(index, 0), this.roots.length);
    this.roots.splice(at, 0, shape);
    return oldIndex;
  }

  siblingIndex(shape: Shape): number {
    const parent = shape.getParent();
    if (parent instanceof Group) {
      return parent.getChildren().indexOf(shape);
    }
    return this.roots.indexOf(shape);
  }

  siblingCount(shape: Shape): number {
    const parent = shape.getParent();
    if (parent instanceof Group) {
      return parent.getChildren().length;
    }
    return this.roots.length;
  }

  detach(shape: Shape): { parent: Group | null; index: number } {
    if (!this.index.has(shape.getId())) {
      throw new Error(`no such shape: ${shape.getId()}`);
    }
    const parent = shape.getParent();
    let index: number;
    if (parent instanceof Group) {
      index = parent.removeChild(shape);
    } else {
      index = this.roots.indexOf(shape);
      this.roots.splice(index, 1);
      shape.bindParent(null);
    }
    this.unindexSubtree(shape);
    return { parent: parent instanceof Group ? parent : null, index };
  }

  private indexSubtree(shape: Shape): void {
    if (this.index.has(shape.getId())) {
      throw new Error(`id already exists: ${shape.getId()}`);
    }
    this.index.set(shape.getId(), shape);
    if (shape instanceof Group) {
      for (const child of shape.getChildren()) {
        this.indexSubtree(child);
      }
    }
  }

  private unindexSubtree(shape: Shape): void {
    this.index.delete(shape.getId());
    if (shape instanceof Group) {
      for (const child of shape.getChildren()) {
        this.unindexSubtree(child);
      }
    }
  }
}
