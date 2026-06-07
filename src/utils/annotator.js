// Singleton bridge to the active annotator engine + module. The Toolbar Web
// Component cannot import `@getbugflow/annotator-core` directly without
// pulling Konva into the entry chunk and defeating the whole point of
// lazy-loading. Instead, the Designer lazy-loads the package, then publishes
// the engine instance + the resolved module here so the Toolbar can subscribe
// to engine state without ever importing the package itself.

const listeners = new Set();
let engine = null;
let mod = null;

export function setEngine(nextEngine, nextMod = null) {
    engine = nextEngine;
    if (nextMod) mod = nextMod;
    for (const fn of listeners) fn({ engine, mod });
}

export function getEngine() {
    return engine;
}

export function getMod() {
    return mod;
}

export function subscribeEngine(fn) {
    listeners.add(fn);
    fn({ engine, mod });
    return () => listeners.delete(fn);
}
