import scratchblocks from "scratchblocks";
import allLanguages from "scratchblocks/locales/all.js";

import { LRUCache } from "./lru-cache";
import type { LanguageCode, RenderOptions } from "./types";

const MAX_SVG_CACHE_ENTRIES = 100;
const DEFAULT_SCALE = 1;

interface ScratchblocksView {
  render(): SVGElement;
  exportSVGString(): string;
  exportPNG(callback: (url: string) => void, scale?: number): void;
}

export class ScratchblocksRenderer {
  private loaded = false;
  private readonly svgCache = new LRUCache<string, SVGElement>(
    MAX_SVG_CACHE_ENTRIES
  );

  static create(): ScratchblocksRenderer {
    const renderer = new ScratchblocksRenderer();

    renderer.load();

    return renderer;
  }

  load(): void {
    if (this.loaded) { return; }

    scratchblocks.loadLanguages(allLanguages);
    scratchblocks.appendStyles();
    this.loaded = true;
  }

  getLanguageCodes(): LanguageCode[] {
    return Object.keys(scratchblocks.allLanguages);
  }

  getLanguageName(languageCode: LanguageCode): string {
    return scratchblocks.allLanguages[languageCode]?.name ?? languageCode;
  }

  getGreenFlagCommand(languageCode: LanguageCode): string {
    return (
      scratchblocks.allLanguages[languageCode]?.commands?.EVENT_WHENFLAGCLICKED ??
      "when green flag clicked"
    );
  }

  hasLanguage(languageCode: LanguageCode): boolean {
    return Boolean(scratchblocks.allLanguages[languageCode]);
  }

  toSVG(source: string, options: RenderOptions): SVGElement {
    const renderOptions = withDefaultOptions(options);

    return this.getSVG(source, renderOptions);
  }

  toInlineSVG(source: string, options: RenderOptions): SVGElement {
    const renderOptions = withDefaultOptions(options, true);

    return this.getSVG(source, renderOptions);
  }

  private getSVG(
    source: string,
    options: ReturnType<typeof withDefaultOptions>
  ): SVGElement {
    const cacheKey = JSON.stringify({ source, ...options });
    const cached = this.svgCache.get(cacheKey);

    if (cached) {
      return cached.cloneNode(true) as SVGElement;
    }

    const parsed = scratchblocks.parse(source, options);
    const svg = scratchblocks.render(parsed, options);

    this.svgCache.set(cacheKey, svg.cloneNode(true) as SVGElement);

    return svg;
  }

  toSVGString(source: string, options: RenderOptions): string {
    const view = this.createView(source, options);
    view.render();
    return view.exportSVGString();
  }

  async toPNGBlob(source: string, options: RenderOptions): Promise<Blob> {
    const view = this.createView(source, options);
    view.render();

    return new Promise((resolve, reject) => {
      view.exportPNG((url) => {
        void getLocalImageBlob(url)
          .then(resolve, reject)
          .finally(() => {
            if (url.startsWith("blob:")) URL.revokeObjectURL(url);
          });
      });
    });
  }

  private createView(source: string, options: RenderOptions): ScratchblocksView {
    const renderOptions = withDefaultOptions(options);

    return scratchblocks.newView(
      scratchblocks.parse(source, renderOptions),
      renderOptions
    );
  }

}

function withDefaultOptions(
  options: RenderOptions,
  inline = false
) {
  return {
    ...options,
    scale: options.scale ?? DEFAULT_SCALE,
    ...(inline ? { inline: true } : {}),
  };
}

function getLocalImageBlob(url: string): Promise<Blob> {
  if (!url.startsWith("blob:") && !url.startsWith("data:")) {
    return Promise.reject(
      new Error("Refusing to read a non-local Scratchblocks image URL")
    );
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open("GET", url);
    request.responseType = "blob";
    request.addEventListener("load", () => {
      if (request.status === 0 || (request.status >= 200 && request.status < 300)) {
        const response: unknown = request.response;

        if (response instanceof Blob) {
          resolve(response);
          return;
        }

        reject(new Error("Could not read Scratchblocks image blob"));
        return;
      }

      reject(
        new Error(
          `Could not read Scratchblocks image URL: ${String(request.status)}`
        )
      );
    });
    request.addEventListener("error", () => {
      reject(new Error("Could not read Scratchblocks image URL"));
    });
    request.send();
  });
}
