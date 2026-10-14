import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SvgReader } from "../../src/io/SvgReader";
import { SvgWriter } from "../../src/io/SvgWriter";
import { Group } from "../../src/shape/Group";
import { Shape } from "../../src/shape/Shape";
import { ShapeFactory } from "../../src/shape/ShapeFactory";

const otherSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect x="0" y="0" width="400" height="300" fill="#ffffff"/>
  <text id="t1" x="10" y="290">imported</text>
  <circle id="c1" cx="50" cy="50" r="10"/>
  <g id="g1">
    <rect id="r2" x="0" y="0" width="10" height="10"/>
    <circle id="c2" cx="5" cy="5" r="2"/>
  </g>
  <ellipse id="e1" cx="1" cy="2" rx="3" ry="4"/>
</svg>
`;

describe("SVG read and write", () => {
  const reader = new SvgReader();
  const writer = new SvgWriter();

  it("assigns an id to an unnamed element and keeps the other six", () => {
    const result = reader.read(otherSvg);
    assert.deepEqual(result.warnings, ["warning: assigned id rect1 to unnamed <rect>"]);
    assert.equal(result.document.size(), 7);
    assert.equal(result.document.getWidth(), 400);
    assert.equal(result.document.getHeight(), 300);
    assert.equal(result.document.find("rect1")?.readAttribute("fill"), "#ffffff");
    assert.equal(result.document.find("t1")?.readAttribute("text"), "imported");
    const group = result.document.find("g1");
    assert.ok(group instanceof Group);
    assert.deepEqual(
      group.getChildren().map((child) => child.getId()),
      ["r2", "c2"],
    );
  });

  it("omits unset fill and round-trips geometry", () => {
    const result = reader.read(otherSvg);
    const written = writer.write(result.document);
    assert.equal(written.includes('circle id="c1"'), true);
    assert.equal(written.includes('id="c1" cx="50" cy="50" r="10"/>'), true);
    assert.equal(written.includes("<text id=\"t1\" x=\"10\" y=\"290\">imported</text>"), true);
    const again = reader.read(written);
    assert.deepEqual(again.warnings, []);
    assert.deepEqual(summaries(result.document.getRoots()), summaries(again.document.getRoots()));
  });

  it("rejects an unknown shape type from the factory", () => {
    assert.throws(
      () => new ShapeFactory().create("hexagon", "h1"),
      /unknown shape type: hexagon \(is the plugin loaded\?\)/,
    );
  });
});

function summaries(shapes: readonly Shape[]): unknown[] {
  return shapes.map((shape) => ({
    id: shape.getId(),
    kind: shape.kind(),
    geometry: shape.snapshot(),
    fill: shape.getFill() ?? null,
    children: shape instanceof Group ? summaries(shape.getChildren()) : [],
  }));
}
