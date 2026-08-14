import { describe, expect, it, vi } from "vitest";

const { loadLanguages } = vi.hoisted(() => ({
  loadLanguages: vi.fn(),
}));

vi.mock("scratchblocks", () => ({
  default: {
    allLanguages: {},
    loadLanguages,
  },
}));

vi.mock("scratchblocks/locales/all.js", () => ({
  default: { en: { name: "English" } },
}));

vi.mock("scratchblocks/scratch2/style.css.js", () => ({
  default: ".sb-events { fill: #c88330; }",
}));

vi.mock("scratchblocks/scratch3/style.css.js", () => ({
  default: ".sb3-events { fill: #ffbf00; }",
}));

import { ScratchblocksRenderer } from "../src/renderer";

function createDocument() {
  const elements = new Map<string, { id: string; textContent: string }>();

  const document = {
    getElementById(id: string) {
      return elements.get(id) ?? null;
    },
    createElement() {
      return { id: "", textContent: "" };
    },
    head: {
      append(element: { id: string; textContent: string }) {
        elements.set(element.id, element);
      },
    },
  } as unknown as Document;

  return { document, elements };
}

describe("ScratchblocksRenderer", () => {
  it("injects Scratch 2 and Scratch 3 styles", () => {
    const { document, elements } = createDocument();

    new ScratchblocksRenderer(document);

    const style = elements.get("scratchblocks-styles");
    expect(style?.textContent).toContain(".sb-events");
    expect(style?.textContent).toContain(".sb3-events");
  });

  it("injects styles only once per document", () => {
    const first = createDocument();
    const second = createDocument();

    new ScratchblocksRenderer(first.document);
    const firstStyle = first.elements.get("scratchblocks-styles");

    new ScratchblocksRenderer(first.document);
    new ScratchblocksRenderer(second.document);

    expect(first.elements.get("scratchblocks-styles")).toBe(firstStyle);
    expect(second.elements.get("scratchblocks-styles")).toBeDefined();
  });

  it("loads languages only once", () => {
    new ScratchblocksRenderer(createDocument().document);
    new ScratchblocksRenderer(createDocument().document);

    expect(loadLanguages).toHaveBeenCalledTimes(1);
  });
});
