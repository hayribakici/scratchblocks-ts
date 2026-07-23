"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScratchblocksRenderer = void 0;
const scratchblocks_1 = __importDefault(require("scratchblocks"));
const all_js_1 = __importDefault(require("scratchblocks/locales/all.js"));
const lru_cache_1 = require("./lru-cache");
const MAX_SVG_CACHE_ENTRIES = 100;
const DEFAULT_SCALE = 1;
class ScratchblocksRenderer {
    constructor() {
        this.loaded = false;
        this.svgCache = new lru_cache_1.LRUCache(MAX_SVG_CACHE_ENTRIES);
    }
    static create() {
        const renderer = new ScratchblocksRenderer();
        renderer.load();
        return renderer;
    }
    load() {
        if (this.loaded) {
            return;
        }
        scratchblocks_1.default.loadLanguages(all_js_1.default);
        scratchblocks_1.default.appendStyles();
        this.loaded = true;
    }
    getLanguageCodes() {
        return Object.keys(scratchblocks_1.default.allLanguages);
    }
    getLanguageName(languageCode) {
        var _a, _b;
        return (_b = (_a = scratchblocks_1.default.allLanguages[languageCode]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : languageCode;
    }
    getGreenFlagCommand(languageCode) {
        var _a, _b, _c;
        return ((_c = (_b = (_a = scratchblocks_1.default.allLanguages[languageCode]) === null || _a === void 0 ? void 0 : _a.commands) === null || _b === void 0 ? void 0 : _b.EVENT_WHENFLAGCLICKED) !== null && _c !== void 0 ? _c : "when green flag clicked");
    }
    hasLanguage(languageCode) {
        return Boolean(scratchblocks_1.default.allLanguages[languageCode]);
    }
    toSVG(source, options) {
        const renderOptions = withDefaultOptions(options);
        return this.getSVG(source, renderOptions);
    }
    toInlineSVG(source, options) {
        const inlineOptions = withDefaultOptions(options, true);
        return this.getSVG(source, inlineOptions);
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
    toSVGString(source, options) {
        const view = this.createView(source, options);
        view.render();
        return view.exportSVGString();
    }
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
