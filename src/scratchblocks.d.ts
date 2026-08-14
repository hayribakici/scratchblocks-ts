declare module "scratchblocks" {
  interface ScratchblocksLanguage {
    name?: string;
    commands?: { EVENT_WHENFLAGCLICKED?: string };
  }

  interface ScratchblocksDocument {
    stringify(): string;
  }

  interface ScratchblocksOptions {
    languages?: string[];
    style?: string;
    scale?: number;
    inline?: boolean;
  }

  interface ScratchblocksView {
    render(): SVGElement;
    exportSVGString(): string;
    exportPNG(callback: (url: string) => void, scale?: number): void;
  }

  interface ScratchblocksApi {
    allLanguages: Record<string, ScratchblocksLanguage | undefined>;
    loadLanguages(
      languages: Record<string, ScratchblocksLanguage | undefined>
    ): void;
    newView(
      document: ScratchblocksDocument,
      options: ScratchblocksOptions
    ): ScratchblocksView;
    parse(source: string, options: ScratchblocksOptions): ScratchblocksDocument;
    render(
      document: ScratchblocksDocument,
      options: ScratchblocksOptions
    ): SVGElement;
  }

  const scratchblocks: ScratchblocksApi;
  export default scratchblocks;
}

declare module "scratchblocks/locales/all.js" {
  interface ScratchblocksLocale {
    name?: string;
    commands?: { EVENT_WHENFLAGCLICKED?: string };
  }

  const languages: Record<string, ScratchblocksLocale | undefined>;
  export default languages;
}
