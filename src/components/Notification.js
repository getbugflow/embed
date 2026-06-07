import { notificationStyles } from '../styles/components/notification.js';
import { eventBus } from '../utils/events.js';
import { state } from '../state.js';

// Premium dark-pill notification, mirroring extension/Notification.vue:
//   - Success variant: small green check, "Report submitted", animated progress
//     bar, auto-dismiss after 4s.
//   - Error variant: small red dot, caller-provided message, manual dismiss
//     only (errors deserve the user's attention).
//
// Listens on `notify` events from utils/events.js. Payload shape:
//   eventBus.emit('notify');                      → success, default copy
//   eventBus.emit('notify', { type: 'success' }); → success, default copy
//   eventBus.emit('notify', { type: 'error', message: '…' }); → error variant
//
// The embed deliberately omits the extension's "View on Bugflow" deep link
// because the embed is on the customer's site for *their* end users — they
// won't have a Bugflow login and the link would be useless.

const successIcon = () => `
    <span class="bugflow-notification-icon bugflow-notification-icon-success">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M8.5 2.5 4 7.5 1.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </span>
`;

const errorIcon = () => `
    <span class="bugflow-notification-icon bugflow-notification-icon-error">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M5 3v2.5M5 7h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </span>
`;

const closeIcon = () => `
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M11 1L1 11M1 1l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
`;

const template = ({ type, message }) => {
    const isSuccess = type !== 'error';
    const label = isSuccess
        ? 'Report submitted'
        : (message || 'Error submitting report');
    return `
        <div class="bugflow-notification bugflow-notification-${isSuccess ? 'success' : 'error'}" data-state="visible" role="status" aria-live="polite">
            <div class="bugflow-notification-row">
                ${isSuccess ? successIcon() : errorIcon()}
                <p class="bugflow-notification-label">${label}</p>
                <button type="button" class="bugflow-notification-close" aria-label="Dismiss notification">
                    ${closeIcon()}
                </button>
            </div>
            ${isSuccess ? `<div class="bugflow-notification-progress"><div class="bugflow-notification-progress-bar"></div></div>` : ''}
        </div>
    `;
};

export class Notification extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._dismissTimer = null;
        this._unsubNotify = null;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `<style>${notificationStyles}</style><div id="bugflow-notification-root"></div>`;
        this._unsubNotify = eventBus.on('notify', (payload) => {
            this.show(payload || {});
        });
    }

    disconnectedCallback() {
        this._clearTimer();
        this._unsubNotify?.();
    }

    show({ type = 'success', message = '' } = {}) {
        this._clearTimer();
        // Follow the widget's appearance setting so a light-themed site
        // doesn't get a dark toast (and vice versa).
        this.setAttribute('data-theme', state.get('theme') || 'auto');
        const root = this.shadowRoot.getElementById('bugflow-notification-root');
        root.innerHTML = template({ type, message });
        const closeBtn = root.querySelector('.bugflow-notification-close');
        closeBtn?.addEventListener('click', () => this.dismiss());
        // Force layout so the enter transition replays even when the previous
        // notification is still mounted.
        const card = root.querySelector('.bugflow-notification');
        if (card) {
            // eslint-disable-next-line no-unused-expressions
            card.offsetHeight;
            card.classList.add('bugflow-notification-entered');
        }
        if (type !== 'error') {
            this._dismissTimer = setTimeout(() => this.dismiss(), 4000);
        }
    }

    dismiss() {
        this._clearTimer();
        const card = this.shadowRoot.querySelector('.bugflow-notification');
        if (!card) return;
        card.classList.remove('bugflow-notification-entered');
        card.classList.add('bugflow-notification-leaving');
        setTimeout(() => {
            const root = this.shadowRoot.getElementById('bugflow-notification-root');
            if (root) root.innerHTML = '';
        }, 200);
    }

    _clearTimer() {
        if (this._dismissTimer) {
            clearTimeout(this._dismissTimer);
            this._dismissTimer = null;
        }
    }
}
