import { state } from '../state.js';
import { designerStyles } from '../styles/components/designer.js';
import { eventBus } from '../utils/events.js';
import { setEngine } from '../utils/annotator.js';

// Web Component shell for the screenshot annotation step.
//
// The Konva engine + tool definitions live in `@getbugflow/annotator-core`.
// We lazy-import the package the first time `open(dataUrl)` is called so the
// initial embed.js entry chunk stays small — visitors who never enter the
// Design step never download Konva (~140 KB gzipped).
//
// All UI lives inside a Shadow Root with `all: initial` on :host so the host
// page's CSS cannot bleed in.

const template = () => `
    <div class="bugflow-designer-root">
        <div class="bugflow-designer-canvas" id="bugflow-canvas-host"></div>
        <div class="bugflow-designer-frame"></div>
        <div class="bugflow-designer-loading" id="bugflow-loading">
            <span class="spinner"></span>
            <span>Preparing annotator…</span>
        </div>
        <button type="button" class="bugflow-designer-close" id="bugflow-close" aria-label="Close annotation">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M16.5 1.5L1.5 16.5M1.5 1.5L16.5 16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    </div>
`;

let enginePromise = null;
function loadEngine() {
    // Single in-flight import — subsequent opens reuse the cached module.
    if (!enginePromise) {
        enginePromise = import('@getbugflow/annotator-core');
    }
    return enginePromise;
}

// Allow callers to start the import in parallel with the screenshot capture so
// the Designer's "Preparing annotator…" state is invisible on the first open.
export function preloadDesigner() {
    return loadEngine();
}

export class Designer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.engine = null;
        this._mod = null;
        this._keyDownBound = null;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `<style>${designerStyles}</style>${template()}`;
        this.shadowRoot.getElementById('bugflow-close').addEventListener('click', () => this.cancel());
        this._keyDownBound = (e) => this._handleKeyDown(e);

        eventBus.on('designer:open', (data) => this.open(data));
        // Tier-D inline close X lives inside the toolbar pill itself; when the
        // user clicks it, the toolbar emits this event instead of calling our
        // own close button. Same effect — teardown + propagate designer:cancel
        // to the host. The standalone .bugflow-designer-close still handles
        // closing above tier D.
        eventBus.on('toolbar:cancel', () => this.cancel());
    }

    disconnectedCallback() {
        this._teardown();
    }

    async open({ screenshotDataUrl }) {
        // designBug() resolves the screenshot and preloads the engine module
        // before emitting `designer:open`, so by the time we get here both
        // the dataURL and the import are ready. We build the engine first,
        // then flip the open class so the overlay fades in with the
        // screenshot already painted — no flash of empty canvas.
        document.body.style.overflow = 'hidden';

        const mod = await loadEngine();
        this._mod = mod;

        const container = this.shadowRoot.getElementById('bugflow-canvas-host');
        const engine = new mod.Engine({
            container,
            backgroundDataUrl: screenshotDataUrl,
            width: window.innerWidth,
            height: window.innerHeight,
        });
        await engine.load();

        this.classList.add('bugflow-designer-open');
        state.set('reporting_state', 'designing-bug');
        engine.attachKeyboard(window);

        this.engine = engine;
        setEngine(engine, mod);

        document.addEventListener('keydown', this._keyDownBound);
        window.addEventListener('resize', this._handleResize);

        // Start in the bug-pin tool by default — most embed users want to drop
        // a marker and submit, not draw shapes. This matches the spirit of the
        // legacy flow which booted with `location` selected.
        mod.state.set('activeTool', 'bug-pin');

        // Auto-advance: as soon as the user marks the issue with the pin,
        // export the composite + capture pin coords + open the report form.
        // Mirrors the extension's flow so a one-click report works in the
        // embed too. Other tools (rect, arrow, etc.) still require Next.
        this._pinPlacedUnsub = engine.on?.('bug-pin-placed', () => {
            this.submit();
        }) ?? null;

        eventBus.emit('designer-shown');
    }

    async submit() {
        if (!this.engine) return;
        // Capture pin coords before the export — `_teardown()` destroys the
        // engine, so reading `getPinCoordinates()` afterwards would be too
        // late. The shape is `{ source, normalized, source_dimensions }` or
        // null when no pin was placed (e.g. user clicked Done without a pin).
        const pin = this.engine.getPinCoordinates?.() ?? null;
        try {
            const blob = await this.engine.exportComposite();
            const dataUrl = await blobToDataUrl(blob);
            eventBus.emit('designer:done', { dataUrl, blob, pin });
        } catch (err) {
            console.error('[bugflow] export failed', err);
            eventBus.emit('designer:done', { dataUrl: null, blob: null, pin: null, error: err });
        } finally {
            this._teardown();
        }
    }

    cancel() {
        eventBus.emit('designer:cancel');
        this._teardown();
    }

    _teardown() {
        this.classList.remove('bugflow-designer-open');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', this._keyDownBound);
        window.removeEventListener('resize', this._handleResize);
        this._pinPlacedUnsub?.();
        this._pinPlacedUnsub = null;
        if (this.engine) {
            this.engine.destroy();
            this.engine = null;
            setEngine(null);
        }
    }

    _handleResize = () => {
        this.engine?.resize(window.innerWidth, window.innerHeight);
    };

    _handleKeyDown(event) {
        if (event.key === 'Escape') this.cancel();
    }
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
    });
}
