import { describe, expect, it } from "vitest";

import { LRUCache } from "../src/lru-cache";

describe("LRUCache", () => {
  it("evicts the least recently used entry", () => {
    const cache = new LRUCache<string, number>(2);

    cache.set("one", 1);
    cache.set("two", 2);
    expect(cache.get("one")).toBe(1);

    cache.set("three", 3);

    expect(cache.get("two")).toBeNull();
    expect(cache.get("one")).toBe(1);
    expect(cache.get("three")).toBe(3);
  });

  it("does not cache entries when max size is zero", () => {
    const cache = new LRUCache<string, number>(0);

    cache.set("one", 1);

    expect(cache.get("one")).toBeNull();
  });
});
