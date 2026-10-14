import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { EditorSession } from "../../src/app/EditorSession";

const otherSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <rect x="0" y="0" width="400" height="300" fill="#ffffff"/>
  <text id="t1" x="10" y="290">imported</text>
</svg>
`;

describe("document commands", () => {
  it("locks undo after init and save, and a failed read keeps the current document", () => {
    const session = new EditorSession();
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "svg-editor-"));
    const source = path.join(directory, "other.svg");
    const target = path.join(directory, "out.svg");
    fs.writeFileSync(source, otherSvg, "utf8");

    assert.deepEqual(session.executeLine("undo"), ["error: no document. use 'init' or 'read' first"]);
    assert.deepEqual(session.executeLine("init 800 600"), ["canvas 800x600 created"]);
    assert.deepEqual(session.executeLine("undo"), ["error: undo not allowed after io command"]);
    assert.deepEqual(session.executeLine("canvas"), ["canvas 800x600"]);
    assert.deepEqual(session.executeLine(`read ${missing(directory)}`), [
      `error: cannot read file: ${missing(directory)}`,
    ]);
    assert.deepEqual(session.executeLine("canvas"), ["canvas 800x600"]);
    assert.deepEqual(session.executeLine(`read ${source}`), [
      "warning: assigned id rect1 to unnamed <rect>",
      `read ${source} (2 elements)`,
    ]);
    assert.deepEqual(session.executeLine("undo"), ["error: undo not allowed after io command"]);
    assert.deepEqual(session.executeLine(`save ${target}`), [`saved to ${target} (2 elements)`]);
    assert.equal(fs.readFileSync(target, "utf8").includes('id="rect1"'), true);
    assert.deepEqual(session.executeLine("undo"), ["error: undo not allowed after io command"]);
    assert.deepEqual(session.executeLine("canvas 100 50"), ["canvas resized to 100x50"]);
    assert.deepEqual(session.executeLine("canvas"), ["canvas 100x50"]);
  });
});

function missing(directory: string): string {
  return path.join(directory, "missing.svg");
}
