/** A scratchblocks language code, e.g. `"en"` or `"de"`. */
export type LanguageCode = string;

/** Visual style of the blocks. */
export type ScratchblocksStyle =
  | "scratch2"
  | "scratch3"
  | "scratch3-high-contrast";

/** Rendering options. */
export interface RenderOptions {
  /** Languages used for parsing. */
  languages: LanguageCode[];

  /** Style of the rendered blocks. */
  style: ScratchblocksStyle;

  /** Render scale. Defaults to `1`. */
  scale?: number;
}
