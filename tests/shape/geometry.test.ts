import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SvgDocument } from "../../src/document/SvgDocument";
import { Circle } from "../../src/shape/Circle";
import { Group } from "../../src/shape/Group";
import { Line } from "../../src/shape/Line";
import { Rect } from "../../src/shape/Rect";
import { Text } from "../../src/shape/Text";

describe("shape geometry", () => {
  it("moves and scales a rectangle in place", () => {
    const rect = new Rect("r1", 10, 20, 30, 40);
    rect.move(5, -2);
    assert.deepEqual(rect.snapshot(), { x: 15, y: 18, width: 30, height: 40 });
    rect.scale(2);
    assert.deepEqual(rect.snapshot(), { x: 30, y: 36, width: 60, height: 80 });
  });

  it("moves and scales every descendant of a nested group", () => {
    const document = new SvgDocument();
    const outer = new Group("outer");
    const inner = new Group("inner");
    const rect = new Rect("r1", 10, 10, 4, 6);
    const text = new Text("t1", 1, 2, "Hi");
    document.insert(outer, null);
    document.insert(inner, outer);
    document.insert(rect, inner);
    document.insert(text, outer);

    outer.move(3, 4);
    assert.equal(rect.snapshot().x, 13);
    assert.equal(rect.snapshot().y, 14);
    assert.equal(text.snapshot().x, 4);
    assert.equal(text.snapshot().text, "Hi");

    outer.scale(2);
    assert.deepEqual(rect.snapshot(), { x: 26, y: 28, width: 8, height: 12 });
    assert.equal(text.snapshot().x, 8);
    assert.equal(text.snapshot().y, 12);
    assert.equal(rect.getParent(), inner);
    assert.equal(inner.getParent(), outer);
  });

  it("scales line endpoints and circle radius", () => {
    const line = new Line("e", 1, 2, 3, 4);
    const circle = new Circle("c", 5, 6, 7);
    line.scale(3);
    circle.move(1, 1);
    assert.deepEqual(line.snapshot(), { x1: 3, y1: 6, x2: 9, y2: 12 });
    assert.deepEqual(circle.snapshot(), { cx: 6, cy: 7, r: 7 });
  });

  it("stores presentation attributes and rejects unknown ones", () => {
    const rect = new Rect("r1", 0, 0, 1, 1);
    rect.applyAttribute("fill", "#fff");
    rect.applyAttribute("stroke-width", "2");
    assert.equal(rect.getFill(), "#fff");
    assert.equal(rect.readAttribute("stroke-width"), "2");
    assert.throws(() => rect.applyAttribute("opacity", "0.5"), /unknown attribute: opacity/);
  });
});
