// src/index.js
import { registerComponents } from './components/index.js';
import { state } from './state.js';
import { eventBus } from './utils/events.js';
import { bugData } from './utils/bugData.js';
import { captureHostPage } from './utils/capture.js';
import { preloadDesigner } from './components/Designer.js';
import hotkeys from 'hotkeys-js';

class Bugflow {
    constructor() {

    }

    init( options = {} ) {
        this.setOptions( options );

        this.documentReady( () => {
            if( !this.checkExtension() ) {
                this.setOptions( options );
                this.appendUI();
                this.bindHotkeys();
                this.bindEventListeners();
                // Reconcile launcher visibility from config before first paint
                // (hidden when the host runs headless and triggers reporting
                // itself via Bugflow.recordBug()) — no flash.
                this.showFloatingIcon( state.get('show_widget') !== false );
                document.body.setAttribute( 'bugflow-mode', 'embed' );
            }
        });
    }

    documentReady( fn ) {
        if( document.readyState === 'complete' || document.readyState === 'interactive' ) {
            setTimeout(fn, 1);
        } else {
            document.addEventListener( 'DOMContentLoaded', fn );
        }
    }

    appendUI() {
        this.appendFloatingIcon();
        this.appendDesigner();
        this.appendReportingModal();
        this.appendNotification();
    }

    appendFloatingIcon() {
        this.floatingIcon = document.createElement('bugflow-floating-icon');
        document.body.insertAdjacentElement( 'beforeend', this.floatingIcon );
    }

    appendDesigner() {
        this.designer = document.createElement('bugflow-designer');
        this.toolbar = document.createElement('bugflow-toolbar');
        document.body.insertAdjacentElement( 'beforeend', this.designer );
        document.body.insertAdjacentElement( 'beforeend', this.toolbar );
    }

    appendReportingModal() {
        this.reportingModal = document.createElement('bugflow-reporting-modal');
        document.body.insertAdjacentElement( 'beforeend', this.reportingModal );
    }

    appendNotification() {
        this.notification = document.createElement('bugflow-notification');
        document.body.insertAdjacentElement( 'beforeend', this.notification );
    }

    bindHotkeys() {
        hotkeys('ctrl+shift+b', (event) => {
            this.designBug();
        });
    }

    bindEventListeners() {
        eventBus.on('design-bug', () => {
            this.designBug();
        });

        eventBus.on('designer:cancel', () => {
            this.closeDesigner('not-active');
            this.resetToolbar();
            this.showFloatingIcon(true);
        });

        eventBus.on('toolbar:done', () => {
            // Toolbar's "Done" button → ask the Designer to export the
            // composite. Designer fires designer:done with the result.
            this.designer.submit();
        });

        eventBus.on('designer:done', ({ dataUrl, pin }) => {
            this.closeDesigner('reporting-bug');
            this.resetToolbar();
            if (dataUrl) {
                bugData.setScreenshot(dataUrl);
            }
            // Stash bug-pin coords on bugData so they ride along on
            // `meta.bug_pin` in the submit payload — the web-app side
            // bundles them into the issue Description as an AI-agent
            // blockquote alongside the screenshot.
            bugData.setPin(pin || null);
            this.showReportingModal({
                element: null,
                x: 0,
                y: 0,
                relativeX: 0,
                relativeY: 0,
                hasAnnotatedScreenshot: !!dataUrl,
            });
        });

        eventBus.on('close-reporting-modal', () => {
            this.closeReportingModal();
            this.showFloatingIcon(true);
        });

        eventBus.on('reporting-modal-closed', () => {
            let show = state.get('show_widget');
            this.showFloatingIcon(show);
        });
    }

