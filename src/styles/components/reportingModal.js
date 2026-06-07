export const reportingModalStyles = `
    /* Shadow-root scoped reset. box-sizing keeps the width/padding math
       predictable across the responsive rules below. */
    :host *, :host *::before, :host *::after {
        box-sizing: border-box;
    }

    /* ===========================================================
       Theme tokens.

       The host carries a data-theme attribute (auto | light | dark).
       Light is the base so a missing attribute can never render an
       unstyled surface. Dark overrides via [data-theme="dark"]; "auto"
       follows the visitor's OS via prefers-color-scheme. The owner's
       accent (button color) is injected inline on the host as
       --bf-accent / --bf-accent-ring / --bf-accent-contrast, so it
       themes correctly in either mode.
       =========================================================== */
    :host {
        display: none;

        --bf-scrim: rgba(16, 24, 40, 0.55);
        --bf-surface: #FFFFFF;
        --bf-surface-sunken: #F9FAFB;
        --bf-text: #101828;
        --bf-text-secondary: #475467;
        --bf-text-tertiary: #98A2B3;
        --bf-label: #344054;
        --bf-border: #D0D5DD;
        --bf-border-subtle: #EAECF0;
        --bf-input-bg: #FFFFFF;
        --bf-placeholder: #98A2B3;
        --bf-link: #155EEF;
        --bf-close: #98A2B3;
        --bf-close-hover-bg: #F2F4F7;
        --bf-error: #D92D20;
        --bf-error-text: #B42318;
        --bf-error-border: #FDA29B;
        --bf-error-halo: #FEE4E2;
        --bf-error-halo-outer: #FEF3F2;
        --bf-brand-mark: #039855;
        --bf-brand-halo: #D1FADF;
        --bf-brand-halo-outer: #ECFDF3;
        --bf-shadow: 0px 20px 24px -4px rgba(16, 24, 40, 0.10), 0px 8px 8px -4px rgba(16, 24, 40, 0.04);

        --bf-accent: #155EEF;
        --bf-accent-contrast: #FFFFFF;
        --bf-accent-ring: rgba(21, 94, 239, 0.20);
    }

    :host([data-theme="dark"]) {
        --bf-scrim: rgba(0, 0, 0, 0.60);
        --bf-surface: #161B26;
        --bf-surface-sunken: #0C111D;
        --bf-text: #F5F5F6;
        --bf-text-secondary: #94969C;
        --bf-text-tertiary: #85888E;
        --bf-label: #CECFD2;
        --bf-border: #333741;
        --bf-border-subtle: #1F242F;
        --bf-input-bg: #0C111D;
        --bf-placeholder: #85888E;
        --bf-link: #84ADFF;
        --bf-close: #85888E;
        --bf-close-hover-bg: #1F242F;
        --bf-error: #F97066;
        --bf-error-text: #FDA29B;
        --bf-error-border: #B42318;
        --bf-error-halo: rgba(240, 68, 56, 0.16);
        --bf-error-halo-outer: rgba(240, 68, 56, 0.08);
        --bf-brand-mark: #47CD89;
        --bf-brand-halo: rgba(23, 178, 106, 0.16);
        --bf-brand-halo-outer: rgba(23, 178, 106, 0.08);
        --bf-shadow: 0px 20px 32px -8px rgba(0, 0, 0, 0.55), 0px 8px 16px -8px rgba(0, 0, 0, 0.40);
    }

    @media (prefers-color-scheme: dark) {
        :host([data-theme="auto"]) {
            --bf-scrim: rgba(0, 0, 0, 0.60);
            --bf-surface: #161B26;
            --bf-surface-sunken: #0C111D;
            --bf-text: #F5F5F6;
            --bf-text-secondary: #94969C;
            --bf-text-tertiary: #85888E;
            --bf-label: #CECFD2;
            --bf-border: #333741;
            --bf-border-subtle: #1F242F;
            --bf-input-bg: #0C111D;
            --bf-placeholder: #85888E;
            --bf-link: #84ADFF;
            --bf-close: #85888E;
            --bf-close-hover-bg: #1F242F;
            --bf-error: #F97066;
            --bf-error-text: #FDA29B;
            --bf-error-border: #B42318;
            --bf-error-halo: rgba(240, 68, 56, 0.16);
            --bf-error-halo-outer: rgba(240, 68, 56, 0.08);
            --bf-brand-mark: #47CD89;
            --bf-brand-halo: rgba(23, 178, 106, 0.16);
            --bf-brand-halo-outer: rgba(23, 178, 106, 0.08);
            --bf-shadow: 0px 20px 32px -8px rgba(0, 0, 0, 0.55), 0px 8px 16px -8px rgba(0, 0, 0, 0.40);
        }
    }

    /* ===========================================================
       Scrim + shell
       =========================================================== */
    :host div#bugflow-modal-background {
        position: fixed;
        inset: 0;
        z-index: 999999999;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--bf-scrim);
        overflow-y: auto;
        overscroll-behavior: contain;
        -webkit-overflow-scrolling: touch;
        /* Respect the iPhone home-indicator / dynamic-island corridors. */
        padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
    }

    /* The shell is height-capped and lays out as header / scrollable body /
       pinned footer. This is what lets the Submit button stay reachable in a
       short window (e.g. a Tauri desktop shell) — the body scrolls, the
       footer never leaves the viewport. */
    :host div#bugflow-modal {
        display: flex;
        flex-direction: column;
        position: relative;
        width: 100%;
        max-width: 460px;
        /* Size to content; only scroll when it would exceed the viewport (the
           short-window / Tauri case). A fixed px cap forced a premature
           scrollbar whenever the default content was a touch taller than it. */
        max-height: calc(100vh - 32px);
        max-height: calc(100dvh - 32px);
        margin: auto;
        background-color: var(--bf-surface);
        border-radius: 16px;
        box-shadow: var(--bf-shadow);
        overflow: hidden;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    }

    /* Phones: trim radius + horizontal padding for more input room. */
    @media (max-width: 520px) {
        :host div#bugflow-modal-background {
            padding: max(12px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
        }
        :host div#bugflow-modal {
            border-radius: 14px;
        }
    }

    /* ===========================================================
       Form view: header / body / footer
       =========================================================== */
    :host div#bugflow-modal-form {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
    }

    :host div#bugflow-modal-form[hidden] {
        display: none;
    }

    :host div.bugflow-modal-header {
        flex: 0 0 auto;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 20px 20px 0 20px;
    }

    :host div.bugflow-modal-body {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 14px 20px 6px 20px;
    }

    :host div.bugflow-modal-footer {
        flex: 0 0 auto;
        padding: 16px 20px 18px 20px;
        border-top: 1px solid var(--bf-border-subtle);
    }

    @media (max-width: 520px) {
        :host div.bugflow-modal-header { padding: 16px 16px 0 16px; }
        :host div.bugflow-modal-body { padding: 12px 16px 4px 16px; }
        :host div.bugflow-modal-footer { padding: 14px 16px 16px 16px; }
    }

    /* ---- Brand badge ---- */
    :host div.bugflow-brand-badge {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--bf-brand-mark);
        background-color: var(--bf-brand-halo);
        box-shadow: 0 0 0 6px var(--bf-brand-halo-outer);
        margin: 6px 0 4px 0;
    }

    /* ---- Close ---- */
    :host button#bugflow-close-reporting-modal {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        margin: -2px -4px 0 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        color: var(--bf-close);
        background-color: transparent;
        transition: background-color 120ms ease, color 120ms ease;
    }

    :host button#bugflow-close-reporting-modal:hover {
        background-color: var(--bf-close-hover-bg);
        color: var(--bf-text-secondary);
    }

    :host button#bugflow-close-reporting-modal:focus-visible {
        outline: none;
        box-shadow: 0 0 0 4px var(--bf-accent-ring);
    }

    /* ---- Title + subtitle (top of the scrollable body) ---- */
    :host h2#bugflow-guest-reporting-modal-title {
        margin: 0;
        font-weight: 600;
        font-size: 18px;
        line-height: 26px;
        letter-spacing: -0.01em;
        color: var(--bf-text);
    }

    :host h3#bugflow-guest-reporting-modal-secondary-text {
        margin: 4px 0 0 0;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        color: var(--bf-text-secondary);
    }

    /* ===========================================================
       Inputs
       =========================================================== */
    :host div.bugflow-input-container {
        display: flex;
        flex-direction: column;
        margin-top: 14px;
    }

    :host div.bugflow-input-container.first-container {
        margin-top: 18px;
    }

    :host div.bugflow-input-container.relative {
        position: relative;
    }

    :host div.bugflow-input-container#bugflow-long-description-container {
        display: none;
        margin-top: 10px;
    }

    :host div.bugflow-input-container label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        line-height: 20px;
        font-weight: 500;
        color: var(--bf-label);
    }

    /* 16px font-size on inputs is deliberate — anything smaller triggers
       iOS Safari's focus auto-zoom on customer mobile pages. */
    :host div#bugflow-modal input[type="text"],
    :host div#bugflow-modal input[type="email"],
    :host div#bugflow-modal textarea {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        width: 100%;
        margin: 0 !important;
        padding: 10px 14px;
        font-size: 16px;
        line-height: 24px;
        font-family: inherit;
        color: var(--bf-text);
        background-color: var(--bf-input-bg);
        border: 1px solid var(--bf-border);
        border-radius: 10px;
        box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.04);
        transition: border-color 120ms ease, box-shadow 120ms ease;
    }

    :host div#bugflow-modal input::placeholder,
    :host div#bugflow-modal textarea::placeholder {
        color: var(--bf-placeholder);
    }

    :host div#bugflow-modal input[type="text"]:hover,
    :host div#bugflow-modal input[type="email"]:hover,
    :host div#bugflow-modal textarea:hover {
        border-color: var(--bf-text-tertiary);
    }

    :host div#bugflow-modal input[type="text"]:focus,
    :host div#bugflow-modal input[type="email"]:focus,
    :host div#bugflow-modal textarea:focus {
        outline: none;
        border-color: var(--bf-accent);
        box-shadow: 0 0 0 4px var(--bf-accent-ring);
    }

    :host div#bugflow-modal input.invalid,
    :host div#bugflow-modal textarea.invalid {
        border-color: var(--bf-error-border);
        background-image: url('data:image/svg+xml,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.99992 5.34302V8.00968M7.99992 10.6764H8.00659M14.6666 8.00968C14.6666 11.6916 11.6818 14.6764 7.99992 14.6764C4.31802 14.6764 1.33325 11.6916 1.33325 8.00968C1.33325 4.32779 4.31802 1.34302 7.99992 1.34302C11.6818 1.34302 14.6666 4.32779 14.6666 8.00968Z" stroke="%23F04438" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/></svg>');
        background-repeat: no-repeat;
        background-position: right 12px center;
        padding-right: 40px;
    }

    :host div#bugflow-modal input.invalid:focus,
    :host div#bugflow-modal textarea.invalid:focus {
        box-shadow: 0 0 0 4px rgba(240, 68, 56, 0.18);
    }

    :host div#bugflow-modal input[type="text"].no-input-icon {
        background-image: none;
    }

    :host span.bugflow-validation {
        margin-top: 6px;
        font-size: 12px;
        line-height: 16px;
        color: var(--bf-error-text);
        display: none;
    }

    :host div#bugflow-modal textarea#bugflow-description {
        height: 96px;
        resize: none;
    }

    :host div.bugflow-input-container span#bugflow-issue-title-length {
        position: absolute;
        right: 12px;
        top: 32px;
        font-size: 12px;
        color: var(--bf-text-tertiary);
        display: none;
    }

    :host div.bugflow-input-container span#bugflow-issue-title-length.over-limit {
        color: var(--bf-error-text);
    }

    /* ---- Additional comments link ---- */
    :host button#bugflow-add-additional-comments {
        align-self: flex-start;
        margin-top: 10px;
        padding: 0;
        font-size: 14px;
        font-weight: 500;
        font-family: inherit;
        color: var(--bf-link);
        background-color: transparent;
        border: none;
        cursor: pointer;
    }

    :host button#bugflow-add-additional-comments:hover {
        text-decoration: underline;
    }

    /* ===========================================================
       Attachments — unified thumbnail grid (screenshot first, then images,
       then a dashed add tile). Each thumbnail hover-reveals an expand
       (lightbox) overlay and a corner remove.
       =========================================================== */
    :host div#bugflow-attachments-container {
        margin-top: 14px;
    }

    :host div#bugflow-attachments-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    /* Class-only (not div-scoped) — the "+" tile is a <button>, and it must
       get the same 64×64 box as the <div> thumbnails or it collapses to a
       content-width sliver. */
    :host .bugflow-attach-tile {
        position: relative;
        flex-shrink: 0;
        width: 64px;
        height: 64px;
        border-radius: 12px;
    }

    :host div.bugflow-attach-thumb {
        background-position: center;
        background-size: cover;
        background-color: var(--bf-surface);
        border: 1px solid var(--bf-border-subtle);
        overflow: hidden;
        cursor: zoom-in;
        transition: transform 140ms ease, box-shadow 140ms ease;
    }

    :host div.bugflow-attach-thumb:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
    }

    :host button.bugflow-attach-expand {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border: none;
        cursor: zoom-in;
        color: #FFFFFF;
        background: rgba(0, 0, 0, 0);
        opacity: 0;
        transition: opacity 120ms ease, background-color 120ms ease;
    }

    :host div.bugflow-attach-thumb:hover button.bugflow-attach-expand,
    :host button.bugflow-attach-expand:focus-visible {
        opacity: 1;
        background: rgba(0, 0, 0, 0.40);
        outline: none;
    }

    :host button.bugflow-attach-remove {
        position: absolute;
        top: 4px;
        right: 4px;
        z-index: 2;
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        border: none;
        cursor: pointer;
        color: #FFFFFF;
        background: rgba(0, 0, 0, 0.55);
        opacity: 0;
        transform: scale(0.9);
        transition: opacity 120ms ease, transform 120ms ease, background-color 120ms ease;
    }

    :host div.bugflow-attach-thumb:hover button.bugflow-attach-remove,
    :host button.bugflow-attach-remove:focus-visible {
        opacity: 1;
        transform: scale(1);
        outline: none;
    }

    :host button.bugflow-attach-remove:hover {
        background: rgba(0, 0, 0, 0.78);
    }

    :host button.bugflow-attach-add {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px dashed var(--bf-border);
        background: transparent;
        color: var(--bf-text-tertiary);
        cursor: pointer;
        transition: border-color 120ms ease, color 120ms ease, background-color 120ms ease;
    }

    :host button.bugflow-attach-add:hover {
        border-color: var(--bf-text-tertiary);
        color: var(--bf-text);
        background-color: var(--bf-surface-sunken);
    }

    :host button.bugflow-attach-add:focus-visible {
        outline: none;
        box-shadow: 0 0 0 4px var(--bf-accent-ring);
    }

    :host div.bugflow-attach-preparing {
        border: 1px solid var(--bf-border-subtle);
        overflow: hidden;
    }

    :host div.bugflow-attach-preparing span.bugflow-prepare-thumb {
        display: block;
        width: 100%;
        height: 100%;
        background: linear-gradient(100deg, var(--bf-border-subtle) 30%, var(--bf-surface) 50%, var(--bf-border-subtle) 70%);
        background-size: 200% 100%;
        animation: bugflow-shimmer 1.4s ease-in-out infinite;
    }

    /* The newest tile springs in; existing tiles don't re-animate. */
    :host div.bugflow-attach-tile.bugflow-tile-pop {
        animation: bugflow-tile-pop 200ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Surfaces the otherwise-invisible drag-drop + paste capability and gives
       the section visual completeness. Device-aware via CSS only. */
    :host span.bugflow-attach-hint {
        display: block;
        margin-top: 10px;
        font-size: 12px;
        line-height: 16px;
        color: var(--bf-text-tertiary);
    }

    :host span.bugflow-attach-hint-touch {
        display: none;
    }

    @media (hover: none) {
        :host span.bugflow-attach-hint-pointer {
            display: none;
        }
        :host span.bugflow-attach-hint-touch {
            display: inline;
        }
    }

    :host span#bugflow-images-error {
        display: none;
        margin-top: 8px;
    }

    @keyframes bugflow-shimmer {
        from { background-position: 200% 0; }
        to { background-position: -200% 0; }
    }

    @keyframes bugflow-tile-pop {
        from { transform: scale(0.85); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }

    /* ===========================================================
       Footer — submit + attribution
       =========================================================== */
    :host button#bugflow-submit-feedback {
        width: 100%;
        padding: 11px 16px;
        font-size: 15px;
        line-height: 22px;
        font-weight: 600;
        font-family: inherit;
        color: var(--bf-accent-contrast);
        background-color: var(--bf-accent);
        border: none;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.08);
        transition: filter 120ms ease, box-shadow 120ms ease;
    }

    :host button#bugflow-submit-feedback:hover {
        filter: brightness(0.94);
    }

    :host button#bugflow-submit-feedback:active {
        filter: brightness(0.88);
    }

    :host button#bugflow-submit-feedback:focus-visible {
        outline: none;
        box-shadow: 0 0 0 4px var(--bf-accent-ring);
    }

    :host div#bugflow-powered {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        margin-top: 14px;
    }

    :host div#bugflow-powered span {
        font-size: 11px;
        font-weight: 600;
        line-height: 1;
        color: var(--bf-text-tertiary);
    }

    :host div#bugflow-powered a {
        display: inline-flex;
        align-items: center;
        opacity: 0.85;
        transition: opacity 120ms ease;
    }

    /* Render the wordmark as a block so it doesn't sit on the text baseline
       (the inline descender gap was nudging "Powered by" out of alignment). */
    :host div#bugflow-powered a svg {
        display: block;
    }

    :host div#bugflow-powered a:hover {
        opacity: 1;
    }

    /* ===========================================================
       Preflight error state — centered, single focal point.
       =========================================================== */
    :host div#bugflow-modal-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 28px 24px 24px 24px;
    }

    :host div#bugflow-modal-error[hidden] {
        display: none;
    }

    :host div.bugflow-error-icon {
        width: 48px;
        height: 48px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--bf-error);
        background-color: var(--bf-error-halo);
        box-shadow: 0 0 0 8px var(--bf-error-halo-outer);
        margin-bottom: 24px;
    }

    :host h2.bugflow-error-title {
        margin: 0 0 8px 0;
        font-weight: 600;
        font-size: 18px;
        line-height: 26px;
        color: var(--bf-text);
    }

    :host p.bugflow-error-message {
        margin: 0 0 24px 0;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        color: var(--bf-text-secondary);
        max-width: 320px;
    }

    :host button.bugflow-error-dismiss {
        appearance: none;
        align-self: stretch;
        padding: 11px 16px;
        font-weight: 600;
        font-size: 15px;
        line-height: 22px;
        font-family: inherit;
        color: var(--bf-accent-contrast);
        background-color: var(--bf-accent);
        border: none;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 0px 1px 2px rgba(16, 24, 40, 0.08);
        transition: filter 120ms ease;
    }

    :host button.bugflow-error-dismiss:hover {
        filter: brightness(0.94);
    }

    :host button.bugflow-error-dismiss:focus-visible {
        outline: none;
        box-shadow: 0 0 0 4px var(--bf-accent-ring);
    }

    :host div.bugflow-error-attribution {
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-weight: 400;
        font-size: 12px;
        line-height: 16px;
        color: var(--bf-text-tertiary);
    }

    :host div.bugflow-error-attribution a {
        display: inline-flex;
        align-items: center;
        opacity: 0.85;
        transition: opacity 120ms ease;
    }

    :host div.bugflow-error-attribution a:hover {
        opacity: 1;
    }

    /* ===========================================================
       Entrance / exit motion. The scrim fades; the card lifts + scales
       in on a soft spring. The host is toggled display:none/flex by the
       controller; .bugflow-open is added a frame later so the transition
       actually plays, and removed ~200ms before close so it plays out.
       =========================================================== */
    :host div#bugflow-modal-background {
        opacity: 0;
        transition: opacity 200ms ease-out;
    }

    :host div#bugflow-modal-background.bugflow-open {
        opacity: 1;
    }

    :host div#bugflow-modal {
        opacity: 0;
        transform: translateY(8px) scale(0.97);
        transition: opacity 240ms ease-out, transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
        will-change: transform, opacity;
    }

    :host div#bugflow-modal-background.bugflow-open div#bugflow-modal {
        opacity: 1;
        transform: none;
    }

    :host ::selection {
        background: var(--bf-accent-ring);
    }

    @media (prefers-reduced-motion: reduce) {
        :host div#bugflow-modal-background,
        :host div#bugflow-modal {
            transition: none;
        }
        :host div#bugflow-modal {
            transform: none;
        }
    }

    /* ===========================================================
       Returning-visitor identity chip. When we recognise the reporter we
       collapse the Name + Email fields into one compact row — less to
       fill in, less height to fit (helps constrained app windows).
       =========================================================== */
    :host div#bugflow-identity {
        display: none;
        align-items: center;
        gap: 12px;
        margin-top: 18px;
        padding: 10px 12px;
        border: 1px solid var(--bf-border-subtle);
        border-radius: 12px;
        background-color: var(--bf-surface-sunken);
    }

    :host div#bugflow-identity-avatar {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.01em;
        color: var(--bf-accent-contrast);
        background-color: var(--bf-accent);
    }

    :host div#bugflow-identity-meta {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-width: 0;
    }

    :host span#bugflow-identity-name {
        font-size: 14px;
        font-weight: 600;
        line-height: 20px;
        color: var(--bf-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    :host span#bugflow-identity-email {
        font-size: 12px;
        line-height: 16px;
        color: var(--bf-text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    :host button#bugflow-identity-reset {
        flex-shrink: 0;
        padding: 0;
        font-size: 13px;
        font-weight: 500;
        font-family: inherit;
        color: var(--bf-link);
        background: transparent;
        border: none;
        cursor: pointer;
    }

    :host button#bugflow-identity-reset:hover {
        text-decoration: underline;
    }

    /* ===========================================================
       Submit spinner — inline ring while the report is sending.
       =========================================================== */
    :host button#bugflow-submit-feedback {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }

    :host span.bugflow-submit-spinner {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        border-radius: 9999px;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: currentColor;
        animation: bugflow-modal-spin 0.7s linear infinite;
    }

    @keyframes bugflow-modal-spin {
        to { transform: rotate(360deg); }
    }

    /* ===========================================================
       Screenshot lightbox — full-screen preview of what's being sent.
       Lives outside #bugflow-modal-background so its clicks don't trip
       the click-outside-to-close handler.
       =========================================================== */
    :host div#bugflow-lightbox {
        position: fixed;
        inset: 0;
        z-index: 1000000000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 32px;
        background: rgba(0, 0, 0, 0.8);
        cursor: zoom-out;
        opacity: 0;
        transition: opacity 160ms ease-out;
    }

    :host div#bugflow-lightbox.bugflow-open {
        opacity: 1;
    }

    :host div#bugflow-lightbox[hidden] {
        display: none;
    }

    :host img#bugflow-lightbox-image {
        max-width: 100%;
        max-height: 100%;
        border-radius: 12px;
        box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.6);
        object-fit: contain;
    }

    :host button#bugflow-lightbox-close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 40px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        border: none;
        cursor: pointer;
        color: #FFFFFF;
        background: rgba(255, 255, 255, 0.12);
        transition: background-color 120ms ease;
    }

    :host button#bugflow-lightbox-close:hover {
        background: rgba(255, 255, 255, 0.22);
    }

    @media (prefers-reduced-motion: reduce) {
        :host div#bugflow-lightbox {
            transition: none;
        }
    }

    /* ===========================================================
       Drag-and-drop overlay — an accent-tinted frosted sheet that covers the
       whole modal while a file is dragged over it. Theme-agnostic: the tint
       is the owner's accent at low alpha over a backdrop blur, so it reads on
       light and dark without a dedicated token. Drag listeners live on
       #bugflow-modal; this is positioned against it.
       =========================================================== */
    :host div#bugflow-drop-overlay {
        position: absolute;
        inset: 0;
        z-index: 20;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 14px;
        border-radius: 16px;
        background: var(--bf-accent-ring);
        -webkit-backdrop-filter: blur(12px);
        backdrop-filter: blur(12px);
        border: 2px dashed var(--bf-accent);
        opacity: 0;
        pointer-events: none;
        transition: opacity 160ms ease;
    }

    :host div#bugflow-drop-overlay.bugflow-open {
        opacity: 1;
    }

    :host div.bugflow-drop-icon {
        width: 52px;
        height: 52px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--bf-accent);
        background: var(--bf-accent-ring);
    }

    :host span.bugflow-drop-text {
        font-size: 15px;
        font-weight: 600;
        color: var(--bf-text);
    }

    @media (prefers-reduced-motion: reduce) {
        :host div#bugflow-drop-overlay {
            transition: none;
        }
        :host div.bugflow-attach-tile.bugflow-tile-pop {
            animation: none;
        }
        :host div.bugflow-attach-thumb {
            transition: none;
        }
    }
`;
