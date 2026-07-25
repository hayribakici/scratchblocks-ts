/**
 * Gets the source from inline text such as `sb move (10) steps`.
 * Returns `null` if the prefix or source is missing.
 *
 * @param text - Text to read
 * @returns The inline source or `null`
 */
export declare function getInlineScratchblocksSource(text: string): string | null;
/**
 * Gets all non-empty scratchblocks fences from Markdown.
 * Both backtick and tilde fences are supported.
 *
 * @param text - Markdown text to read
 * @returns The source from each scratchblocks fence
 */
export declare function getAllScratchblocksSourcesFromText(text: string): string[];
/**
 * Gets the fenced scratchblocks source at a line.
 * The line number is zero-based. Incomplete and empty fences return `null`.
 *
 * @param text - Markdown text to read
 * @param cursorLine - Zero-based line number
 * @returns The source at the line or `null`
 */
export declare function getScratchblocksSourceAtLine(text: string, cursorLine: number): string | null;
