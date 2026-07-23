export type LanguageCode = string;
export type ScratchblocksStyle = "scratch2" | "scratch3" | "scratch3-high-contrast";
export interface RenderOptions {
    languages: LanguageCode[];
    style: ScratchblocksStyle;
    scale?: number;
}
