import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SvgDocument } from "../../src/document/SvgDocument";
import { Group } from "../../src/shape/Group";
import { Rect } from "../../src/shape/Rect";

describe("SvgDocument", () => {
  it("treats ids as case-sensitive and rejects duplicates", () => {
    const document = new SvgDocument(400, 300);
    document.insert(new Rect("R1", 0, 0, 1, 1), null);
    document.insert(new Rect("r1", 2, 2, 1, 1), null);
    assert.equal(document.find("R1")?.getId(), "R1");
    assert.equal(document.find("r1")?.getId(), "r1");
    assert.equal(document.size(), 2);
    assert.throws(() => document.insert(new Rect("r1", 0, 0, 1, 1), null), /id already exists: r1/);
  });

  it("removes a group and its descendants from the index", () => {
    const document = new SvgDocument();
    const group = new Group("g1");
    const rect = new Rect("r1", 0, 0, 8, 8);
    document.insert(group, null);
    document.insert(rect, group);
    assert.equal(document.size(), 2);

    const removed = document.detach(group);
    assert.equal(removed.parent, null);
    assert.equal(removed.index, 0);
    assert.equal(document.find("g1"), undefined);
    assert.equal(document.find("r1"), undefined);
    assert.equal(document.size(), 0);
    assert.equal(group.getChildren()[0], rect);
  });

  it("refuses to insert a group into its own descendant", () => {
    const document = new SvgDocument();
    const outer = new Group("outer");
    const inner = new Group("inner");
    document.insert(outer, null);
    document.insert(inner, outer);
    assert.throws(
      () => document.insert(outer, inner),
      /cannot group a container into its own descendant: outer/,
    );
  });
});