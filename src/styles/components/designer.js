// Shadow-DOM-scoped CSS for the Designer Web Component.
// Untitled UI dark visual language; mirrors the extension's Designer.vue.
// Everything is scoped via :host so host-page CSS cannot bleed in even when
// the host page uses aggressive resets like `* { all: revert }`.

export const designerStyles = `
    :host {
        all: initial;
        display: block;
        position: fixed;
        inset: 0;
        z-index: 2147483646;
        font-family: system-ui, sans-serif;
        color: #CECFD2;
        opacity: 0;
        pointer-events: none;
        visibility: hidden;
        transition: opacity 280ms cubic-bezier(0.32, 0.72, 0, 1), visibility 0s linear 280ms;
    }

    :host(.bugflow-designer-open) {
        opacity: 1;
        pointer-events: auto;
        visibility: visible;
        transition: opacity 280ms cubic-bezier(0.32, 0.72, 0, 1), visibility 0s linear 0s;
    }

    .bugflow-designer-root {
        position: fixed;
        inset: 0;
        background: #0C111D;
        overflow: hidden;
    }

    .bugflow-designer-canvas {
        position: absolute;
        inset: 0;
        cursor: crosshair;
        z-index: 10;
    }

    .bugflow-designer-canvas canvas {
        display: block;
    }

    .bugflow-designer-frame {
        position: absolute;
        inset: 0;
        pointer-events: none;
        border: 3px solid rgba(21, 94, 239, 0.8);
        z-index: 20;
    }

    .bugflow-designer-close {
        position: fixed;
        right: 12px;
        top: 12px;
        z-index: 60;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #161B26;
        color: #FFFFFF;
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        cursor: pointer;
        box-shadow: 0 8px 24px rgba(0,0,0,0.45);
        transition: background 150ms ease-out;
    }
    .bugflow-designer-close:hover {
        background: #1F242F;
    }
    .bugflow-designer-close:focus-visible {
        outline: 2px solid #155EEF;
        outline-offset: 2px;
    }
    /* Below 560px the close X is pulled into the toolbar pill itself
       (tier D), so the floating corner button is redundant. Hiding it
       prevents two visually-competing close affordances on phones. */
    @media (max-width: 559px) {
        .bugflow-designer-close {
            display: none;
        }
    }

    /* Hidden by default. designBug() awaits both the capture and the engine
       import before opening the overlay, so this state is rarely seen — only
       used as a defensive fallback if a future code path opens the Designer
       without a screenshot in hand. */
    .bugflow-designer-loading {
        position: absolute;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: #CECFD2;
        font-size: 14px;
        z-index: 15;
    }

    .bugflow-designer-loading .spinner {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid rgba(255,255,255,0.15);
        border-top-color: #155EEF;
        animation: bugflow-spin 0.8s linear infinite;
    }

    @keyframes bugflow-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
    }
`;