    async designBug() {
        // Preflight FIRST. We refuse to let the visitor invest time in
        // capturing + annotating a screenshot only to find out at submit
        // time that reporting is paused. Server-side cache (60s) absorbs
        // the load even on million-pageview-per-day sites — engaged
        // visitors are the only ones who trigger it, and the cache makes
        // it ~1 computation per minute per project regardless of clicks.
        const preflight = await this.runPreflight();
        if (! preflight.ok) {
            // Skip the capture + annotator entirely. Show the error
            // state in the reporting modal directly.
            this.showReportingModal({ preflightError: preflight.code });
            return;
        }

        // Premium capture flow modeled on Linear / CleanShot: keep the page
        // visible while we work. The floating icon switches to a spinner
        // (instant click acknowledgement), the screenshot capture and the
        // annotator-core import run in parallel, and only once both are
        // ready do we fade the Designer overlay in over the page.
        state.set('reporting_state', 'capturing');
        preloadDesigner();

        let dataUrl = '';
        try {
            dataUrl = await captureHostPage();
        } catch (err) {
            console.error('[bugflow] screenshot capture failed', err);
            state.set('reporting_state', 'not-active');
            return;
        }

        this.floatingIcon.style.display = 'none';
        this.floatingIcon.classList.remove('active');
        eventBus.emit('designer:open', { screenshotDataUrl: dataUrl });
    }

    async runPreflight() {
        const endpoint = state.get('endpoint');
        // The project UUID lives on state.key from the moment the snippet
        // calls bugflow.setKey(...) — bugData.uuid only gets populated at
        // submit time via setBugData(), so we read from state directly.
        const uuid = state.get('key');

        if (! uuid) {
            return { ok: false, code: 'project_key_missing' };
        }

        try {
            const response = await fetch(
                endpoint + '/embed/preflight?uuid=' + encodeURIComponent(uuid),
                { method: 'GET', headers: { 'Accept': 'application/json' } },
            );

            if (response.ok) {
                return { ok: true };
            }

            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                const body = await response.json();
                return { ok: false, code: body?.code || null };
            }

            return { ok: false, code: null };
        } catch {
            // Network failure — don't punish the visitor for a transient
            // blip. Continue with the capture; the submit-time guard
            // catches it if reporting is genuinely paused.
            return { ok: true };
        }
    }

    closeDesigner(newState) {
        // The Designer Web Component manages its own visibility via the
        // bugflow-designer-open class — we just track flow state here.
        state.set('reporting_state', newState);
    }

    resetToolbar() {
        this.toolbar.resetToolbar?.();
    }

    closeReportingModal() {
        this.reportingModal.style.display = 'none';
        this.reportingModal.classList.remove('active');

        state.set('reporting_state', 'not-active');
    }

    showReportingModal( data ) {
        this.reportingModal.style.display = 'flex';
        this.reportingModal.classList.add('active');
        eventBus.emit('reporting-modal-shown', data);
    }

    setOptions( options = {} ) {
        state.update(options);

        this.findHighestZIndex( '*');
    }

    findHighestZIndex( element ) {
        const elements = document.getElementsByTagName( element );
        let highest = Number.MIN_SAFE_INTEGER || -( Math.pow(2,53) - 1 );

        for( let i = 0; i < elements.length; i++ ) {
            const zIndex = Number.parseInt(
                document.defaultView.getComputedStyle( elements[i], null ).getPropertyValue( 'z-index' ),
                10
            );
        }

        state.z_index_base = highest;
    }

    setKey( key ) {
        state.set('key', key);
    }

    showFloatingIcon( show ) {
        // Headless mode: when the host opts out of the launcher at init
        // (`show_widget: false`), it never reappears — not on annotator
        // cancel, not after a report. The host triggers reporting itself via
        // Bugflow.recordBug(). Clamping here keeps every show path honest.
        const actuallyShow = show && state.get('show_widget') !== false;
        state.set('show_floating_icon', actuallyShow);

        if( actuallyShow ) {
            this.floatingIcon.style.display = 'flex';
            this.floatingIcon.classList.add('active');
        } else {
            this.floatingIcon.style.display = 'none';
            this.floatingIcon.classList.remove('active');
        }
    }

    showWidget( show ) {
        state.set('show_widget', show);

        // show or hide the widget
    }

    setAlignment( alignment ) {
        state.set('alignment', alignment);
    }

    setIconTextColor( color ) {
        state.set('icon_text_color', color);
    }

    setWidgetColor( color ) {
        state.set('widget_color', color);
    }

    setWidgetText( text ) {
        state.set('widget_text', text);
    }

    setIcon( icon ) {
        state.set('icon', icon);
    }

    setModalTitle( title ) {
        state.set('modal_title', title);
    }

    setSecondaryText( text ) {
        state.set('secondary_text', text);
    }

    setFeedbackPrompt( text ) {
        state.set('feedback_prompt', text);
    }

    setButtonColor( color ) {
        state.set('button_color', color);
    }

    setTheme( theme ) {
        state.set('theme', theme);
    }

    setShowAdditionalComments( show ) {
        state.set('show_additional_comments', show);
    }

    setTools( tools ) {
        state.set('tools', tools);
    }

    setEndpoint( endpoint ) {
        state.set('endpoint', endpoint);
    }

    /**
     * Shallow-merge custom developer metadata onto whatever was set at init.
     * Designed for SPAs whose context changes after load (app version bump,
     * route change, signed-in user) — call it as often as you like and the
     * latest values ride along on the next submitted report. Passing a
     * null/undefined value for a key removes that key.
     */
    setMetadata( metadata ) {
        if( !metadata || typeof metadata !== 'object' ) {
            return;
        }

        const merged = { ...( state.get('metadata') || {} ) };

        Object.entries( metadata ).forEach( ([key, value]) => {
            if( value === null || value === undefined ) {
                delete merged[key];
            } else {
                merged[key] = value;
            }
        });

        state.set('metadata', merged);
    }

    clearMetadata() {
        state.set('metadata', {});
    }

    checkExtension() {
        return document.body.getAttribute( 'bugflow-mode' );
    }

    recordBug() {
        this.designBug();
    }
}

