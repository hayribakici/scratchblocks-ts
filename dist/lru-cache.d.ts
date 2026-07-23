export declare class LRUCache<K, V> {
    private readonly maxEntries;
    private readonly entries;
    constructor(maxEntries: number);
    get(key: K): V | null;
    set(key: K, value: V): void;
}
