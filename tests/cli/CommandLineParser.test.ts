import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CommandLineParser } from "../../src/app/CommandLineParser";

describe("CommandLineParser", () => {
  const parser = new CommandLineParser();

  it("treats a blank line and a comment line as no command", () => {
    assert.equal(parser.parse("   "), null);
    assert.equal(parser.parse("# build the flowchart"), null);
  });

  it("drops an inline comment outside quotes and keeps quoted text", () => {
    assert.deepEqual(parser.parse('create text title 20 40 "My Diagram" # caption'), [
      "create",
      "text",
      "title",
      "20",
      "40",
      "My Diagram",
    ]);
  });

  it("rejects an unclosed quote", () => {
    assert.throws(() => parser.parse('create text title 20 40 "My Diagram'), /unclosed quote/);
  });
});
