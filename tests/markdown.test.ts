import assert from "assert/strict";

import {
  getAllScratchblocksSourcesFromText,
  getInlineScratchblocksSource,
  getScratchblocksSourceAtLine,
} from "../src/markdown";

function test(name: string, run: () => void) {
  run();
  console.log(`ok - ${name}`);
}

test("gets inline scratchblocks source", () => {
  assert.equal(
    getInlineScratchblocksSource("  sb move (10) steps  "),
    "move (10) steps"
  );
  assert.equal(
    getInlineScratchblocksSource("SB when green flag clicked"),
    "when green flag clicked"
  );
});

test("rejects text without inline scratchblocks source", () => {
  assert.equal(getInlineScratchblocksSource("move (10) steps"), null);
  assert.equal(getInlineScratchblocksSource("sb   "), null);
  assert.equal(getInlineScratchblocksSource("sbox"), null);
});

test("gets all supported scratchblocks fences", () => {
  const markdown = [
    "```scratchblocks",
    "move (10) steps",
    "```",
    "~~~sb",
    "turn cw (15) degrees",
    "~~~",
    "```js",
    "console.log('ignored')",
    "```",
  ].join("\n");

  assert.deepEqual(getAllScratchblocksSourcesFromText(markdown), [
    "move (10) steps",
    "turn cw (15) degrees",
  ]);
});

test("ignores empty and incomplete scratchblocks fences", () => {
  assert.deepEqual(
    getAllScratchblocksSourcesFromText(
      ["```scratchblocks", "```", "```sb", "move (10) steps"].join("\n")
    ),
    []
  );
});

test("gets scratchblocks source at a zero-based line", () => {
  const markdown = [
    "# Example",
    "```scratchblocks",
    "when green flag clicked",
    "move (10) steps",
    "```",
  ].join("\n");

  const expected = "when green flag clicked\nmove (10) steps";

  assert.equal(getScratchblocksSourceAtLine(markdown, 1), expected);
  assert.equal(getScratchblocksSourceAtLine(markdown, 2), expected);
  assert.equal(getScratchblocksSourceAtLine(markdown, 3), expected);
  assert.equal(getScratchblocksSourceAtLine(markdown, 0), null);
  assert.equal(getScratchblocksSourceAtLine(markdown, 4), null);
});

test("returns null for an empty or incomplete fence at a line", () => {
  assert.equal(
    getScratchblocksSourceAtLine("```scratchblocks\n```", 0),
    null
  );
  assert.equal(
    getScratchblocksSourceAtLine("```scratchblocks\nmove (10) steps", 1),
    null
  );
});
