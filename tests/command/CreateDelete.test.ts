import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EditorSession } from "../../src/app/EditorSession";

describe("create and delete", () => {
  it("creates into a container and restores a deleted shape on undo", () => {
    const session = new EditorSession();
    session.executeLine("init");
    assert.deepEqual(session.executeLine("create rect bg 0 0 10 10 #ffffff"), ["rect#bg created"]);
    assert.deepEqual(session.executeLine("create rect bg 1 1 1 1"), ["error: id already exists: bg"]);
    assert.deepEqual(session.executeLine("create g node1"), ["g#node1 created"]);
    assert.deepEqual(session.executeLine("create rect start 1 2 3 4 red in missing"), [
      "error: no such container: missing",
    ]);
    assert.deepEqual(session.executeLine("create rect start 1 2 3 4 red in node1"), [
      "rect#start created in g#node1",
    ]);
    assert.deepEqual(session.executeLine("create text title 20 40 \"My Diagram\" in node1"), [
      "text#title created in g#node1",
    ]);
    assert.deepEqual(session.executeLine("create box n1 1 2 3 4 \"开始\""), [
      "error: unknown shape type: box (is the plugin loaded?)",
    ]);
    assert.deepEqual(session.executeLine("delete start"), ["rect#start deleted"]);
    assert.deepEqual(session.executeLine("undo"), ["rect#start restored into g#node1"]);
    assert.deepEqual(session.executeLine("undo"), ["text#title deleted"]);
    assert.deepEqual(session.executeLine("redo"), ["text#title created in g#node1"]);
    assert.deepEqual(session.executeLine("delete missing"), ["error: no such shape: missing"]);
  });
});