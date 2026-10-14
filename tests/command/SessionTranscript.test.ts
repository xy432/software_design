import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { EditorSession } from "../../src/app/EditorSession";

describe("session transcript", () => {
  it("matches the basic editing session", () => {
    const session = new EditorSession();
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "svg-editor-"));
    const file = path.join(directory, "demo.svg");
    assert.deepEqual(session.executeLine("init 800 600"), ["canvas 800x600 created"]);
    assert.deepEqual(session.executeLine("create rect bg 0 0 800 600 #ffffff"), ["rect#bg created"]);
    assert.deepEqual(session.executeLine('create text title 20 40 "My Diagram"'), ["text#title created"]);
    assert.deepEqual(session.executeLine("create circle c1 100 100 20 red"), ["circle#c1 created"]);
    assert.deepEqual(session.executeLine("create rect box 200 80 60 60 #3366ff"), ["rect#box created"]);
    assert.deepEqual(session.executeLine("group markers c1 box"), ["g#markers created with 2 children"]);
    assert.equal(
      session.executeLine("tree")[0],
      [
        "svg (800x600)",
        "├── rect#bg        x=0 y=0 w=800 h=600 fill=#ffffff",
        "├── text#title     (20,40) \"My Diagram\"",
        "└── g#markers",
        "    ├── circle#c1      cx=100 cy=100 r=20 fill=red",
        "    └── rect#box       x=200 y=80 w=60 h=60 fill=#3366ff",
      ].join("\n"),
    );
    assert.deepEqual(session.executeLine("move c1 30 0"), ["circle#c1 moved to (130,100)"]);
    assert.deepEqual(session.executeLine("undo"), ["circle#c1 moved back to (100,100)"]);
    assert.deepEqual(session.executeLine("redo"), ["circle#c1 moved to (130,100)"]);
    assert.deepEqual(session.executeLine('set title text "My Diagram v2"'), [
      'text#title updated: text="My Diagram v2"',
    ]);
    assert.deepEqual(session.executeLine("undo"), ['text#title updated: text="My Diagram"']);
    assert.deepEqual(session.executeLine("group bad c1 markers"), [
      "error: cannot group a container into its own descendant: markers",
    ]);
    assert.deepEqual(session.executeLine("delete box"), ["rect#box deleted"]);
    assert.deepEqual(session.executeLine("undo"), ["rect#box restored into g#markers"]);
    assert.deepEqual(session.executeLine(`save ${file}`), [`saved to ${file} (5 elements)`]);
    assert.deepEqual(session.executeLine("undo"), ["error: undo not allowed after io command"]);
    assert.equal(session.executeLine("show c1")[0]?.includes("parent=g#markers"), true);
    assert.deepEqual(session.executeLine("ungroup markers"), [
      "error: cannot ungroup top-level container: markers",
    ]);
  });

  it("builds the two-node flowchart and moves a container", () => {
    const session = new EditorSession();
    session.executeLine("init 800 600");
    session.executeLine("create g flowchart");
    session.executeLine("create g node1 in flowchart");
    session.executeLine("create rect start 120 100 160 60 #4a90d9 in node1");
    session.executeLine('create text start-label 155 135 "开始" in node1');
    session.executeLine("create g node2 in flowchart");
    session.executeLine("create rect process 520 100 160 60 #f5a623 in node2");
    session.executeLine('create text process-label 545 135 "处理数据" in node2');
    session.executeLine("create line arrow1 280 130 520 130 black in flowchart");
    assert.equal(session.executeLine("tree")[0]?.includes("g#node2"), true);
    assert.deepEqual(session.executeLine("move node2 0 100"), ["g#node2 moved by (0,100)"]);
    assert.deepEqual(session.executeLine("undo"), ["g#node2 moved back by (0,-100)"]);
    assert.deepEqual(session.executeLine("addto node1 arrow1"), ["line#arrow1 added to g#node1"]);
    assert.deepEqual(session.executeLine("ungroup node1"), ["g#node1 ungrouped into g#flowchart"]);
  });
});