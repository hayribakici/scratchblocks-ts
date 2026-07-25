"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScratchblocksSourceAtLine = exports.getAllScratchblocksSourcesFromText = exports.getInlineScratchblocksSource = void 0;
const INLINE_SCRATCHBLOCKS_PREFIX = "sb ";
/**
 * Gets the source from inline text such as `sb move (10) steps`.
 * Returns `null` if the prefix or source is missing.
 *
 * @param text - Text to read
 * @returns The inline source or `null`
 */
function getInlineScratchblocksSource(text) {
    const trimmed = text.trim();
    if (!trimmed.toLowerCase().startsWith(INLINE_SCRATCHBLOCKS_PREFIX)) {
        return null;
    }
    return trimmed.slice(INLINE_SCRATCHBLOCKS_PREFIX.length).trim() || null;
}
exports.getInlineScratchblocksSource = getInlineScratchblocksSource;
/**
 * Gets all non-empty scratchblocks fences from Markdown.
 * Both backtick and tilde fences are supported.
 *
 * @param text - Markdown text to read
 * @returns The source from each scratchblocks fence
 */
function getAllScratchblocksSourcesFromText(text) {
    const sources = [];
    let fenceMarker = "";
    let sourceStartLine = -1;
    const lines = text.split(/\r?\n/);
    for (let line = 0; line < lines.length; line++) {
        const content = lines[line];
        if (!fenceMarker) {
            fenceMarker = getFenceMarker(content);
            if (fenceMarker && isScratchblocksFence(content)) {
                sourceStartLine = line + 1;
            }
            continue;
        }
        if (isClosingFence(content, fenceMarker)) {
            if (sourceStartLine !== -1) {
                const source = lines.slice(sourceStartLine, line).join("\n").trim();
                if (source) {
                    sources.push(source);
                }
            }
            fenceMarker = "";
            sourceStartLine = -1;
        }
    }
    return sources;
}
exports.getAllScratchblocksSourcesFromText = getAllScratchblocksSourcesFromText;
/**
 * Gets the fenced scratchblocks source at a line.
 * The line number is zero-based. Incomplete and empty fences return `null`.
 *
 * @param text - Markdown text to read
 * @param cursorLine - Zero-based line number
 * @returns The source at the line or `null`
 */
function getScratchblocksSourceAtLine(text, cursorLine) {
    const lines = text.split(/\r?\n/);
    const openingFence = findOpeningScratchblocksFence(lines, cursorLine);
    if (openingFence === -1) {
        return null;
    }
    const closingFence = findClosingFence(lines, openingFence + 1);
    if (closingFence === -1) {
        return null;
    }
    const source = lines.slice(openingFence + 1, closingFence).join("\n").trim();
    return source || null;
}
exports.getScratchblocksSourceAtLine = getScratchblocksSourceAtLine;
function getFenceMarker(line) {
    var _a, _b;
    return (_b = (_a = /^(`{3,}|~{3,})/.exec(line.trim())) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : "";
}
function isClosingFence(line, fenceMarker) {
    const trimmed = line.trim();
    const fenceCharacter = fenceMarker[0];
    return ((fenceCharacter === "`" || fenceCharacter === "~") &&
        trimmed.length >= fenceMarker.length &&
        new RegExp(`^${fenceCharacter}+$`).test(trimmed));
}
function isScratchblocksFence(line) {
    return /^(`{3,}|~{3,})(scratchblock|scratchblocks|sb)$/i.test(line.trim());
}
function findOpeningScratchblocksFence(lines, cursorLine) {
    let fenceMarker = "";
    let openingFence = -1;
    const lastLine = Math.min(cursorLine, lines.length - 1);
    for (let line = 0; line <= lastLine; line++) {
        const content = lines[line];
        if (!fenceMarker) {
            fenceMarker = getFenceMarker(content);
            if (fenceMarker && isScratchblocksFence(content)) {
                openingFence = line;
            }
            continue;
        }
        if (isClosingFence(content, fenceMarker)) {
            fenceMarker = "";
            openingFence = -1;
        }
    }
    return openingFence;
}
function findClosingFence(lines, startLine) {
    var _a;
    const fenceMarker = getFenceMarker((_a = lines[startLine - 1]) !== null && _a !== void 0 ? _a : "");
    if (!fenceMarker) {
        return -1;
    }
    for (let line = startLine; line < lines.length; line++) {
        if (isClosingFence(lines[line], fenceMarker)) {
            return line;
        }
    }
    return -1;
}
