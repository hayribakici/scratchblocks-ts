"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScratchblocksRenderer = void 0;
const scratchblocks_1 = __importDefault(require("scratchblocks"));
const all_js_1 = __importDefault(require("scratchblocks/locales/all.js"));
const lru_cache_1 = require("./lru-cache");
const style_css_js_1 = __importDefault(require("scratchblocks/scratch2/style.css.js"));
const style_css_js_2 = __importDefault(require("scratchblocks/scratch3/style.css.js"));
const STYLE_ELEMENT_ID = "scratchblocks-styles";
const MAX_SVG_CACHE_ENTRIES = 100;
const DEFAULT_SCALE = 1;
let languagesLoaded = false;
function ensureLanguagesLoaded() {
    if (languagesLoaded) {
        return;
    }
    scratchblocks_1.default.loadLanguages(all_js_1.default);
    languagesLoaded = true;
}
class ScratchblocksRenderer {
    constructor(document) {
        this.document = document;
        this.svgCache = new lru_cache_1.LRUCache(MAX_SVG_CACHE_ENTRIES);
        ensureLanguagesLoaded();
        this.injectStylesIfNecessary();
    }
    /** Injects Scratchblocks styles once into this renderer's document. */
    injectStylesIfNecessary() {
        if (this.document.getElementById(STYLE_ELEMENT_ID)) {
            return;
        }
        const style = this.document.createElement("style");
        style.id = STYLE_ELEMENT_ID;
        style.textContent = `${style_css_js_1.default}\n${style_css_js_2.default}`;
        this.document.head.append(style);
    }
    /** @returns All available language codes */
    getLanguageCodes() {
        return Object.keys(scratchblocks_1.default.allLanguages);
    }
    /**
     * Returns the name of a language given `languageCode`,
     * or the `languageCode` itself if it is not available.
     *
     * @param languageCode - Code to get the language name for
     * @returns The language name or the given code
     */
    getLanguageName(languageCode) {
        var _a, _b;
        return (_b = (_a = scratchblocks_1.default.allLanguages[languageCode]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : languageCode;
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
    getGreenFlagCommand(languageCode) {
        var _a, _b, _c;
        return ((_c = (_b = (_a = scratchblocks_1.default.allLanguages[languageCode]) === null || _a === void 0 ? void 0 : _a.commands) === null || _b === void 0 ? void 0 : _b.EVENT_WHENFLAGCLICKED) !== null && _c !== void 0 ? _c : "when green flag clicked");
    }
    /**
     * @param languageCode - Code to check
     * @returns Whether the language is available
     */
    hasLanguage(languageCode) {
        return Boolean(scratchblocks_1.default.allLanguages[languageCode]);
    }
    /**
     * Renders source as SVG.
     * Results are cached.
     *
     * @param source - Scratchblocks source to render
     * @param options - Languages, style and scale used for rendering
     * @returns The rendered SVG
     */
    toSVG(source, options) {
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
    toInlineSVG(source, options) {
        const renderOptions = withDefaultOptions(options, true);
        return this.getSVG(source, renderOptions);
    }
    getSVG(source, options) {
        const cacheKey = JSON.stringify({ source, ...options });
        const cached = this.svgCache.get(cacheKey);
        if (cached) {
            return cached.cloneNode(true);
        }
        const parsed = scratchblocks_1.default.parse(source, options);
        const svg = scratchblocks_1.default.render(parsed, options);
        this.svgCache.set(cacheKey, svg.cloneNode(true));
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
    toSVGString(source, options) {
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
    async toPNGBlob(source, options) {
        const view = this.createView(source, options);
        view.render();
        return new Promise((resolve, reject) => {
            view.exportPNG((url) => {
                void getLocalImageBlob(url)
                    .then(resolve, reject)
                    .finally(() => {
                    if (url.startsWith("blob:"))
                        URL.revokeObjectURL(url);
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
    async toPNGImage(source, options) {
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
    createView(source, options) {
        const renderOptions = withDefaultOptions(options);
        return scratchblocks_1.default.newView(scratchblocks_1.default.parse(source, renderOptions), renderOptions);
    }
}
exports.ScratchblocksRenderer = ScratchblocksRenderer;
function withDefaultOptions(options, inline = false) {
    var _a;
    return {
        ...options,
        scale: (_a = options.scale) !== null && _a !== void 0 ? _a : DEFAULT_SCALE,
        ...(inline ? { inline: true } : {}),
    };
}
function getLocalImageBlob(url) {
    if (!url.startsWith("blob:") && !url.startsWith("data:")) {
        return Promise.reject(new Error("Refusing to read a non-local Scratchblocks image URL"));
    }
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("GET", url);
        request.responseType = "blob";
        request.addEventListener("load", () => {
            if (request.status === 0 || (request.status >= 200 && request.status < 300)) {
                const response = request.response;
                if (response instanceof Blob) {
                    resolve(response);
                    return;
                }
                reject(new Error("Could not read Scratchblocks image blob"));
                return;
            }
            reject(new Error(`Could not read Scratchblocks image URL: ${String(request.status)}`));
        });
        request.addEventListener("error", () => {
            reject(new Error("Could not read Scratchblocks image URL"));
        });
        request.send();
    });
}
