// Shadow-DOM-scoped CSS for the Notification Web Component.
// A premium Untitled UI pill that drops in from the top-right with an
// animated success/error icon, label, and (for success only) an auto-dismiss
// progress bar. Themed to follow the widget's appearance setting — the host
// carries data-theme (auto | light | dark); light is the base, dark overrides,
// and "auto" follows the visitor's OS. `all: initial` does not reset custom
// properties, so the --bf-n-* tokens below survive it.

export const notificationStyles = `
    :host {
        all: initial;
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 2147483647;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        font-size: 14px;
        line-height: 1.4;
        pointer-events: none;

        --bf-n-surface: #FFFFFF;
        --bf-n-border: #EAECF0;
        --bf-n-text: #101828;
        --bf-n-close: #98A2B3;
        --bf-n-close-hover: #475467;
        --bf-n-progress-track: #EAECF0;
        --bf-n-shadow: 0 12px 32px rgba(16, 24, 40, 0.16);
        --bf-n-success-bg: rgba(7, 148, 85, 0.12);
        --bf-n-success-fg: #067647;
        --bf-n-error-bg: rgba(217, 45, 32, 0.12);
        --bf-n-error-fg: #D92D20;
        --bf-n-progress-bar: rgba(6, 118, 71, 0.45);
    }

    :host([data-theme="dark"]) {
        --bf-n-surface: #161B26;
        --bf-n-border: #1F242F;
        --bf-n-text: #F5F5F6;
        --bf-n-close: #85888E;
        --bf-n-close-hover: #CECFD2;
        --bf-n-progress-track: #1F242F;
        --bf-n-shadow: 0 10px 30px rgba(0, 0, 0, 0.40);
        --bf-n-success-bg: rgba(7, 148, 85, 0.18);
        --bf-n-success-fg: #17B26A;
        --bf-n-error-bg: rgba(217, 45, 32, 0.18);
        --bf-n-error-fg: #F04438;
        --bf-n-progress-bar: rgba(23, 178, 106, 0.50);
    }

    @media (prefers-color-scheme: dark) {
        :host([data-theme="auto"]) {
            --bf-n-surface: #161B26;
            --bf-n-border: #1F242F;
            --bf-n-text: #F5F5F6;
            --bf-n-close: #85888E;
            --bf-n-close-hover: #CECFD2;
            --bf-n-progress-track: #1F242F;
            --bf-n-shadow: 0 10px 30px rgba(0, 0, 0, 0.40);
            --bf-n-success-bg: rgba(7, 148, 85, 0.18);
            --bf-n-success-fg: #17B26A;
            --bf-n-error-bg: rgba(217, 45, 32, 0.18);
            --bf-n-error-fg: #F04438;
            --bf-n-progress-bar: rgba(23, 178, 106, 0.50);
        }
    }

    .bugflow-notification {
        width: 360px;
        max-width: calc(100vw - 40px);
        overflow: hidden;
        border-radius: 12px;
        background: var(--bf-n-surface);
        border: 1px solid var(--bf-n-border);
        box-shadow: var(--bf-n-shadow);
        opacity: 0;
        transform: translateY(-6px);
        transition: opacity 200ms ease-out, transform 200ms ease-out;
        pointer-events: auto;
    }
    .bugflow-notification.bugflow-notification-entered {
        opacity: 1;
        transform: translateY(0);
    }
    .bugflow-notification.bugflow-notification-leaving {
        opacity: 0;
        transform: translateY(-6px);
        transition: opacity 150ms ease-in, transform 150ms ease-in;
    }

    .bugflow-notification-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
    }

    .bugflow-notification-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        border-radius: 9999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .bugflow-notification-icon-success {
        background: var(--bf-n-success-bg);
        color: var(--bf-n-success-fg);
    }
    .bugflow-notification-icon-error {
        background: var(--bf-n-error-bg);
        color: var(--bf-n-error-fg);
    }

    .bugflow-notification-label {
        flex: 1;
        min-width: 0;
        margin: 0;
        font-size: 14px;
        font-weight: 500;
        color: var(--bf-n-text);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .bugflow-notification-close {
        flex-shrink: 0;
        background: none;
        border: 0;
        padding: 2px;
        margin: 0;
        cursor: pointer;
        color: var(--bf-n-close);
        transition: color 150ms ease-out;
        outline: none;
    }
    .bugflow-notification-close:hover {
        color: var(--bf-n-close-hover);
    }
    .bugflow-notification-close:focus-visible {
        color: var(--bf-n-close-hover);
        outline: 2px solid #155EEF;
        outline-offset: 2px;
        border-radius: 4px;
    }

    /* Animated progress bar — counts down the 4s auto-dismiss window so the
       user can read the success state for as long as they need (hovering
       does not pause; this matches the extension exactly). */
    .bugflow-notification-progress {
        height: 2px;
        background: var(--bf-n-progress-track);
    }
    .bugflow-notification-progress-bar {
        height: 100%;
        width: 100%;
        background: var(--bf-n-progress-bar);
        transform-origin: left center;
        animation: bugflow-notification-progress 4s linear forwards;
    }

    @keyframes bugflow-notification-progress {
        from { transform: scaleX(1); }
        to   { transform: scaleX(0); }
    }
`;
