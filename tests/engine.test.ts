import { describe, expect, it, vi } from "vitest";

const { loadLanguages, parse, render } = vi.hoisted(() => {
  const createSVG = (): SVGElement => ({
    cloneNode: () => createSVG(),
  }) as unknown as SVGElement;

  return {
    loadLanguages: vi.fn(),
    parse: vi.fn(() => ({})),
    render: vi.fn(() => createSVG()),
  };
});

vi.mock("scratchblocks", () => ({
  default: {
    allLanguages: {},
    loadLanguages,
    parse,
    render,
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

import { ScratchblocksEngine } from "../src/engine";

const renderOptions = {
  languages: ["en"],
  style: "scratch3" as const,
};

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

describe("ScratchblocksEngine", () => {
  it("injects Scratch 2 and Scratch 3 styles", () => {
    const { document, elements } = createDocument();

    ScratchblocksEngine.forDocument(document);

    const style = elements.get("scratchblocks-styles");
    expect(style?.textContent).toContain(".sb-events");
    expect(style?.textContent).toContain(".sb3-events");
  });

  it("injects styles only once per document", () => {
    const first = createDocument();
    const second = createDocument();

    ScratchblocksEngine.forDocument(first.document);
    const firstStyle = first.elements.get("scratchblocks-styles");

    ScratchblocksEngine.forDocument(first.document);
    ScratchblocksEngine.forDocument(second.document);

    expect(first.elements.get("scratchblocks-styles")).toBe(firstStyle);
    expect(second.elements.get("scratchblocks-styles")).toBeDefined();
  });

  it("loads languages only once", () => {
    ScratchblocksEngine.forDocument(createDocument().document);
    ScratchblocksEngine.forDocument(createDocument().document);

    expect(loadLanguages).toHaveBeenCalledTimes(1);
  });

  it("caches repeated SVG renders by default", () => {
    render.mockClear();
    const engine = ScratchblocksEngine.forDocument(
      createDocument().document
    );

    engine.toSVG("move (10) steps", renderOptions);
    engine.toSVG("move (10) steps", renderOptions);

    expect(render).toHaveBeenCalledTimes(1);
  });

  it("can disable the SVG cache", () => {
    render.mockClear();
    const engine = ScratchblocksEngine.forDocument(
      createDocument().document,
      { cacheSize: 0 }
    );

    engine.toSVG("move (10) steps", renderOptions);
    engine.toSVG("move (10) steps", renderOptions);

    expect(render).toHaveBeenCalledTimes(2);
  });

  it("respects a custom SVG cache size", () => {
    render.mockClear();
    const engine = ScratchblocksEngine.forDocument(
      createDocument().document,
      { cacheSize: 1 }
    );

    engine.toSVG("move (10) steps", renderOptions);
    engine.toSVG("turn cw (15) degrees", renderOptions);
    engine.toSVG("move (10) steps", renderOptions);

    expect(render).toHaveBeenCalledTimes(3);
  });
});
