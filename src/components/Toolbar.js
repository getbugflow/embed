import { toolbarStyles } from '../styles/components/toolbar.js';
import { eventBus } from '../utils/events.js';
import { subscribeEngine, getEngine, getMod } from '../utils/annotator.js';

// Premium pill-bar toolbar (Untitled UI dark) for the embed widget. Mirrors
// the extension's Designer/Toolbar.vue zone-by-zone: Tools / Properties /
// Style / CTA, with a four-tier ResizeObserver that gracefully collapses
// onto narrow viewports.
//
// Does not import @getbugflow/annotator-core directly — receives both the
// engine instance and the resolved module via utils/annotator.js so the
// entry chunk stays small.

// Annotation tools rendered as the secondary icon strip. Mirrors the
// extension: bug-pin is promoted to a labeled "Mark issue" primary CTA above
// this list, and select is dropped entirely (deselect happens contextually
// via empty-canvas clicks). Lower-priority items are the first to spill into
// the "..." overflow when the bar can't fit them all.
const TOOLS = [
    { id: 'rectangle', label: 'Rectangle', priority: 1, icon: iconRectangle },
    { id: 'ellipse',   label: 'Ellipse',   priority: 1, icon: iconEllipse },
    { id: 'line',      label: 'Line',      priority: 2, icon: iconLine },
    { id: 'arrow',     label: 'Arrow',     priority: 1, icon: iconArrow },
    { id: 'text',      label: 'Text',      priority: 1, icon: iconText },
    { id: 'number',    label: 'Number',    priority: 2, icon: iconNumber },
    { id: 'pencil',    label: 'Pencil',    priority: 2, icon: iconPencil },
    { id: 'highlight', label: 'Highlight', priority: 2, icon: iconHighlight },
    { id: 'blur',      label: 'Blur',      priority: 1, icon: iconBlur },
];

// Primary CTA — the "Mark issue" pin. Separated from TOOLS so the rest of the
// render logic can treat it specially (labeled, always inline, blue when
// active). At tier D it folds back into the active-tool dropdown alongside
// the annotation tools.
const MARK_ISSUE_TOOL = { id: 'bug-pin', label: 'Mark issue', icon: iconBugPin };

// Localstorage key for first-run hint dismissal. Persists across sessions —
// once the user has explicitly dismissed the hint or successfully placed
// their first pin, they shouldn't need the explainer again.
const HINT_DISMISSED_KEY = 'bugflow_embed_hint_dismissed';

// Mirrors extension/ColorPill.vue: 9 brand swatches + a 10th "custom" tile that
// opens the OS native color picker. Keeping the palette identical means an
// annotation made in the extension renders with the exact same color when
// reopened from an embed-submitted feedback (and vice versa).
const PALETTE = [
    '#D5000D', '#FC8A1E', '#F6C026', '#118144', '#414EB6',
    '#8F1CAA', '#FB4544', '#FFFFFF', '#000000',
];

const STROKE_OPTIONS = [
    { value: 2,  label: 'Thin' },
    { value: 4,  label: 'Regular' },
    { value: 6,  label: 'Medium' },
    { value: 10, label: 'Thick' },
];

const ARROW_HEADS = [
    { value: 'standard', label: 'Standard' },
    { value: 'fancy',    label: 'Fancy' },
    { value: 'curved',   label: 'Curved' },
    { value: 'double',   label: 'Double' },
];

const LINE_DASH_OPTIONS = [
    { value: false, label: 'Solid' },
    { value: true,  label: 'Dashed' },
];

const FILL_OPTIONS = [
    { value: false, label: 'Outline' },
    { value: true,  label: 'Filled' },
];

const BLUR_MODES = [
    { value: 'pixelate',    label: 'Pixelate' },
    { value: 'blur-secure', label: 'Blur (secure)' },
    { value: 'blur-smooth', label: 'Blur (smooth)' },
    { value: 'blackout',    label: 'Black Out' },
];

// Mirrors extension/PropertiesZone.vue. Stored on `toolDefaults.text.preset`
// and `toolDefaults.text.fontSize` so the engine broadcasts them to the live
// text selection.
const TEXT_PRESETS = [
    { value: 'standard',    label: 'Standard' },
    { value: 'mono',        label: 'Mono' },
    { value: 'box',         label: 'Box' },
    { value: 'mono-box',    label: 'Mono Box' },
    { value: 'rounded-box', label: 'Rounded Box' },
];

const TEXT_PRESET_STYLES = {
    standard:      { fontFamily: 'system-ui, sans-serif', fontWeight: 500, background: 'transparent' },
    mono:          { fontFamily: 'ui-monospace, monospace', fontWeight: 500, background: 'transparent' },
    box:           { fontFamily: 'system-ui, sans-serif', fontWeight: 600, background: 'rgba(255,255,255,0.18)', padding: '2px 6px', borderRadius: '4px' },
    'mono-box':    { fontFamily: 'ui-monospace, monospace', fontWeight: 500, background: 'rgba(255,255,255,0.18)', padding: '2px 6px', borderRadius: '4px' },
    'rounded-box': { fontFamily: 'system-ui, sans-serif', fontWeight: 600, background: 'rgba(255,255,255,0.18)', padding: '2px 9px', borderRadius: '999px' },
};

