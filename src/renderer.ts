imprt scratchblocks from "scratchblocks";
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
  private static instance: ScratchblocksRenderer | undefined;

  private readonly svgCache = new LRUCache<string, SVGElement>(
    MAX_SVG_CACHE_ENTRIES
  );

  private constructor() {
    scratchblocks.loadLanguages(allLanguages);
    scratchblocks.appendStyles();
  }

  /**
   * Gets the shared renderer for the current page.
   *
   * @returns The renderer instance
   */
  static getInstance(): ScratchblocksRenderer {
    return this.instance ??= new ScratchblocksRenderer();
  }

  /**
   * Gets the shared renderer for the current page.
   *
   * @deprecated Use `getInstance()` instead
   * @returns The renderer instance
   */
  static create(): ScratchblocksRenderer {
    return this.getInstance();
  }

  /** @returns All available language codes */
  getLanguageCodes(): LanguageCode[] {
    return Object.keys(scratchblocks.allLanguages);
  }

  /**
   * Returns the name of a language given `languageCode`,
   * or the `languageCode` itself if it is not available.
   *
   * @param languageCode - Code to get the language name for
   * @returns The language name or the given code
   */
  getLanguageName(languageCode: LanguageCode): string {
    return scratchblocks.allLanguages[languageCode]?.name ?? languageCode;
  }

  /**
   * Returns the localized green flag command
   * (e.g. "Wenn die grüne Flagge angeklickt" in German).
   * Falls back to "when green flag clicked" if the language or command
   * is not available.
   *
   * @param languageCode - Code to get the command for
   * @returns The localized command
   */
  getGreenFlagCommand(languageCode: LanguageCode): string {
    return (
      scratchblocks.allLanguages[languageCode]?.commands?.EVENT_WHENFLAGCLICKED ??
      "when green flag clicked"
    );
  }

  /**
   * @param languageCode - Code to check
   * @returns Whether the language is available
   */
  hasLanguage(languageCode: LanguageCode): boolean {
    return Boolean(scratchblocks.allLanguages[languageCode]);
  }

  /**
   * Renders source as SVG.
   * Results are cached.
   *
   * @param source - Scratchblocks source to render
   * @param options - Languages, style and scale used for rendering
   * @returns The rendered SVG
   */
  toSVG(source: string, options: RenderOptions): SVGElement {
    const renderOptions = withDefaultOptions(options);

    return this.getSVG(source, renderOptions);
  }

  /**
   * Same as `toSVG()`, but for use inside a line of text.
   *
   * @param source - Scratchblocks source to render
   * @param options - Languages, style and scale used for rendering
   * @returns The rendered inline SVG
   */
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

  /**
   * Renders source as an SVG string.
   * SVG strings are not cached.
   *
   * @param source - Scratchblocks source to render
   * @param options - Languages, style and scale used for rendering
   * @returns The rendered SVG markup
   */
  toSVGString(source: string, options: RenderOptions): string {
    const view = this.createView(source, options);
    view.render();
    return view.exportSVGString();
  }

  /**
   * Renders source as a PNG blob.
   * The temporary URL used for the export is cleaned up afterwards.
   *
   * @param source - Scratchblocks source to render
   * @param options - Languages, style and scale used for rendering
   * @returns The rendered PNG
   */
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

  /**
   * Renders source as a loaded image element.
   * The object URL is cleaned up after loading (or on error).
   *
   * @param source - Scratchblocks source to render
   * @param options - Languages, style and scale used for rendering
   * @returns The loaded image element
   * @throws If the rendered PNG cannot be loaded
   */
  async toPNGImage(
    source: string,
    options: RenderOptions
  ): Promise<HTMLImageElement> {
    const blob = await this.toPNGBlob(source, options);
    const url = URL.createObjectURL(blob);
    const image = new Image();

    return new Promise((resolve, reject) => {
      image.addEventListener("load", () => {
        URL.revokeObjectURL(url);
        resolve(image);
      }, { once: true });
      image.addEventListener("error", () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not load rendered Scratchblocks PNG"));
      }, { once: true });
      image.src = url;
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
