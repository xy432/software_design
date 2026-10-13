import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EditorSession } from "../../src/app/EditorSession";
import { HelpText } from "../../src/app/HelpText";

describe("EditorSession", () => {
  const session = new EditorSession();

  it("prints help before any document exists", () => {
    assert.deepEqual(session.executeLine("help"), [HelpText.content]);
  });

  it("ignores comments and refuses every other command without a document", () => {
    assert.deepEqual(session.executeLine("# just a note"), []);
    assert.deepEqual(session.executeLine("tree"), [
      "error: no document. use 'init' or 'read' first",
    ]);
  });
});
