// Use a global variable so the cache survives Next.js route hot-reloads and
// per-request module re-evaluation (especially in the dev server).
// eslint-disable-next-line no-var
declare global {
  // The overall shape isn't important for the cache holder; keep it as any.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var __FAMILY_TREE_CACHE__: any | undefined;
}

if (!global.__FAMILY_TREE_CACHE__) {
  // Initialise on first import.
  global.__FAMILY_TREE_CACHE__ = null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setCachedFamilyTree(tree: any) {
  global.__FAMILY_TREE_CACHE__ = tree;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCachedFamilyTree(): any {
  return global.__FAMILY_TREE_CACHE__;
}

// Optional helper if we ever need to clear the cache explicitly.
export function clearCachedFamilyTree() {
  global.__FAMILY_TREE_CACHE__ = null;
}
