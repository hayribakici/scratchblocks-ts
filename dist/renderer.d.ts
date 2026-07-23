import type { LanguageCode, RenderOptions } from "./types";
export declare class ScratchblocksRenderer {
    private loaded;
    private readonly svgCache;
    static create(): ScratchblocksRenderer;
    load(): void;
    getLanguageCodes(): LanguageCode[];
    getLanguageName(languageCode: LanguageCode): string;
    getGreenFlagCommand(languageCode: LanguageCode): string;
    hasLanguage(languageCode: LanguageCode): boolean;
    toSVG(source: string, options: RenderOptions): SVGElement;
    toInlineSVG(source: string, options: RenderOptions): SVGElement;
    private getSVG;
    toSVGString(source: string, options: RenderOptions): string;
    toPNGBlob(source: string, options: RenderOptions): Promise<Blob>;
    private createView;
}
