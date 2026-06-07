import { domToPng } from 'modern-screenshot';

const IGNORED_IDS = new Set([
    'bugflow-modal-background',
    'bugflow-sidebar',
    'bugflow-floating-icon',
]);

function isBugflowElement(node) {
    if (!(node instanceof Element)) return false;
    if (IGNORED_IDS.has(node.id)) return true;
    // Every Bugflow web component is registered with a `bugflow-` prefix
    // (bugflow-designer, bugflow-toolbar, bugflow-bug-marker, …). Excluding
    // the whole namespace keeps the Designer overlay out of the capture even
    // when it's already mounted before the screenshot fires.
    return node.tagName?.toLowerCase().startsWith('bugflow-');
}

async function preflight() {
    if (document.fonts?.ready) {
        try {
            await document.fonts.ready;
        } catch {
            // Font loading is best-effort — never block capture on it.
        }
    }
}

// Native <input type="checkbox|radio"> are painted by the OS, not the browser
// engine, so DOM-to-image libraries capture them as blank rectangles. We swap
// each one for a styled SVG overlay just for the duration of the capture call,
// then restore the originals in a finally block.
const FORM_CONTROL_SELECTOR = 'input[type=checkbox], input[type=radio]';

function paintFormControlOverlay(input) {
    const rect = input.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const styles = window.getComputedStyle(input);
    const accent = styles.accentColor && styles.accentColor !== 'auto'
        ? styles.accentColor
        : '#2563eb';
    const isChecked = input.checked;
    const isIndeterminate = input.type === 'checkbox' && input.indeterminate;
    const isRadio = input.type === 'radio';
    const fill = isChecked || isIndeterminate ? accent : '#ffffff';
    const stroke = isChecked || isIndeterminate ? accent : '#9ca3af';

    let inner = '';
    if (isRadio && isChecked) {
        inner = `<circle cx="50" cy="50" r="22" fill="#ffffff"/>`;
    } else if (!isRadio && isIndeterminate) {
        inner = `<rect x="22" y="44" width="56" height="12" rx="2" fill="#ffffff"/>`;
    } else if (!isRadio && isChecked) {
        inner = `<path d="M26 52 L44 70 L74 32" stroke="#ffffff" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }

    const shape = isRadio
        ? `<circle cx="50" cy="50" r="46" fill="${fill}" stroke="${stroke}" stroke-width="6"/>`
        : `<rect x="6" y="6" width="88" height="88" rx="14" fill="${fill}" stroke="${stroke}" stroke-width="6"/>`;

    const overlay = document.createElement('div');
    overlay.setAttribute('data-bugflow-capture-overlay', '');
    overlay.style.cssText = [
        'position:absolute',
        `left:${rect.left + window.scrollX}px`,
        `top:${rect.top + window.scrollY}px`,
        `width:${rect.width}px`,
        `height:${rect.height}px`,
        'pointer-events:none',
        `opacity:${input.disabled ? '0.5' : '1'}`,
        'z-index:2147483646',
    ].join(';');
    overlay.innerHTML = `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">${shape}${inner}</svg>`;

    document.body.appendChild(overlay);
    const prevVisibility = input.style.visibility;
    input.style.visibility = 'hidden';
    return { overlay, input, prevVisibility };
}

function paintFormControlOverlays() {
    const inputs = document.querySelectorAll(FORM_CONTROL_SELECTOR);
    const painted = [];
    inputs.forEach((input) => {
        const entry = paintFormControlOverlay(input);
        if (entry) painted.push(entry);
    });
    return painted;
}

function removeFormControlOverlays(painted) {
    painted.forEach(({ overlay, input, prevVisibility }) => {
        overlay.remove();
        input.style.visibility = prevVisibility;
    });
}

export async function captureHostPage() {
    await preflight();

    const overlays = paintFormControlOverlays();
    try {
        return await domToPng(document.documentElement, {
            filter: (node) => !isBugflowElement(node),
            width: window.innerWidth,
            height: window.innerHeight,
            // The annotator stage renders at CSS pixels — capturing at
            // devicePixelRatio (the modern-screenshot default) costs 4x the work
            // on Retina with no visible benefit downstream.
            scale: 1,
            fetch: { requestInit: { cache: 'force-cache' } },
        });
    } finally {
        removeFormControlOverlays(overlays);
    }
}
