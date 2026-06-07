// Shadow-DOM-scoped CSS for the Toolbar Web Component. Premium Untitled UI
// dark pill-bar matching the extension's Designer/Toolbar.vue.

export const toolbarStyles = `
    :host {
        all: initial;
        position: fixed;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        display: none;
        z-index: 2147483647;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        font-size: 14px;
        line-height: 1.4;
        color: #CECFD2;
        max-width: min(1100px, calc(100vw - 96px));
    }

    :host(.bugflow-toolbar-open) {
        display: block;
    }
    :host(.bugflow-dragging) {
        cursor: grabbing;
    }

    /* The actual toolbar content (row + hint) lives inside #root in the
       shadow tree. The host-level flex rules only ever applied to [<style>,
       <div#root>], which left descendants in block flow — that's why the
       hint pill stretched full-width. Move the flex column here so children
       are properly content-sized and the hint sits centered below the row. */
    #root {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
    }

    /* The pill + Next CTA share a single horizontal row by default, switching
       to a vertical stack when the JS-measured trigger fires (see Toolbar.js
       _updateStackState). The first-run hint pill is a sibling of this row,
       so the hint always renders below regardless of stack state. */
    .bugflow-toolbar-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    .bugflow-toolbar-row.bugflow-stack-cta {
        flex-direction: column;
    }

    button {
        font-family: inherit;
        font-size: inherit;
        color: inherit;
        background: none;
        border: 0;
        margin: 0;
        padding: 0;
        cursor: pointer;
    }

    .bugflow-pill {
        display: flex;
        align-items: stretch;
        gap: 4px;
        background: #161B26;
        border-radius: 16px;
        padding: 6px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .bugflow-tools, .bugflow-properties, .bugflow-style {
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .bugflow-divider {
        align-self: stretch;
        width: 1px;
        margin: 0 4px;
        background: rgba(255, 255, 255, 0.08);
    }

    .bugflow-tool {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        color: #CECFD2;
        transition: background 150ms ease-out, color 150ms ease-out;
    }
    .bugflow-tool:hover {
        background: rgba(255, 255, 255, 0.06);
    }
    .bugflow-tool:focus-visible {
        outline: 2px solid #155EEF;
        outline-offset: 1px;
    }
    .bugflow-tool.active {
        background: #155EEF;
        color: #FFFFFF;
    }
    .bugflow-tool.active:hover {
        background: #2970FF;
    }

    .bugflow-pill-button {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 10px;
        border-radius: 8px;
        color: #CECFD2;
        font-size: 12px;
        transition: background 150ms ease-out;
    }
    .bugflow-pill-button:hover {
        background: rgba(255, 255, 255, 0.06);
    }
    .bugflow-pill-button:focus-visible {
        outline: 2px solid #155EEF;
        outline-offset: 1px;
    }
    .bugflow-pill-button.active {
        background: #155EEF;
        color: #FFFFFF;
    }

    .bugflow-color-swatch {
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.2);
    }

    .bugflow-stroke-preview {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 9999px;
        background: #FFFFFF;
    }
    .bugflow-stroke-preview > span {
        display: block;
        background: #0C111D;
        border-radius: 9999px;
    }

    .bugflow-caret {
        display: inline-block;
        width: 10px;
        height: 10px;
    }

    .bugflow-cta {
        display: flex;
        align-items: center;
        gap: 6px;
        height: 40px;
        padding: 0 16px;
        border-radius: 12px;
        background: #155EEF;
        color: #FFFFFF;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 8px 24px rgba(21, 94, 239, 0.35);
        transition: background 150ms ease-out;
    }
    .bugflow-cta:hover {
        background: #2970FF;
    }
    .bugflow-cta:focus-visible {
        outline: 2px solid #155EEF;
        outline-offset: 2px;
    }

    /* Tier-D active-tool dropdown — overrides the icon-only .bugflow-tool
       width so the slot can expand to fit the tool label + chevron. */
    .bugflow-tool.bugflow-tool-dropdown {
        width: auto;
        min-width: 36px;
        padding: 0 10px;
        gap: 4px;
    }

    .bugflow-popover {
        position: absolute;
        top: calc(100% + 8px);
        background: #161B26;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
        padding: 8px;
        z-index: 1;
        display: none;
    }
    .bugflow-popover.open {
        display: block;
    }

    .bugflow-color-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 6px;
    }
    .bugflow-color-grid button {
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
        transition: box-shadow 150ms ease-out;
    }
    .bugflow-color-grid button:hover {
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4);
    }
    .bugflow-color-grid button.selected {
        box-shadow: inset 0 0 0 2px #FFFFFF;
    }

    /* Custom-color tile — always shows a rainbow so the affordance reads as
       "open a native picker" no matter which color is currently selected.
       The hidden <input type="color"> sibling provides the actual picker. */
    .bugflow-color-custom {
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        background: conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1);
        transition: box-shadow 150ms ease-out;
        overflow: hidden;
    }
    .bugflow-color-custom:hover {
        box-shadow: inset 0 0 0 1px rgba(255,255,255,0.4);
    }
    .bugflow-color-custom.selected {
        box-shadow: inset 0 0 0 2px #FFFFFF;
    }
    .bugflow-popover input[type=color] {
        position: absolute;
        width: 1px;
        height: 1px;
        opacity: 0;
        pointer-events: none;
    }

    .bugflow-menu {
        min-width: 180px;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .bugflow-menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 13px;
        color: #CECFD2;
        cursor: pointer;
        text-align: left;
    }
    .bugflow-menu-item:hover {
        background: rgba(255, 255, 255, 0.06);
    }
    .bugflow-menu-item.selected {
        background: #155EEF;
        color: #FFFFFF;
    }

    input[type=range] {
        accent-color: #155EEF;
        width: 96px;
    }

    .bugflow-pill-host {
        position: relative;
    }

    /* Drag handle — quiet by default, brightens on hover. The whole chrome
       group (pill, Next CTA, hint) follows the host element when dragged. */
    .bugflow-drag-handle {
        width: 24px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        color: #85888E;
        cursor: grab;
        transition: background 150ms ease-out, color 150ms ease-out;
    }
    .bugflow-drag-handle:hover {
        color: #CECFD2;
        background: rgba(255, 255, 255, 0.04);
    }
    .bugflow-drag-handle:focus-visible {
        outline: 2px solid #155EEF;
        outline-offset: 1px;
    }
    :host(.bugflow-dragging) .bugflow-drag-handle {
        cursor: grabbing;
    }

    /* Inline close X — tier-D only. Mirrors drag handle dimensions and tone
       so the two ambient controls bookend the primary CTA symmetrically. */
    .bugflow-inline-close {
        width: 28px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        color: #85888E;
        cursor: pointer;
        transition: background 150ms ease-out, color 150ms ease-out;
    }
    .bugflow-inline-close:hover {
        color: #CECFD2;
        background: rgba(255, 255, 255, 0.04);
    }
    .bugflow-inline-close:focus-visible {
        outline: 2px solid #155EEF;
        outline-offset: 1px;
    }

    /* Mark issue — labeled primary CTA at the head of the pill. Blue when the
       bug-pin tool is active so a first-time user reads it as the recommended
       starting action. .bugflow-mark-issue-dropdown variant adds chevron. */
    .bugflow-mark-issue {
        display: flex;
        align-items: center;
        gap: 8px;
        height: 36px;
        padding: 0 12px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        color: #CECFD2;
        white-space: nowrap;
        transition: background 150ms ease-out, color 150ms ease-out;
    }
    .bugflow-mark-issue > span {
        white-space: nowrap;
    }
    .bugflow-mark-issue:hover {
        background: rgba(255, 255, 255, 0.06);
    }
    .bugflow-mark-issue:focus-visible {
        outline: 2px solid #155EEF;
        outline-offset: 1px;
    }
    .bugflow-mark-issue.active {
        background: #155EEF;
        color: #FFFFFF;
    }
    .bugflow-mark-issue.active:hover {
        background: #2970FF;
    }
    .bugflow-mark-issue-dropdown {
        gap: 6px;
    }

    /* First-run hint — tight, quiet pill that floats below the toolbar.
       Restrained: inline icon (no badge), 12px copy, subtle ring. Sizes
       itself to its content; centered inside the host's flex column. */
    .bugflow-hint {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 6px 6px 12px;
        background: rgba(12, 17, 29, 0.95);
        border: 1px solid rgba(21, 94, 239, 0.30);
        border-radius: 9999px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(12px);
        font-size: 12px;
        line-height: 1;
        color: #FFFFFF;
        font-weight: 500;
        white-space: nowrap;
        max-width: calc(100vw - 24px);
    }
    /* Narrow viewports: let the hint wrap so it isn't clipped off-screen.
       Soft-corner rounded-2xl-ish instead of full pill once it can be more
       than one line tall. */
    @media (max-width: 559px) {
        .bugflow-hint {
            white-space: normal;
            line-height: 1.3;
            border-radius: 14px;
            align-items: flex-start;
        }
        .bugflow-hint-icon-wrap {
            margin-top: 1px;
        }
    }
    .bugflow-hint-icon-wrap {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 9999px;
        background: rgba(21, 94, 239, 0.18);
        flex-shrink: 0;
    }
    .bugflow-hint-icon {
        color: #84CAFF;
        flex-shrink: 0;
    }
    .bugflow-hint-text {
        padding: 0 2px;
    }
    .bugflow-hint-dismiss {
        width: 24px;
        height: 24px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        color: #94969C;
        transition: background 150ms ease-out, color 150ms ease-out;
    }
    .bugflow-hint-dismiss:hover {
        color: #FFFFFF;
        background: rgba(255, 255, 255, 0.08);
    }
    .bugflow-hint-dismiss:focus-visible {
        outline: 2px solid #155EEF;
        outline-offset: 1px;
    }
`;
