import { Circle } from "./Circle";
import { Ellipse } from "./Ellipse";
import { Group } from "./Group";
import { Line } from "./Line";
import { Rect } from "./Rect";
import { Shape } from "./Shape";
import { Text } from "./Text";

export class ShapeFactory {
  // 按类型名创建图形。这是全程序两处名字分派之一，后续应改为注册表，避免在这里继续加分支。
  private readonly creators = new Map<string, (id: string) => Shape>([
    ["rect", (id) => new Rect(id, 0, 0, 0, 0)],
    ["circle", (id) => new Circle(id, 0, 0, 0)],
    ["ellipse", (id) => new Ellipse(id, 0, 0, 0, 0)],
    ["line", (id) => new Line(id, 0, 0, 0, 0)],
    ["text", (id) => new Text(id, 0, 0, "")],
    ["g", (id) => new Group(id)],
  ]);

  knows(type: string): boolean {
    return this.creators.has(type);
  }

  create(type: string, id: string): Shape {
    const creator = this.creators.get(type);
    if (creator === undefined) {
      throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
    }
    return creator(id);
  }
}
