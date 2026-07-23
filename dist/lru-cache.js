"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LRUCache = void 0;
class LRUCache {
    constructor(maxEntries) {
        this.maxEntries = maxEntries;
        this.entries = new Map();
    }
    get(key) {
        if (!this.entries.has(key)) {
            return null;
        }
        const value = this.entries.get(key);
        this.entries.delete(key);
        this.entries.set(key, value);
        return value;
    }
    set(key, value) {
        if (this.maxEntries <= 0) {
            return;
        }
        if (this.entries.has(key)) {
            this.entries.delete(key);
        }
        if (this.entries.size >= this.maxEntries) {
            const oldest = this.entries.keys().next();
            if (!oldest.done) {
                this.entries.delete(oldest.value);
            }
        }
        this.entries.set(key, value);
    }
}
exports.LRUCache = LRUCache;