// CleanShot's font-size ladder, identical to extension/PropertiesZone.vue.
const TEXT_SIZES = [10, 13, 16, 20, 24, 30, 36, 48, 72, 96, 144, 216, 288];

export class Toolbar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._unsubEngine = null;
        this._unsubState = [];
        this._tier = 'A';
        this._observer = null;
        this._openPopover = null;
        // One-way latch: flips true the first time the user produces an
        // annotation (op-pushed) or places a bug pin. Gates the Next CTA so
        // an empty annotation can't be submitted, and so the toolbar isn't
        // visually unbalanced on first load.
        this._hasTakenAction = false;
        this._unsubEngineEvents = [];
        // Content-measured stack trigger — see _updateStackState. Set as
        // `bugflow-stack-cta` class on the host so CSS can flip the host's
        // flex-direction without forcing a re-render.
        this._pillObserver = null;
        this._pillWidth = 0;
        // First-run hint visibility. Hydrated from localStorage on first
        // render so customer-site reloads don't spam the explainer.
        try {
            this._hintDismissed = window.localStorage?.getItem(HINT_DISMISSED_KEY) === '1';
        } catch (_) {
            this._hintDismissed = false;
        }
        // Drag state — null until the user grabs the handle, then committed
        // pixel coords from the last drop. Resets when the toolbar tears
        // down so each fresh annotation session starts top-centered.
        this._position = null;
        this._isDragging = false;
        this._dragStartRect = null;
        this._dragPointerStart = null;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `<style>${toolbarStyles}</style><div id="root"></div>`;

        this._unsubEngine = subscribeEngine(({ engine, mod }) => {
            this._teardownStateSubs();
            this._teardownEngineEvents();
            if (engine && mod) {
                this.classList.add('bugflow-toolbar-open');
                // Reset per-session state — opening a fresh annotation
                // should center the toolbar again and require fresh marking.
                this._hasTakenAction = false;
                this._position = null;
                this._isDragging = false;
                // Default to bug-pin so "Mark issue" reads as the primary
                // CTA on first paint, matching the extension's flow.
                if (mod.state.get('activeTool') !== 'bug-pin') {
                    mod.state.set('activeTool', 'bug-pin');
                }
                this._applyPositionStyle();
                this._render();
                this._bindStateSubs();
                this._bindEngineEvents(engine);
            } else {
                this.classList.remove('bugflow-toolbar-open');
                this._render();
            }
        });

        // Tier classification for adaptive layout. Run once on connect, then
        // again whenever the host viewport resizes. The same observer also
        // re-evaluates the content-measured stack trigger because viewport
        // changes affect available width.
        this._observer = new ResizeObserver(() => {
            this._recomputeTier();
            this._updateStackState();
        });
        this._observer.observe(document.documentElement);
        this._recomputeTier();

        // Close popovers on click-outside.
        this._onDocClick = (e) => {
            if (this._openPopover && !this.shadowRoot.contains(e.composedPath()[0])) {
                this._closePopover();
            }
        };
        document.addEventListener('click', this._onDocClick, true);
    }

    disconnectedCallback() {
        this._unsubEngine?.();
        this._teardownStateSubs();
        this._teardownEngineEvents();
        this._observer?.disconnect();
        this._pillObserver?.disconnect();
        this._pillObserver = null;
        document.removeEventListener('click', this._onDocClick, true);
    }

    _observePill() {
        const pill = this.shadowRoot?.querySelector('.bugflow-pill');
        this._pillObserver?.disconnect();
        if (!pill) {
            this._pillWidth = 0;
            this._updateStackState();
            return;
        }
        this._pillObserver = new ResizeObserver((entries) => {
            this._pillWidth = entries[0]?.contentRect.width ?? 0;
            this._updateStackState();
        });
        this._pillObserver.observe(pill);
    }

    _updateStackState() {
        // Stack the Next CTA below the pill when a horizontal row wouldn't
        // fit inside the viewport. Content-measured rather than tier-gated
        // because the pill's natural width depends on which tool is active.
        const NEXT_BUTTON_WIDTH = 92; // approximate "Next →" labeled pill
        const ROW_GAP = 8;
        const BUFFER = 32; // breathing room from viewport edges
        const horizontalNeeded = this._pillWidth + ROW_GAP + NEXT_BUTTON_WIDTH;
        const available = window.innerWidth - BUFFER;
        const shouldStack = this._hasTakenAction && this._pillWidth > 0 && horizontalNeeded > available;
        const row = this.shadowRoot?.querySelector('.bugflow-toolbar-row');
        if (row) row.classList.toggle('bugflow-stack-cta', shouldStack);
    }

    _bindEngineEvents(engine) {
        // Placing a bug pin auto-advances to the reporting modal (see
        // Designer.js), so the Next CTA would only flash on screen for the
        // few frames between op-pushed and the designer tearing itself down.
        // Ignore op-pushed while bug-pin is the active tool — the pin's own
        // attachInteractive() pushes an op, and that's the only op-pushed
        // we'd ever see in this flow.
        this._unsubEngineEvents.push(engine.on('op-pushed', () => {
            if (this._hasTakenAction) return;
            const mod = getMod();
            if (mod?.state.get('activeTool') === 'bug-pin') return;
            this._hasTakenAction = true;
            this._render();
        }));
        this._unsubEngineEvents.push(engine.on('bug-pin-placed', () => {
            this._dismissHint();
        }));
    }

    _dismissHint() {
        if (this._hintDismissed) return;
        this._hintDismissed = true;
        try { window.localStorage?.setItem(HINT_DISMISSED_KEY, '1'); } catch (_) { /* private mode */ }
        this._render();
    }

    _teardownEngineEvents() {
        while (this._unsubEngineEvents.length) this._unsubEngineEvents.pop()?.();
    }

    resetToolbar() {
        const mod = getMod();
        if (mod) mod.state.set('activeTool', 'bug-pin');
    }

    _bindStateSubs() {
        const mod = getMod();
        if (!mod) return;
        const rerender = () => this._render();
        for (const key of ['activeTool', 'selectedColor', 'strokeWidth', 'toolDefaults', 'selectedNode']) {
            this._unsubState.push(mod.state.subscribe(key, rerender));
        }
    }

    _teardownStateSubs() {
        while (this._unsubState.length) this._unsubState.pop()();
    }

    _recomputeTier() {
        const w = window.innerWidth - 32;
        // Tier C bumped 520→560 so the C→D transition kicks in before the
        // pill clips on mid-narrow viewports. Tier D folds the entire tool
        // strip into a single active-tool dropdown (see _render).
        const next = w >= 920 ? 'A' : w >= 720 ? 'B' : w >= 560 ? 'C' : 'D';
        if (next !== this._tier) {
            this._tier = next;
            this._render();
        }
    }

    _render() {
        const root = this.shadowRoot.getElementById('root');
        if (!root) return;

        const engine = getEngine();
        const mod = getMod();
        if (!engine || !mod) {
            root.innerHTML = '';
            return;
        }

        const activeTool = mod.state.get('activeTool');
        const selectedColor = mod.state.get('selectedColor');
        const strokeWidth = mod.state.get('strokeWidth');
        const toolDefaults = mod.state.get('toolDefaults');

        const tier = this._tier;
        // Tier-driven tool layout. A/B keep every annotation tool inline; C
        // spills priority-2 (never the active tool) into the "..." overflow;
        // D collapses the entire primary + tools strip into one active-tool
        // dropdown that includes Mark issue, matching the extension.
        const primaryAsDropdown = tier === 'D';
        let visibleTools = [];
        let overflowTools = [];
        if (tier === 'A' || tier === 'B') {
            visibleTools = TOOLS;
        } else if (tier === 'C') {
            visibleTools = TOOLS.filter(t => t.priority <= 1 || t.id === activeTool);
            const visibleIds = new Set(visibleTools.map(t => t.id));
            overflowTools = TOOLS.filter(t => !visibleIds.has(t.id));
        }
        // At tier D the dropdown trigger shows whatever tool is active —
        // Mark issue when on bug-pin, the active annotation tool otherwise.
        const activeAnnotation = TOOLS.find(t => t.id === activeTool);
        const primarySlot = (!primaryAsDropdown || activeTool === 'bug-pin' || !activeAnnotation)
            ? MARK_ISSUE_TOOL
            : activeAnnotation;
        const tierDDropdownTools = [MARK_ISSUE_TOOL, ...TOOLS];

        const propertiesVisible = ['rectangle', 'ellipse', 'line', 'arrow', 'text', 'blur'].includes(activeTool);
        const styleVisible = ['rectangle', 'ellipse', 'line', 'arrow', 'text', 'number', 'pencil', 'highlight'].includes(activeTool);
        const showHint = activeTool === 'bug-pin' && !this._hintDismissed;
        // Inline close X lives inside the pill at tier D so the chrome reads
        // as one balanced object on phones (drag on the left, close on the
        // right, primary in the middle). Above tier D the standalone X in
        // designer.js handles closing; styles hide it under 560px to match.
        const inlineClose = tier === 'D';

        root.innerHTML = `
            <div class="bugflow-toolbar-row">
                <div class="bugflow-pill">
                    ${dragHandle()}
                    ${primaryAsDropdown
                        ? primarySlotDropdown(primarySlot, tierDDropdownTools, activeTool)
                        : markIssueButton(activeTool === 'bug-pin')
                    }
                    ${primaryAsDropdown ? '' : '<span class="bugflow-divider"></span>'}
                    ${primaryAsDropdown ? '' : `
                        <div class="bugflow-tools">
                            ${visibleTools.map(t => toolButton(t, activeTool === t.id)).join('')}
                            ${overflowTools.length ? overflowMenu(overflowTools, activeTool) : ''}
                        </div>
                    `}
                    ${propertiesVisible ? '<span class="bugflow-divider"></span>' : ''}
                    ${propertiesVisible ? propertiesZone(activeTool, toolDefaults) : ''}
                    ${styleVisible ? '<span class="bugflow-divider"></span>' : ''}
                    ${styleVisible ? `
                        <div class="bugflow-style">
                            ${colorPill(selectedColor)}
                            ${strokePill(strokeWidth)}
                        </div>
                    ` : ''}
                    ${inlineClose ? '<span class="bugflow-divider"></span>' : ''}
                    ${inlineClose ? inlineCloseButton() : ''}
                </div>
                ${this._hasTakenAction ? `
                    <button type="button" class="bugflow-cta" id="bugflow-cta" aria-label="Next">
                        <span>Next</span>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M1.16667 6.99996H12.8333M12.8333 6.99996L7.00001 1.16663M12.8333 6.99996L7.00001 12.8333" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                ` : ''}
            </div>
            ${showHint ? firstRunHint() : ''}
        `;

        this._wireEvents();
        // Re-observe after every render — innerHTML replacement creates a
        // fresh .bugflow-pill element each time, invalidating the prior
        // ResizeObserver target. _observePill also runs _updateStackState
        // synchronously so the host class is correct before the first paint.
        this._observePill();
    }

    _wireEvents() {
        const root = this.shadowRoot.getElementById('root');
        const mod = getMod();
        if (!root || !mod) return;

        for (const btn of root.querySelectorAll('[data-tool]')) {
            btn.addEventListener('click', () => {
                this._closePopover();
                mod.state.set('activeTool', btn.dataset.tool);
            });
        }
        for (const btn of root.querySelectorAll('[data-color]')) {
            btn.addEventListener('click', () => {
                mod.state.set('selectedColor', btn.dataset.color);
                this._closePopover();
            });
        }
        for (const btn of root.querySelectorAll('[data-stroke]')) {
            btn.addEventListener('click', () => {
                mod.state.set('strokeWidth', Number(btn.dataset.stroke));
                this._closePopover();
            });
        }
        for (const btn of root.querySelectorAll('[data-arrow-head]')) {
            btn.addEventListener('click', () => {
                mod.state.setToolDefault('arrow', { head: btn.dataset.arrowHead });
                this._closePopover();
            });
        }
        for (const btn of root.querySelectorAll('[data-blur-mode]')) {
            btn.addEventListener('click', () => {
                mod.state.setToolDefault('blur', { mode: btn.dataset.blurMode });
                this._closePopover();
            });
        }
        for (const btn of root.querySelectorAll('[data-popover-toggle]')) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._togglePopover(btn.dataset.popoverToggle);
            });
        }
        const intensity = root.querySelector('[data-blur-intensity]');
        if (intensity) {
            intensity.addEventListener('input', (e) => {
                mod.state.setToolDefault('blur', { intensity: Number(e.target.value) });
            });
        }
        for (const btn of root.querySelectorAll('[data-fill]')) {
            btn.addEventListener('click', () => {
                const shape = btn.dataset.fillShape;
                mod.state.setToolDefault(shape, { fill: btn.dataset.fill === 'true' });
                this._closePopover();
            });
        }
        for (const btn of root.querySelectorAll('[data-line-dash]')) {
            btn.addEventListener('click', () => {
                mod.state.setToolDefault('line', { dashed: btn.dataset.lineDash === 'true' });
                this._closePopover();
            });
        }
        for (const btn of root.querySelectorAll('[data-text-preset]')) {
            btn.addEventListener('click', () => {
                mod.state.setToolDefault('text', { preset: btn.dataset.textPreset });
                this._closePopover();
            });
        }
        for (const btn of root.querySelectorAll('[data-text-size]')) {
            btn.addEventListener('click', () => {
                mod.state.setToolDefault('text', { fontSize: Number(btn.dataset.textSize) });
                this._closePopover();
            });
        }
        // Custom color: delegate to a hidden <input type="color"> so the user
        // gets the OS native picker, matching ColorPill.vue. We click the input
        // synchronously inside the user gesture; the picker shows up over the
        // popover and the swatch closes the popover on commit.
        const customColorBtn = root.querySelector('[data-custom-color]');
        const nativeColor = root.querySelector('[data-native-color]');
        if (customColorBtn && nativeColor) {
            customColorBtn.addEventListener('click', () => nativeColor.click());
            nativeColor.addEventListener('input', (e) => {
                mod.state.set('selectedColor', e.target.value);
            });
            nativeColor.addEventListener('change', () => this._closePopover());
        }
        const cta = root.querySelector('#bugflow-cta');
        if (cta) cta.addEventListener('click', () => eventBus.emit('toolbar:done'));

        const handle = root.querySelector('[data-drag-handle]');
        if (handle) handle.addEventListener('pointerdown', (e) => this._startDrag(e));

        const dismissBtn = root.querySelector('[data-hint-dismiss]');
        if (dismissBtn) dismissBtn.addEventListener('click', () => this._dismissHint());

        const inlineCloseBtn = root.querySelector('[data-inline-close]');
        if (inlineCloseBtn) inlineCloseBtn.addEventListener('click', () => eventBus.emit('toolbar:cancel'));
    }

    // ---------- Drag ----------
    // Mirrors the extension's useToolbarChrome behavior. Tracks pointer move
    // on document with capture so the drag survives moving over iframes,
    // popovers, etc. Clamps to the viewport with an 8px breathing margin.
    _startDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        this._isDragging = true;
        this._dragStartRect = this.getBoundingClientRect();
        this._dragPointerStart = { x: e.clientX, y: e.clientY };
        this._onDragMoveBound = (ev) => this._onDragMove(ev);
        this._onDragEndBound = () => this._onDragEnd();
        document.addEventListener('pointermove', this._onDragMoveBound, true);
        document.addEventListener('pointerup', this._onDragEndBound, true);
        this.classList.add('bugflow-dragging');
    }

    _onDragMove(e) {
        if (!this._isDragging || !this._dragStartRect) return;
        const dx = e.clientX - this._dragPointerStart.x;
        const dy = e.clientY - this._dragPointerStart.y;
        const left = clamp(this._dragStartRect.left + dx, 8, window.innerWidth - this._dragStartRect.width - 8);
        const top = clamp(this._dragStartRect.top + dy, 8, window.innerHeight - this._dragStartRect.height - 8);
        this._position = { left, top };
        this._applyPositionStyle();
    }

    _onDragEnd() {
        if (!this._isDragging) return;
        this._isDragging = false;
        document.removeEventListener('pointermove', this._onDragMoveBound, true);
        document.removeEventListener('pointerup', this._onDragEndBound, true);
        this.classList.remove('bugflow-dragging');
    }

    _applyPositionStyle() {
        // Inline-style override of the default top-12 / centered position
        // declared in :host CSS. Cleared (style.left = '') resets to the
        // CSS default so the toolbar re-centers on the next session.
        if (this._position) {
            this.style.left = `${this._position.left}px`;
            this.style.top = `${this._position.top}px`;
            this.style.transform = 'none';
        } else {
            this.style.left = '';
            this.style.top = '';
            this.style.transform = '';
        }
    }

    _togglePopover(id) {
        const root = this.shadowRoot.getElementById('root');
        const popover = root.querySelector(`[data-popover="${id}"]`);
        if (!popover) return;
        if (this._openPopover === popover) {
            this._closePopover();
        } else {
            this._closePopover();
            popover.classList.add('open');
            this._openPopover = popover;
        }
    }

    _closePopover() {
        if (this._openPopover) {
            this._openPopover.classList.remove('open');
            this._openPopover = null;
        }
    }
}

// ---------- Utilities ----------

function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
}

// ---------- Render helpers ----------

function toolButton(t, active) {
    return `
        <button type="button" class="bugflow-tool${active ? ' active' : ''}" data-tool="${t.id}" aria-label="${t.label}" title="${t.label}">
            ${t.icon()}
        </button>
    `;
}

// Inline close X — only rendered at tier D. Mirrors the drag handle's muted
// look on the opposite side of the pill so the chrome reads as a single
// balanced object on phones (subtle bookends bracketing the primary CTA).
// Wired in _wireEvents via [data-inline-close]; emits 'toolbar:cancel' which
// Designer.js listens for and treats the same as its own cancel().
function inlineCloseButton() {
    return `
        <button type="button" class="bugflow-inline-close" data-inline-close aria-label="Close annotation">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M9 3L3 9M3 3l6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    `;
}

// Drag handle. Sits at the very left of the pill so the user can grab the
// whole chrome (pill + Next + hint) and reposition it without breaking the
// visual cluster. Wired in _wireEvents via [data-drag-handle].
function dragHandle() {
    return `
        <button type="button" class="bugflow-drag-handle" data-drag-handle aria-label="Drag toolbar">
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
                <circle cx="2" cy="3" r="1.2" fill="currentColor"/>
                <circle cx="2" cy="8" r="1.2" fill="currentColor"/>
                <circle cx="2" cy="13" r="1.2" fill="currentColor"/>
                <circle cx="8" cy="3" r="1.2" fill="currentColor"/>
                <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
                <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
            </svg>
        </button>
    `;
}

// Primary CTA — the labeled "Mark issue" pin. Always blue when active so a
// first-time user reads it as the recommended starting action.
function markIssueButton(active) {
    return `
        <button type="button" class="bugflow-mark-issue${active ? ' active' : ''}" data-tool="bug-pin" aria-label="Mark issue">
            ${iconBugPin()}
            <span>Mark issue</span>
        </button>
    `;
}

// Tier-D substitute for the primary slot + tools strip + overflow menu. The
// trigger shows whichever tool is active (Mark issue when on bug-pin, the
// annotation tool otherwise) as a labeled, highlighted pill with a chevron;
// the popover contains every tool including Mark issue so the user can
// switch with two taps. Popover items reuse the [data-tool] handler.
function primarySlotDropdown(primary, dropdownTools, activeTool) {
    return `
        <div class="bugflow-pill-host">
            <button type="button" class="bugflow-mark-issue active bugflow-mark-issue-dropdown" data-popover-toggle="active-tool" aria-label="Current tool: ${primary.label}. Tap to switch.">
                ${primary.icon()}
                <span>${primary.label}</span>
                ${caret()}
            </button>
            <div class="bugflow-popover" data-popover="active-tool" style="left: 0; right: auto;">
                <div class="bugflow-menu">
                    ${dropdownTools.map(t => `
                        <button type="button" class="bugflow-menu-item${activeTool === t.id ? ' selected' : ''}" data-tool="${t.id}">
                            ${t.icon()}
                            <span>${t.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// First-run hint pill — sits below the toolbar row, dismissible. Restrained
// composition: tiny pin icon inline (no badge background), tight copy, quiet
// close button. Auto-dismisses on first bug-pin placement; manual dismiss
// persists to localStorage.
function firstRunHint() {
    return `
        <div class="bugflow-hint" role="status">
            <span class="bugflow-hint-icon-wrap">
                <svg class="bugflow-hint-icon" width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 1.5C3.93 1.5 2.25 3.18 2.25 5.25C2.25 8.06 6 10.5 6 10.5C6 10.5 9.75 8.06 9.75 5.25C9.75 3.18 8.07 1.5 6 1.5ZM6 6.375C5.38 6.375 4.875 5.87 4.875 5.25C4.875 4.63 5.38 4.125 6 4.125C6.62 4.125 7.125 4.63 7.125 5.25C7.125 5.87 6.62 6.375 6 6.375Z" fill="currentColor"/>
                </svg>
            </span>
            <span class="bugflow-hint-text">Tap anywhere on the page to mark the issue</span>
            <button type="button" class="bugflow-hint-dismiss" data-hint-dismiss aria-label="Dismiss hint">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M9 1L1 9M1 1L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
    `;
}

function overflowMenu(tools, active) {
    return `
        <div class="bugflow-pill-host">
            <button type="button" class="bugflow-tool" data-popover-toggle="overflow" aria-label="More tools">
                ${iconMore()}
            </button>
            <div class="bugflow-popover" data-popover="overflow" style="right: 0; left: auto;">
                <div class="bugflow-menu">
                    ${tools.map(t => `
                        <button type="button" class="bugflow-menu-item${active === t.id ? ' selected' : ''}" data-tool="${t.id}">
                            ${t.icon()}
                            <span>${t.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function colorPill(selectedColor) {
    const isCustom = !PALETTE.some(c => c.toLowerCase() === (selectedColor || '').toLowerCase());
    return `
        <div class="bugflow-pill-host">
            <button type="button" class="bugflow-pill-button" data-popover-toggle="color" aria-label="Color">
                <span class="bugflow-color-swatch" style="background:${selectedColor};"></span>
                ${caret()}
            </button>
            <div class="bugflow-popover" data-popover="color" style="right: 0; left: auto;">
                <div class="bugflow-color-grid">
                    ${PALETTE.map(c => `
                        <button type="button" data-color="${c}" class="${c.toLowerCase() === (selectedColor || '').toLowerCase() ? 'selected' : ''}" style="background:${c};" aria-label="${c}"></button>
                    `).join('')}
                    <button type="button" class="bugflow-color-custom${isCustom ? ' selected' : ''}" data-custom-color aria-label="Custom color"></button>
                </div>
                <input type="color" data-native-color value="${selectedColor || '#FFFFFF'}" tabindex="-1" aria-hidden="true" />
            </div>
        </div>
    `;
}

// CleanShot-style diagonal stroke preview. Stroke width scales with the option
// value; canvas size stays constant so "Thin" reads as a hairline and "Thick"
// reads as chunky. Mirrors extension/StrokePill.vue.
function strokeMark(width) {
    const sw = Math.max(1.25, Math.min(6, width * 0.6));
    return `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><line x1="5" y1="17" x2="17" y2="5" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round"/></svg>`;
}

function strokePill(strokeWidth) {
    return `
        <div class="bugflow-pill-host">
            <button type="button" class="bugflow-pill-button" data-popover-toggle="stroke" aria-label="Stroke width">
                ${strokeMark(strokeWidth)}
                ${caret()}
            </button>
            <div class="bugflow-popover" data-popover="stroke" style="right: 0; left: auto;">
                <div class="bugflow-menu">
                    ${STROKE_OPTIONS.map(opt => `
                        <button type="button" class="bugflow-menu-item${strokeWidth === opt.value ? ' selected' : ''}" data-stroke="${opt.value}">
                            <span style="display:inline-flex; align-items:center; flex:1;">${strokeMark(opt.value)}</span>
                            <span style="margin-left:auto; opacity:0.7; font-size:11px;">${opt.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function propertiesZone(activeTool, toolDefaults) {
    let inner = '';
    if (activeTool === 'arrow') {
        const head = toolDefaults.arrow?.head ?? 'standard';
        inner = `
            <div class="bugflow-pill-host">
                <button type="button" class="bugflow-pill-button" data-popover-toggle="arrow-head">
                    ${iconArrow()}
                    <span style="text-transform:capitalize;">${head}</span>
                    ${caret()}
                </button>
                <div class="bugflow-popover" data-popover="arrow-head">
                    <div class="bugflow-menu">
                        ${ARROW_HEADS.map(o => `
                            <button type="button" class="bugflow-menu-item${head === o.value ? ' selected' : ''}" data-arrow-head="${o.value}">
                                ${iconArrow()}
                                <span>${o.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    } else if (activeTool === 'blur') {
        const mode = toolDefaults.blur?.mode ?? 'pixelate';
        const intensity = toolDefaults.blur?.intensity ?? 10;
        inner = `
            <div class="bugflow-pill-host">
                <button type="button" class="bugflow-pill-button" data-popover-toggle="blur-mode">
                    ${iconBlur()}
                    <span style="text-transform:capitalize;">${mode.replace('-', ' ')}</span>
                    ${caret()}
                </button>
                <div class="bugflow-popover" data-popover="blur-mode">
                    <div class="bugflow-menu">
                        ${BLUR_MODES.map(o => `
                            <button type="button" class="bugflow-menu-item${mode === o.value ? ' selected' : ''}" data-blur-mode="${o.value}">
                                ${iconBlur()}
                                <span>${o.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:8px; padding:0 10px; height:36px;">
                <input type="range" min="2" max="40" value="${intensity}" data-blur-intensity aria-label="Blur intensity" />
            </div>
        `;
    } else if (activeTool === 'rectangle' || activeTool === 'ellipse') {
        const filled = toolDefaults[activeTool]?.fill ?? false;
        const shape = activeTool; // 'rectangle' | 'ellipse'
        inner = `
            <div class="bugflow-pill-host">
                <button type="button" class="bugflow-pill-button" data-popover-toggle="fill">
                    ${fillPreview(shape, filled)}
                    <span style="font-size:12px;">${filled ? 'Filled' : 'Outline'}</span>
                    ${caret()}
                </button>
                <div class="bugflow-popover" data-popover="fill">
                    <div class="bugflow-menu">
                        ${FILL_OPTIONS.map(o => `
                            <button type="button" class="bugflow-menu-item${filled === o.value ? ' selected' : ''}" data-fill="${o.value}" data-fill-shape="${shape}">
                                ${fillPreview(shape, o.value)}
                                <span>${o.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    } else if (activeTool === 'line') {
        const dashed = toolDefaults.line?.dashed ?? false;
        inner = `
            <div class="bugflow-pill-host">
                <button type="button" class="bugflow-pill-button" data-popover-toggle="line-dash">
                    ${iconLineDash(dashed)}
                    <span style="font-size:12px;">${dashed ? 'Dashed' : 'Solid'}</span>
                    ${caret()}
                </button>
                <div class="bugflow-popover" data-popover="line-dash">
                    <div class="bugflow-menu">
                        ${LINE_DASH_OPTIONS.map(o => `
                            <button type="button" class="bugflow-menu-item${dashed === o.value ? ' selected' : ''}" data-line-dash="${o.value}">
                                ${iconLineDash(o.value)}
                                <span>${o.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    } else if (activeTool === 'text') {
        const preset = toolDefaults.text?.preset ?? 'box';
        const fontSize = toolDefaults.text?.fontSize ?? 20;
        inner = `
            <div class="bugflow-pill-host">
                <button type="button" class="bugflow-pill-button" data-popover-toggle="text-preset">
                    ${textPresetPreview(preset)}
                    <span style="text-transform:capitalize;">${preset.replace('-', ' ')}</span>
                    ${caret()}
                </button>
                <div class="bugflow-popover" data-popover="text-preset">
                    <div class="bugflow-menu" style="min-width:200px;">
                        ${TEXT_PRESETS.map(o => `
                            <button type="button" class="bugflow-menu-item${preset === o.value ? ' selected' : ''}" data-text-preset="${o.value}">
                                ${textPresetPreview(o.value)}
                                <span>${o.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="bugflow-pill-host">
                <button type="button" class="bugflow-pill-button" data-popover-toggle="text-size" aria-label="Font size">
                    <span style="font-size:12px; font-variant-numeric: tabular-nums;">${fontSize} pt</span>
                    ${caret()}
                </button>
                <div class="bugflow-popover" data-popover="text-size">
                    <div class="bugflow-menu" style="min-width:140px; max-height:280px; overflow-y:auto;">
                        ${TEXT_SIZES.map(size => `
                            <button type="button" class="bugflow-menu-item${fontSize === size ? ' selected' : ''}" data-text-size="${size}">
                                <span style="font-size:11px; width:24px; text-align:center; opacity:0.7;">Aa</span>
                                <span style="font-variant-numeric: tabular-nums;">${size} pt</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    return `<div class="bugflow-properties">${inner}</div>`;
}

// Mini "Aa" rendered in each preset's structural style. Colors stay neutral
// (white-on-dark) so the toolbar reads as iconography, not as a color sample —
// the actual annotation uses the user's selectedColor.
function textPresetPreview(preset) {
    const s = TEXT_PRESET_STYLES[preset] || TEXT_PRESET_STYLES.standard;
    const styleStr = Object.entries({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '24px',
        height: '20px',
        fontSize: '13px',
        lineHeight: 1,
        color: '#FFFFFF',
        ...s,
    }).map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}:${v}`).join(';');
    return `<span aria-hidden="true" style="${styleStr}">Aa</span>`;
}

// Outline/filled previews for the rectangle and ellipse properties dropdown.
// Sized to read at the same scale as the line Solid/Dashed previews so the
// dropdowns feel like a single family rather than ad-hoc icon choices.
function fillPreview(shape, filled) {
    if (shape === 'ellipse') {
        return filled
            ? `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><ellipse cx="10" cy="10" rx="7" ry="6" fill="currentColor"/></svg>`
            : `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><ellipse cx="10" cy="10" rx="7" ry="6" stroke="currentColor" stroke-width="1.75"/></svg>`;
    }
    return filled
        ? `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="4" width="14" height="12" rx="1.5" fill="currentColor"/></svg>`
        : `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="3" y="4" width="14" height="12" rx="1.5" stroke="currentColor" stroke-width="1.75"/></svg>`;
}

function caret() {
    return `<svg class="bugflow-caret" width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// ---------- Icons (inline SVG, currentColor) ----------

function iconBugPin()   { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M15 7.5C15 12 9 16 9 16C9 16 3 12 3 7.5C3 5.91 3.63 4.39 4.76 3.26C5.88 2.13 7.41 1.5 9 1.5C10.59 1.5 12.12 2.13 13.24 3.26C14.37 4.39 15 5.91 15 7.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7.5" r="2" stroke="currentColor" stroke-width="1.5"/></svg>`; }
function iconRectangle(){ return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="2.75" y="3.75" width="12.5" height="10.5" rx="1.5" stroke="currentColor" stroke-width="1.5"/></svg>`; }
function iconEllipse()  { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><ellipse cx="9" cy="9" rx="6.25" ry="5.25" stroke="currentColor" stroke-width="1.5"/></svg>`; }
function iconLine()     { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 15L15 3" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`; }
function iconArrow()    { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M14 4L4 14M4 14V7M4 14H11" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function iconText()     { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 4V3H15V4M9 3V15M7 15H11" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function iconNumber()   { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="9" cy="9" r="6.5" stroke="currentColor" stroke-width="1.5"/><text x="9" y="12" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="700" fill="currentColor">1</text></svg>`; }
function iconPencil()   { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M11.5 2.5L15.5 6.5L6 16H2V12L11.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function iconHighlight(){ return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="3" y="6" width="12" height="6" rx="1" stroke="currentColor" stroke-width="1.5" fill="currentColor" fill-opacity="0.2"/></svg>`; }
function iconBlur()     { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><rect x="3" y="3" width="3" height="3" fill="currentColor" opacity="0.4"/><rect x="6" y="3" width="3" height="3" fill="currentColor" opacity="0.7"/><rect x="9" y="3" width="3" height="3" fill="currentColor" opacity="0.3"/><rect x="12" y="3" width="3" height="3" fill="currentColor" opacity="0.6"/><rect x="3" y="6" width="3" height="3" fill="currentColor" opacity="0.6"/><rect x="6" y="6" width="3" height="3" fill="currentColor" opacity="0.3"/><rect x="9" y="6" width="3" height="3" fill="currentColor" opacity="0.7"/><rect x="12" y="6" width="3" height="3" fill="currentColor" opacity="0.4"/><rect x="3" y="9" width="3" height="3" fill="currentColor" opacity="0.3"/><rect x="6" y="9" width="3" height="3" fill="currentColor" opacity="0.6"/><rect x="9" y="9" width="3" height="3" fill="currentColor" opacity="0.4"/><rect x="12" y="9" width="3" height="3" fill="currentColor" opacity="0.7"/><rect x="3" y="12" width="3" height="3" fill="currentColor" opacity="0.7"/><rect x="6" y="12" width="3" height="3" fill="currentColor" opacity="0.4"/><rect x="9" y="12" width="3" height="3" fill="currentColor" opacity="0.6"/><rect x="12" y="12" width="3" height="3" fill="currentColor" opacity="0.3"/></svg>`; }
function iconMore()     { return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><circle cx="4" cy="9" r="1.25" fill="currentColor"/><circle cx="9" cy="9" r="1.25" fill="currentColor"/><circle cx="14" cy="9" r="1.25" fill="currentColor"/></svg>`; }
function iconLineDash(dashed) {
    const dash = dashed ? ' stroke-dasharray="3 3"' : '';
    return `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 9L15 9" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"${dash}/></svg>`;
}
