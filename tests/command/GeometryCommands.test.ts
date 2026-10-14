import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EditorSession } from "../../src/app/EditorSession";

describe("geometry commands", () => {
  it("moves, scales, sets attributes, and reorders siblings", () => {
    const session = new EditorSession();
    session.executeLine("init");
    session.executeLine("create circle c1 100 100 20 red");
    session.executeLine("create g node2");
    session.executeLine("create rect box 200 80 60 60 blue in node2");
    assert.deepEqual(session.executeLine("move c1 30 0"), ["circle#c1 moved to (130,100)"]);
    assert.deepEqual(session.executeLine("undo"), ["circle#c1 moved back to (100,100)"]);
    assert.deepEqual(session.executeLine("redo"), ["circle#c1 moved to (130,100)"]);
    assert.deepEqual(session.executeLine("move node2 0 100"), ["g#node2 moved by (0,100)"]);
    assert.deepEqual(session.executeLine("undo"), ["g#node2 moved back by (0,-100)"]);
    assert.deepEqual(session.executeLine("scale c1 0"), ["error: scale factor must be positive"]);
    assert.deepEqual(session.executeLine("scale c1 2"), ["circle#c1 scaled by 2"]);
    assert.deepEqual(session.executeLine("undo"), ["circle#c1 scaled back"]);
    assert.deepEqual(session.executeLine("set c1 opacity 1"), ["error: unknown attribute: opacity"]);
    assert.deepEqual(session.executeLine('set c1 fill #3366ff'), ["circle#c1 updated: fill=#3366ff"]);
    assert.deepEqual(session.executeLine("undo"), ["circle#c1 updated: fill=red"]);
    assert.deepEqual(session.executeLine("front box"), ["rect#box brought to front"]);
    session.executeLine("create text title 1 2 Hi");
    assert.deepEqual(session.executeLine("back title"), ["text#title sent to back"]);
    assert.deepEqual(session.executeLine("undo"), ["text#title brought to front"]);
  });
});