// Register all components
registerComponents();

// Drain any calls queued by the async-snippet stub before this script loaded.
// The stub places `{ _q: [...] }` on window.Bugflow; we copy the queue out
// before the IIFE wrapper overwrites window.Bugflow with the real exports,
// then replay each call on the real object via setTimeout (which fires after
// the IIFE assignment completes).
const __bugflowQueuedCalls =
    typeof window !== 'undefined' &&
    window.Bugflow &&
    Array.isArray(window.Bugflow._q)
        ? window.Bugflow._q.slice()
        : [];

if (__bugflowQueuedCalls.length) {
    setTimeout(() => {
        __bugflowQueuedCalls.forEach(([method, ...args]) => {
            if (typeof window.Bugflow?.[method] === 'function') {
                window.Bugflow[method](...args);
            }
        });
    }, 0);
}

// Singleton instance
let bugflowInstance = null;

// Helper to check if initialized
const requireInstance = () => {
    if (!bugflowInstance) {
        console.error('Bugflow not initialized. Call Bugflow.init() first.');
        return null;
    }
    return bugflowInstance;
};

export default {
    init: (options) => {
        if (bugflowInstance) {
            console.warn('Bugflow already initialized. Call destroy() first to reinitialize.');
            return false;
        }
        bugflowInstance = new Bugflow();
        return bugflowInstance.init(options);
    },

    setKey: (key) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setKey(key);
        }
    },
    showFloatingIcon: (show) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.showFloatingIcon(show);
        }
    },
    showWidget: (show) => {
        const bugflow = new Bugflow();
        if( bugflow ) {
            bugflow.showWidget(show);
        }
    },
    setAlignment: (alignment) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setAlignment(alignment);
        }
    },
    setIconTextColor: (color) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setIconTextColor(color);
        }
    },
    setWidgetColor: (color) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setWidgetColor(color);
        }
    },
    setWidgetText: (text) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setWidgetText(text);
        }
    },
    setIcon: (icon) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setIcon(icon);
        }
    },
    setModalTitle: (title) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setModalTitle(title);
        }
    },
    setSecondaryText: (text) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setSecondaryText(text);
        }
    },
    setFeedbackPrompt: (text) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setFeedbackPrompt(text);
        }
    },
    setButtonColor: (color) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setButtonColor(color);
        }
    },
    setTheme: (theme) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setTheme(theme);
        }
    },
    setShowAdditionalComments: (show) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setShowAdditionalComments(show);
        }
    },
    setTools: (tools) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setTools(tools);
        }
    },
    setEndpoint: (endpoint) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setEndpoint(endpoint);
        }
    },
    setMetadata: (metadata) => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.setMetadata(metadata);
        }
    },
    clearMetadata: () => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.clearMetadata();
        }
    },
    // Available tool names for reference
    availableTools: ['select', 'bug-pin', 'rectangle', 'ellipse', 'line', 'arrow', 'text', 'number', 'pencil', 'highlight', 'blur'],
    recordBug: () => {
        const bugflow = requireInstance();
        if( bugflow ) {
            bugflow.recordBug();
        }
    }
};