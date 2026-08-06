import { describe, expect, it } from "vitest";

import {
  getAllScratchblocksSourcesFromText,
  getInlineScratchblocksSource,
  getScratchblocksSourceAtLine,
} from "../src/markdown";

describe("Markdown", () => {
  it("gets inline scratchblocks source", () => {
    expect(getInlineScratchblocksSource("  sb move (10) steps  "))
      .toBe("move (10) steps");
    expect(getInlineScratchblocksSource("SB when green flag clicked"))
      .toBe("when green flag clicked");
  });

  it("rejects text without inline scratchblocks source", () => {
    expect(getInlineScratchblocksSource("move (10) steps")).toBeNull();
    expect(getInlineScratchblocksSource("sb   ")).toBeNull();
    expect(getInlineScratchblocksSource("sbox")).toBeNull();
  });

  it("gets all supported scratchblocks fences", () => {
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

    expect(getAllScratchblocksSourcesFromText(markdown)).toEqual([
      "move (10) steps",
      "turn cw (15) degrees",
    ]);
  });

  it("ignores empty and incomplete scratchblocks fences", () => {
    expect(getAllScratchblocksSourcesFromText(
      ["```scratchblocks", "```", "```sb", "move (10) steps"].join("\n")
    )).toEqual([]);
  });

  it("gets scratchblocks source at a zero-based line", () => {
    const markdown = [
      "# Example",
      "```scratchblocks",
      "when green flag clicked",
      "move (10) steps",
      "```",
    ].join("\n");

    const expected = "when green flag clicked\nmove (10) steps";

    expect(getScratchblocksSourceAtLine(markdown, 1)).toBe(expected);
    expect(getScratchblocksSourceAtLine(markdown, 2)).toBe(expected);
    expect(getScratchblocksSourceAtLine(markdown, 3)).toBe(expected);
    expect(getScratchblocksSourceAtLine(markdown, 0)).toBeNull();
    expect(getScratchblocksSourceAtLine(markdown, 4)).toBeNull();
  });

  it("returns null for an empty or incomplete fence at a line", () => {
    expect(getScratchblocksSourceAtLine("```scratchblocks\n```", 0)).toBeNull();
    expect(getScratchblocksSourceAtLine(
      "```scratchblocks\nmove (10) steps",
      1
    )).toBeNull();
  });
});
