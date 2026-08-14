import type { LanguageCode, RenderOptions } from "./types";
export declare class ScratchblocksRenderer {
    private readonly document;
    private readonly svgCache;
    constructor(document: Document, options?: {
        cacheSize?: number;
    });
    /** Injects Scratchblocks styles once into this renderer's document. */
    private injectStylesIfNecessary;
    /** @returns All available language codes */
    getLanguageCodes(): LanguageCode[];
    /**
     * Returns the name of a language given `languageCode`,
     * or the `languageCode` itself if it is not available.
     *
     * @param languageCode - Code to get the language name for
     * @returns The language name or the given code
     */
    getLanguageName(languageCode: LanguageCode): string;
    /**
     * Returns the localized green flag command
     * (e.g. "Wenn die grüne Flagge angeklickt" in German).
     * Falls back to "when green flag clicked" if the language or command
     * is not available.
     *
     * @param languageCode - Code to get the command for
     * @returns The localized command
     */
    getGreenFlagCommand(languageCode: LanguageCode): string;
    /**
     * @param languageCode - Code to check
     * @returns Whether the language is available
     */
    hasLanguage(languageCode: LanguageCode): boolean;
    /**
     * Renders source as SVG.
     * Results are cached unless caching is disabled.
     *
     * @param source - Scratchblocks source to render
     * @param options - Languages, style and scale used for rendering
     * @returns The rendered SVG
     */
    toSVG(source: string, options: RenderOptions): SVGElement;
    /**
     * Same as `toSVG()`, but for use inside a line of text.
     *
     * @param source - Scratchblocks source to render
     * @param options - Languages, style and scale used for rendering
     * @returns The rendered inline SVG
     */
    toInlineSVG(source: string, options: RenderOptions): SVGElement;
    private getSVG;
    /**
     * Renders source as an SVG string.
     * SVG strings are not cached.
     *
     * @param source - Scratchblocks source to render
     * @param options - Languages, style and scale used for rendering
     * @returns The rendered SVG markup
     */
    toSVGString(source: string, options: RenderOptions): string;
    /**
     * Renders source as a PNG blob.
     * The temporary URL used for the export is cleaned up afterwards.
     *
     * @param source - Scratchblocks source to render
     * @param options - Languages, style and scale used for rendering
     * @returns The rendered PNG
     */
    toPNGBlob(source: string, options: RenderOptions): Promise<Blob>;
    /**
     * Renders source as a loaded image element.
     * The object URL is cleaned up after loading (or on error).
     *
     * @param source - Scratchblocks source to render
     * @param options - Languages, style and scale used for rendering
     * @returns The loaded image element
     * @throws If the rendered PNG cannot be loaded
     */
    toPNGImage(source: string, options: RenderOptions): Promise<HTMLImageElement>;
    private createView;
}
