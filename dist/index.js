"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSB3 = exports.ScratchScript = exports.ScratchTarget = exports.ScratchProject = exports.ScratchblocksRenderer = exports.getScratchblocksSourceAtLine = exports.getInlineScratchblocksSource = exports.getAllScratchblocksSourcesFromText = void 0;
var markdown_1 = require("./markdown");
Object.defineProperty(exports, "getAllScratchblocksSourcesFromText", { enumerable: true, get: function () { return markdown_1.getAllScratchblocksSourcesFromText; } });
Object.defineProperty(exports, "getInlineScratchblocksSource", { enumerable: true, get: function () { return markdown_1.getInlineScratchblocksSource; } });
Object.defineProperty(exports, "getScratchblocksSourceAtLine", { enumerable: true, get: function () { return markdown_1.getScratchblocksSourceAtLine; } });
var renderer_1 = require("./renderer");
Object.defineProperty(exports, "ScratchblocksRenderer", { enumerable: true, get: function () { return renderer_1.ScratchblocksRenderer; } });
var project_1 = require("./project/project");
Object.defineProperty(exports, "ScratchProject", { enumerable: true, get: function () { return project_1.ScratchProject; } });
Object.defineProperty(exports, "ScratchTarget", { enumerable: true, get: function () { return project_1.ScratchTarget; } });
Object.defineProperty(exports, "ScratchScript", { enumerable: true, get: function () { return project_1.ScratchScript; } });
Object.defineProperty(exports, "readSB3", { enumerable: true, get: function () { return project_1.readSB3; } });
__exportStar(require("./project/opcodes"), exports);
