import { state } from '../state.js';
import { reportingModalStyles } from '../styles/components/reportingModal.js';
import { eventBus } from '../utils/events.js';
import { bugData } from '../utils/bugData.js';
import { captureHostPage } from '../utils/capture.js';
import hotkeys from 'hotkeys-js';

// The "Powered by Bugflow" wordmark — defined once, reused in the footer
// and the preflight-error attribution. Stays mid-gray (#7E7E7F) so it reads
// on both light and dark surfaces without theming.
const bugflowWordmark = `
    <svg width="56" height="17" viewBox="0 0 56 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.7087 10.7892V4.10955H22.3901C23.0835 4.10955 23.6115 4.27177 23.9742 4.59621C24.3431 4.91428 24.5276 5.3246 24.5276 5.82717C24.5276 6.24703 24.4131 6.58419 24.1841 6.83866C23.9614 7.08676 23.6879 7.25534 23.3634 7.3444C23.7451 7.42074 24.06 7.61159 24.3081 7.91694C24.5562 8.21593 24.6803 8.56582 24.6803 8.9666C24.6803 9.49461 24.4894 9.93037 24.1077 10.2739C23.726 10.6174 23.1853 10.7892 22.4855 10.7892H19.7087ZM20.9301 6.91499H22.2088C22.5523 6.91499 22.8163 6.83548 23.0008 6.67644C23.1853 6.5174 23.2776 6.29156 23.2776 5.99893C23.2776 5.71902 23.1853 5.49955 23.0008 5.34051C22.8227 5.17511 22.5523 5.09241 22.1897 5.09241H20.9301V6.91499ZM20.9301 9.79678H22.2947C22.6573 9.79678 22.9372 9.71408 23.1344 9.54868C23.338 9.37692 23.4398 9.13836 23.4398 8.833C23.4398 8.52129 23.3348 8.27637 23.1249 8.09824C22.915 7.92012 22.6319 7.83106 22.2756 7.83106H20.9301V9.79678ZM27.4748 10.9037C26.8832 10.9037 26.4252 10.7192 26.1007 10.3502C25.7827 9.98127 25.6236 9.44053 25.6236 8.72804V6.05618H26.8355V8.61353C26.8355 9.02067 26.9182 9.33239 27.0836 9.54868C27.249 9.76497 27.5098 9.87312 27.8661 9.87312C28.2032 9.87312 28.48 9.75225 28.6963 9.51051C28.9189 9.26877 29.0302 8.93161 29.0302 8.49902V6.05618H30.2517V10.7892H29.1734L29.078 9.98763C28.9316 10.2675 28.7185 10.4902 28.4386 10.6556C28.1651 10.821 27.8438 10.9037 27.4748 10.9037ZM33.5094 9.37692C33.2804 9.37692 33.0673 9.35147 32.8701 9.30058L32.517 9.65365C32.6252 9.7109 32.7715 9.75861 32.956 9.79678C33.1404 9.83495 33.4394 9.87312 33.8529 9.91129C34.4827 9.96854 34.9408 10.118 35.227 10.3598C35.5133 10.6015 35.6564 10.9355 35.6564 11.3617C35.6564 11.6416 35.5801 11.9056 35.4274 12.1537C35.2747 12.4082 35.0394 12.6118 34.7213 12.7644C34.4032 12.9235 33.9961 13.003 33.4999 13.003C32.8255 13.003 32.2816 12.8758 31.8681 12.6213C31.4546 12.3732 31.2479 11.9979 31.2479 11.4953C31.2479 11.0691 31.4546 10.7001 31.8681 10.3884C31.7409 10.3312 31.6296 10.2707 31.5341 10.2071C31.4451 10.1435 31.3656 10.0767 31.2956 10.0067V9.78724L32.1258 8.90934C31.7568 8.5849 31.5723 8.16822 31.5723 7.6593C31.5723 7.34122 31.6487 7.05177 31.8013 6.79094C31.9604 6.53012 32.183 6.32337 32.4693 6.17069C32.7556 6.01801 33.1023 5.94168 33.5094 5.94168C33.7766 5.94168 34.0247 5.97985 34.2537 6.05618H36.0477V6.80049L35.2366 6.85774C35.3638 7.09948 35.4274 7.36667 35.4274 7.6593C35.4274 7.97738 35.3511 8.26683 35.1984 8.52765C35.0457 8.78847 34.8231 8.99522 34.5304 9.1479C34.2442 9.30058 33.9038 9.37692 33.5094 9.37692ZM33.5094 8.44177C33.7575 8.44177 33.9611 8.37497 34.1201 8.24138C34.2855 8.10779 34.3682 7.91694 34.3682 7.66884C34.3682 7.42074 34.2855 7.22989 34.1201 7.0963C33.9611 6.96271 33.7575 6.89591 33.5094 6.89591C33.2486 6.89591 33.0387 6.96271 32.8796 7.0963C32.7206 7.22989 32.6411 7.42074 32.6411 7.66884C32.6411 7.91694 32.7206 8.10779 32.8796 8.24138C33.0387 8.37497 33.2486 8.44177 33.5094 8.44177ZM32.3643 11.3713C32.3643 11.6066 32.4725 11.7816 32.6888 11.8961C32.9114 12.017 33.1818 12.0774 33.4999 12.0774C33.8052 12.0774 34.0533 12.0138 34.2442 11.8866C34.435 11.7657 34.5304 11.6003 34.5304 11.3904C34.5304 11.2186 34.4668 11.0755 34.3396 10.9609C34.2187 10.8464 33.9738 10.7765 33.6048 10.751C33.344 10.7319 33.1023 10.7033 32.8796 10.6651C32.6951 10.7669 32.5615 10.8782 32.4788 10.9991C32.4025 11.12 32.3643 11.244 32.3643 11.3713ZM37.1578 10.7892V7.07721H36.5089V6.05618H37.1578V5.50273C37.1578 4.93019 37.3009 4.52305 37.5872 4.28131C37.8798 4.03957 38.2742 3.9187 38.7704 3.9187H39.2953V4.95882H38.9613C38.7514 4.95882 38.6019 5.00017 38.5128 5.08287C38.4237 5.16557 38.3792 5.30552 38.3792 5.50273V6.05618H39.4002V7.07721H38.3792V10.7892H37.1578ZM40.364 10.7892V3.9187H41.5854V10.7892H40.364ZM45.1081 10.9037C44.6501 10.9037 44.2366 10.7987 43.8676 10.5888C43.505 10.3789 43.2156 10.0894 42.9993 9.72044C42.7893 9.34511 42.6844 8.91252 42.6844 8.42268C42.6844 7.93284 42.7925 7.50344 43.0088 7.13447C43.2251 6.75914 43.5145 6.4665 43.8772 6.25657C44.2461 6.04664 44.6596 5.94168 45.1177 5.94168C45.5693 5.94168 45.9765 6.04664 46.3391 6.25657C46.7081 6.4665 46.9975 6.75914 47.2074 7.13447C47.4237 7.50344 47.5319 7.93284 47.5319 8.42268C47.5319 8.91252 47.4237 9.34511 47.2074 9.72044C46.9975 10.0894 46.7081 10.3789 46.3391 10.5888C45.9701 10.7987 45.5598 10.9037 45.1081 10.9037ZM45.1081 9.84449C45.4262 9.84449 45.7029 9.7268 45.9383 9.49143C46.1737 9.24969 46.2914 8.89344 46.2914 8.42268C46.2914 7.95193 46.1737 7.59886 45.9383 7.36348C45.7029 7.12175 45.4294 7.00088 45.1177 7.00088C44.7932 7.00088 44.5133 7.12175 44.2779 7.36348C44.0489 7.59886 43.9344 7.95193 43.9344 8.42268C43.9344 8.89344 44.0489 9.24969 44.2779 9.49143C44.5133 9.7268 44.79 9.84449 45.1081 9.84449ZM49.3818 10.7892L47.9982 6.05618H49.2101L50.0307 9.4628L50.9849 6.05618H52.3399L53.2942 9.4628L54.1244 6.05618H55.3362L53.9431 10.7892H52.6739L51.6624 7.24898L50.651 10.7892H49.3818Z" fill="#7E7E7F"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.47382 16.0033C12.893 16.0033 16.4755 12.4208 16.4755 8.00165C16.4755 3.58246 12.893 0 8.47382 0C4.05463 0 0.472168 3.58246 0.472168 8.00165C0.472168 12.4208 4.05463 16.0033 8.47382 16.0033ZM9.44751 2.48542C9.32632 2.49078 9.20481 2.54636 9.11358 2.6661L4.7343 8.54149C4.51534 8.83344 4.7343 9.27137 5.09924 9.27137H7.25217C7.54412 9.27137 7.76316 9.54536 7.69017 9.83731L6.94212 12.8662C6.83263 13.3224 7.39808 13.6325 7.72652 13.2675L12.0876 8.37755C12.3431 8.0856 12.1423 7.62914 11.7409 7.62914H9.53304C9.24109 7.62914 9.04031 7.37368 9.09505 7.08173L9.91616 3.03104C9.97888 2.70488 9.71414 2.47361 9.44751 2.48542Z" fill="#7E7E7F"/>
    </svg>
`;

// Convert an owner-supplied hex accent (#RGB / #RRGGBB) to an rgba string for
// focus rings. Falls back to the brand ring if the value isn't a clean hex.
const hexToRgba = ( hex, alpha ) => {
    if( typeof hex !== 'string' ) {
        return `rgba(21, 94, 239, ${alpha})`;
    }

    let value = hex.trim().replace('#', '');
    if( value.length === 3 ) {
        value = value.split('').map( ( c ) => c + c ).join('');
    }

    if( !/^[0-9a-fA-F]{6}$/.test( value ) ) {
        return `rgba(21, 94, 239, ${alpha})`;
    }

    const r = parseInt( value.substring(0, 2), 16 );
    const g = parseInt( value.substring(2, 4), 16 );
    const b = parseInt( value.substring(4, 6), 16 );

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Pick a legible text color for a button painted in an arbitrary brand accent.
// Light accents (e.g. a yellow brand) get dark text; everything else gets white.
const pickContrast = ( hex ) => {
    if( typeof hex !== 'string' ) {
        return '#FFFFFF';
    }

    let value = hex.trim().replace('#', '');
    if( value.length === 3 ) {
        value = value.split('').map( ( c ) => c + c ).join('');
    }

    if( !/^[0-9a-fA-F]{6}$/.test( value ) ) {
        return '#FFFFFF';
    }

    const r = parseInt( value.substring(0, 2), 16 ) / 255;
    const g = parseInt( value.substring(2, 4), 16 ) / 255;
    const b = parseInt( value.substring(4, 6), 16 ) / 255;
    // Relative luminance (sRGB).
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    return luminance > 0.6 ? '#101828' : '#FFFFFF';
};

// Two-letter initials for the returning-visitor avatar.
const initialsFor = ( name ) => {
    const parts = ( name || '' ).trim().split(/\s+/).filter( Boolean );
    if( !parts.length ) {
        return '?';
    }
    if( parts.length === 1 ) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return ( parts[0][0] + parts[parts.length - 1][0] ).toUpperCase();
};

// Visitor-attached images. Kept in lockstep with StoreFeedbackRequest on the
// server (image-only, ≤10MB, ≤3 extras) — the client guard is UX; the server
// guard is the real boundary.
const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

const escapeHtml = ( value ) => String( value ).replace(/[&<>"']/g, ( c ) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

const expandIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const removeImageIcon = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5 3.5l-7 7M3.5 3.5l7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// Preflight error state — themed featured icon → title → subhead → primary
// CTA → quiet Bugflow attribution. One clear action; no orphaned X close.
const errorStateTemplate = () => `
    <div id="bugflow-modal-error" hidden>
        <div class="bugflow-error-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <h2 class="bugflow-error-title">Bug reporting is unavailable</h2>
        <p class="bugflow-error-message">Please contact this site's team directly.</p>
        <button class="bugflow-error-dismiss" type="button">Got it</button>
        <div class="bugflow-error-attribution">
            <span>Powered by</span>
            <a href="https://bugflow.io" target="_blank" rel="noopener noreferrer" aria-label="Bugflow">${bugflowWordmark}</a>
        </div>
    </div>
`;

const commentsTemplate = () => {
    if( ! state.get('show_additional_comments') ) {
        return '';
    }

    return `
        <button id="bugflow-add-additional-comments" type="button">Add additional comments</button>

        <div class="bugflow-input-container" id="bugflow-long-description-container">
            <textarea id="bugflow-description" placeholder="Add any extra detail that would help…"></textarea>
        </div>
    `;
};

const template = () => {
    return `
        <div id="bugflow-modal-background">
            <div id="bugflow-modal" role="dialog" aria-modal="true" aria-labelledby="bugflow-guest-reporting-modal-title">

                ${errorStateTemplate()}

                <div id="bugflow-modal-form">
                    <div class="bugflow-modal-header">
                        <div class="bugflow-brand-badge" aria-hidden="true">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 2 4.5 13.5H11L10 22 19.5 10.5H13L13 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>

                        <button id="bugflow-close-reporting-modal" type="button" aria-label="Close">
                            <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>

                    <div class="bugflow-modal-body">
                        <h2 id="bugflow-guest-reporting-modal-title">${state.get('modal_title')}</h2>
                        <h3 id="bugflow-guest-reporting-modal-secondary-text">${state.get('secondary_text')}</h3>

                        <div id="bugflow-identity">
                            <div id="bugflow-identity-avatar"></div>
                            <div id="bugflow-identity-meta">
                                <span id="bugflow-identity-name"></span>
                                <span id="bugflow-identity-email"></span>
                            </div>
                            <button id="bugflow-identity-reset" type="button">Not you?</button>
                        </div>

                        <div id="bugflow-identity-fields">
                            <div class="bugflow-input-container first-container">
                                <label for="bugflow-guest-name">Name</label>
                                <input type="text" placeholder="Your name" id="bugflow-guest-name"/>
                                <span id="bugflow-guest-name-validation" class="bugflow-validation">Please enter your name.</span>
                            </div>

                            <div class="bugflow-input-container">
                                <label for="bugflow-guest-email">Email</label>
                                <input type="email" placeholder="you@example.com" id="bugflow-guest-email"/>
                                <span id="bugflow-guest-email-validation" class="bugflow-validation">Please enter your email.</span>
                            </div>
                        </div>

                        <div class="bugflow-input-container relative">
                            <label for="bugflow-issue-title">${state.get('feedback_prompt')}</label>
                            <input type="text" placeholder="ex. This text is hard to read" id="bugflow-issue-title" class="bugflow-form-field"/>
                            <span id="bugflow-issue-title-length">0/200</span>
                            <span id="bugflow-issue-title-validation" class="bugflow-validation">Please enter your feedback</span>
                            ${commentsTemplate()}
                        </div>

                        <div class="bugflow-input-container" id="bugflow-attachments-container">
                            <label>Screenshots &amp; images</label>
                            <div id="bugflow-attachments-grid"></div>
                            <span class="bugflow-attach-hint">
                                <span class="bugflow-attach-hint-pointer">Drag &amp; drop, paste, or click + to add an image</span>
                                <span class="bugflow-attach-hint-touch">Tap + to add an image</span>
                            </span>
                            <input type="file" id="bugflow-image-input" accept="image/png,image/jpeg,image/gif,image/webp" multiple hidden/>
                            <span id="bugflow-images-error" class="bugflow-validation"></span>
                        </div>
                    </div>

                    <div class="bugflow-modal-footer">
                        <button id="bugflow-submit-feedback" class="bugflow-form-field">Submit Feedback</button>

                        <div id="bugflow-powered">
                            <span>Powered by</span>
                            <a href="https://bugflow.io" target="_blank" rel="noopener noreferrer" aria-label="Bugflow">${bugflowWordmark}</a>
                        </div>
                    </div>
                </div>

                <div id="bugflow-drop-overlay" aria-hidden="true">
                    <div class="bugflow-drop-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5-5 5 5M12 5v12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <span class="bugflow-drop-text">Drop images to attach</span>
                </div>
            </div>
        </div>

        <div id="bugflow-lightbox" hidden>
            <button id="bugflow-lightbox-close" type="button" aria-label="Close preview">
                <svg width="18" height="18" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <img id="bugflow-lightbox-image" alt="Screenshot preview"/>
        </div>
    `;
}

export class ReportingModal extends HTMLElement {
    submittingFeedback = false;
    validForm = true;
    lightboxOpen = false;
    scrollLocked = false;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.subscribeToState();
        this.subscribeToEvents();
        this.attachEventListeners();

        // Paste-to-attach (⌘V / Ctrl+V). One document-level listener, guarded
        // to only act while the form is open so the host page's own paste
        // behaviour is untouched the rest of the time.
        document.addEventListener('paste', (event) => this.handlePaste(event));
    }

    disconnectedCallback() {

    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        // The theme attribute drives the token blocks in the stylesheet
        // (auto follows the visitor's OS). The owner accent is injected
        // inline so the Submit button + focus rings paint in their brand
        // color regardless of theme.
        this.setAttribute('data-theme', state.get('theme') || 'auto');

        const accent = state.get('button_color') || '#155EEF';
        this.style.setProperty('--bf-accent', accent);
        this.style.setProperty('--bf-accent-ring', hexToRgba(accent, 0.20));
        this.style.setProperty('--bf-accent-contrast', pickContrast(accent));

        this.shadowRoot.innerHTML = `
            <style>${reportingModalStyles}</style>
            ${template()}
        `;
    }

    subscribeToState() {
        state.subscribe((key, value) => {
            // Owner-controlled appearance can change at runtime (SPA calling
            // setTheme / setShowAdditionalComments, or the settings preview).
            // Re-render + re-bind so the closed modal reflects the latest
            // configuration the next time it opens.
            if (['theme', 'button_color', 'show_additional_comments'].includes(key)) {
                this.render();
                this.attachEventListeners();
            }
        });
    }

    subscribeToEvents() {
        eventBus.on('reporting-modal-shown', (data) => {
            // Stop the host page from scrolling behind the modal.
            this.lockScroll();

            // Preflight runs upstream in designBug() now — by the time we
            // get here, the caller already knows whether reporting is
            // available. If they passed a preflightError, render the error
            // state; otherwise wire up the form as before.
            if (data && data.preflightError) {
                this.showErrorState(data.preflightError);
                this.bindKeyPress();
                this.animateIn();
                state.set('reporting_state', 'reporting-modal');
                return;
            }

            this.showFormState();
            this.captureScreenshot( data );
            this.applyIdentityState();
            this.bindKeyPress();
            this.animateIn();
            state.set('reporting_state', 'reporting-modal');
        });
    }

    // Freeze the host page behind the modal. Runs on arbitrary customer sites,
    // so we save + restore their existing inline styles rather than assume any,
    // and pad for the scrollbar's width so the page doesn't shift when the
    // scrollbar is removed (a no-op on macOS-style overlay scrollbars).
    lockScroll() {
        if (this.scrollLocked || typeof document === 'undefined') {
            return;
        }
        this.scrollLocked = true;

        const docEl = document.documentElement;
        const body = document.body;

        this.previousScrollStyles = {
            htmlOverflow: docEl.style.overflow,
            bodyOverflow: body.style.overflow,
            bodyPaddingRight: body.style.paddingRight,
        };

        const scrollbarWidth = window.innerWidth - docEl.clientWidth;
        if (scrollbarWidth > 0) {
            const currentPadding = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
            body.style.paddingRight = (currentPadding + scrollbarWidth) + 'px';
        }

        docEl.style.overflow = 'hidden';
        body.style.overflow = 'hidden';
    }

    unlockScroll() {
        if (! this.scrollLocked || typeof document === 'undefined') {
            return;
        }
        this.scrollLocked = false;

        const styles = this.previousScrollStyles || {};
        document.documentElement.style.overflow = styles.htmlOverflow || '';
        document.body.style.overflow = styles.bodyOverflow || '';
        document.body.style.paddingRight = styles.bodyPaddingRight || '';
    }

    // Add the open class a frame after the host is displayed so the entrance
    // transition actually plays (you can't transition from display:none).
    animateIn() {
        const bg = this.shadowRoot.querySelector('#bugflow-modal-background');
        if (!bg) {
            return;
        }
        requestAnimationFrame(() => requestAnimationFrame(() => bg.classList.add('bugflow-open')));
    }

    showErrorState(code) {
        const errorPane = this.shadowRoot.querySelector('#bugflow-modal-error');
        const formPane = this.shadowRoot.querySelector('#bugflow-modal-form');
        if (! errorPane || ! formPane) {
            return;
        }

        // Surface-appropriate copy — never names the customer, never
        // says "billing" or "subscription" to anonymous visitors. The
        // visitor can't fix any of these; we just tell them where it
        // stops being their problem.
        const copyByCode = {
            project_not_found: "This bug reporter isn't connected anymore. Please contact this site's team directly.",
            project_key_missing: "This bug reporter isn't connected anymore. Please contact this site's team directly.",
            widget_not_enabled: "Bug reporting isn't enabled on this site right now.",
            billing_inactive: "Bug reporting is temporarily unavailable. Please contact this site's team directly.",
        };

        const message = copyByCode[code] || "Bug reporting isn't available right now. Please try again later.";

        this.shadowRoot.querySelector('.bugflow-error-message').textContent = message;
        formPane.setAttribute('hidden', '');
        errorPane.removeAttribute('hidden');
    }

    showFormState() {
        const errorPane = this.shadowRoot.querySelector('#bugflow-modal-error');
        const formPane = this.shadowRoot.querySelector('#bugflow-modal-form');
        if (! errorPane || ! formPane) {
            return;
        }

        errorPane.setAttribute('hidden', '');
        formPane.removeAttribute('hidden');
    }

    attachEventListeners() {
        this.shadowRoot.querySelector('#bugflow-submit-feedback')
            .addEventListener('click', (event) => {
                this.submitFeedback(event);
            });

        this.shadowRoot.querySelector('#bugflow-modal-background')
            .addEventListener('click', (event) => {
                this.handleModalBackgroundClick(event);
            });

        this.shadowRoot.querySelector('#bugflow-issue-title')
            .addEventListener('keyup', (event) => {
                this.listenIssueTitleChange(event);
            });

        this.shadowRoot.querySelector('#bugflow-close-reporting-modal')
            .addEventListener('click', (event) => {
                this.handleCloseReportingModal(event);
            });

        this.shadowRoot.querySelector('#bugflow-lightbox')
            .addEventListener('click', () => {
                this.closeLightbox();
            });

        this.shadowRoot.querySelector('#bugflow-lightbox-close')
            .addEventListener('click', (event) => {
                event.stopPropagation();
                this.closeLightbox();
            });

        // Attachments: one hidden file input shared by the grid's "+" tile
        // (wired in renderAttachments), drag-drop, and paste.
        this.shadowRoot.querySelector('#bugflow-image-input')
            .addEventListener('change', (event) => {
                this.handleImageSelect(event);
            });

        // Drag a file anywhere over the modal → frosted drop overlay.
        this.bindDragAndDrop();

        // "Not you?" forgets the remembered identity and re-shows the fields.
        this.shadowRoot.querySelector('#bugflow-identity-reset')
            .addEventListener('click', () => {
                this.forgetIdentity();
            });

        // The "Add additional comments" affordance only exists when the
        // owner has enabled it — guard before binding.
        const addComments = this.shadowRoot.querySelector('#bugflow-add-additional-comments');
        if (addComments) {
            addComments.addEventListener('click', (event) => {
                this.addAdditionalComments(event);
            });
        }

        const errorDismiss = this.shadowRoot.querySelector('.bugflow-error-dismiss');
        if (errorDismiss) {
            errorDismiss.addEventListener('click', () => {
                this.closeReportingModal();
            });
        }
    }

    submitFeedback() {
        if( !state.get('capturing_screenshot') ) {
            this.submit();
        }else{
            console.log('Still capturing screenshot');
        }
    }

    handleModalBackgroundClick( event ) {
        if (event.target.closest('#bugflow-modal')) {
            return;
        }

        bugData.resetBugData();
        this.resetForm();
        this.removeActiveBugMarker();
        this.removeTextBoxes();
        this.closeReportingModal();
    }

    listenIssueTitleChange( e ){
        let value = e.target.value;

        this.shadowRoot.querySelector('#bugflow-issue-title-length').innerText = value.length +'/200';

        if( value.length >= 200 ){
            this.shadowRoot.querySelector('#bugflow-issue-title-length').classList.add('over-limit');
        }else{
            this.shadowRoot.querySelector('#bugflow-issue-title-length').classList.remove('over-limit');
        }

        if( value.length >= 160 ){
            this.shadowRoot.querySelector('#bugflow-issue-title').classList.add('no-input-icon');
            this.shadowRoot.querySelector('#bugflow-issue-title-length').style.display = 'inline-block';
            this.shadowRoot.getElementById('bugflow-issue-title').style.paddingRight = '80px';
        }

        if( value.length < 160 ){
            this.shadowRoot.querySelector('#bugflow-issue-title').classList.remove('no-input-icon');
            this.shadowRoot.querySelector('#bugflow-issue-title-length').style.display = 'none';
            this.shadowRoot.querySelector('#bugflow-issue-title').style.paddingRight = '14px';
        }
    }

    handleCloseReportingModal( event ) {
        bugData.resetBugData();
        this.resetForm();
        this.clearValidations();
        this.removeActiveBugMarker();
        this.removeTextBoxes();
        this.closeReportingModal();
    }

    addAdditionalComments( event ) {
        const link = this.shadowRoot.querySelector('#bugflow-add-additional-comments');
        const container = this.shadowRoot.querySelector('#bugflow-long-description-container');
        if (link) { link.style.display = 'none'; }
        if (container) { container.style.display = 'flex'; }
    }

    // Decide between the remembered-identity chip and the Name/Email fields.
    applyIdentityState() {
        const identity = this.shadowRoot.querySelector('#bugflow-identity');
        const fields = this.shadowRoot.querySelector('#bugflow-identity-fields');
        const previous = this.loadPreviousSelections();

        if (previous && previous.name) {
            // Keep the hidden inputs populated so submit/validation still read
            // from them — the chip is just a friendlier display layer.
            this.restoreName(previous.name);
            this.restoreEmail(previous.email || '');

            this.shadowRoot.querySelector('#bugflow-identity-avatar').textContent = initialsFor(previous.name);
            this.shadowRoot.querySelector('#bugflow-identity-name').textContent = previous.name;
            this.shadowRoot.querySelector('#bugflow-identity-email').textContent = previous.email || '';

            identity.style.display = 'flex';
            fields.style.display = 'none';

            setTimeout(() => this.shadowRoot.querySelector('#bugflow-issue-title').focus(), 100);
            return;
        }

        identity.style.display = 'none';
        fields.style.display = 'block';
        this.shadowRoot.querySelector('#bugflow-guest-name').focus();
    }

    forgetIdentity() {
        localStorage.removeItem('bugflow-previous-selections');
        bugData.setName('');
        bugData.setEmail('');

        this.shadowRoot.querySelector('#bugflow-guest-name').value = '';
        this.shadowRoot.querySelector('#bugflow-guest-email').value = '';
        this.shadowRoot.querySelector('#bugflow-identity').style.display = 'none';
        this.shadowRoot.querySelector('#bugflow-identity-fields').style.display = 'block';
        this.shadowRoot.querySelector('#bugflow-guest-name').focus();
    }

    openLightbox( url ) {
        const src = url || bugData.getScreenshot();
        if (!src) {
            return;
        }

        const box = this.shadowRoot.querySelector('#bugflow-lightbox');
        this.shadowRoot.querySelector('#bugflow-lightbox-image').src = src;
        box.removeAttribute('hidden');
        requestAnimationFrame(() => box.classList.add('bugflow-open'));
        this.lightboxOpen = true;
    }

    handleImageSelect( event ) {
        const input = event.target;
        const files = Array.from(input.files || []);
        // Reset so re-selecting the same file still fires a change event.
        input.value = '';
        this.addImages(files);
    }

    // Shared by the "+" tile, drag-drop, and paste. Validates client-side
    // (the server re-validates in StoreFeedbackRequest) and re-renders.
    addImages( files ) {
        let error = '';

        for (const file of Array.from(files)) {
            if (bugData.getImages().length >= MAX_IMAGES) {
                error = 'You can add up to ' + MAX_IMAGES + ' images.';
                break;
            }
            if (! ALLOWED_IMAGE_TYPES.includes(file.type)) {
                error = 'Only PNG, JPG, GIF, or WebP images are supported.';
                continue;
            }
            if (file.size > MAX_IMAGE_BYTES) {
                error = 'Each image must be under 10MB.';
                continue;
            }
            bugData.addImage(file);
            // Mark the newest tile so only it springs in on the next render.
            this.justAddedKey = 'image-' + (bugData.getImages().length - 1);
        }

        this.renderAttachments();
        this.showImagesError(error);
    }

    // Rebuild the attachment grid: screenshot (or a preparing shimmer) first,
    // then each image, then the dashed "+" tile until the cap is reached.
    renderAttachments() {
        const grid = this.shadowRoot.querySelector('#bugflow-attachments-grid');
        if (!grid) {
            return;
        }

        const screenshot = bugData.getScreenshot();
        const images = bugData.getImages();
        const tiles = [];

        if (state.get('capturing_screenshot')) {
            tiles.push('<div class="bugflow-attach-tile bugflow-attach-preparing"><span class="bugflow-prepare-thumb"></span></div>');
        } else if (screenshot) {
            tiles.push(this.tileHtml('screenshot', screenshot, 'Screenshot', ''));
        }

        images.forEach((image, i) => {
            tiles.push(this.tileHtml('image-' + i, image.previewUrl, image.file.name || 'Image', i));
        });

        if (images.length < MAX_IMAGES) {
            tiles.push(`
                <button type="button" id="bugflow-add-image" class="bugflow-attach-tile bugflow-attach-add" aria-label="Add image">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            `);
        }

        grid.innerHTML = tiles.join('');
        this.justAddedKey = null;

        // The hint references the "+" tile, so drop it once the cap is hit.
        const hint = this.shadowRoot.querySelector('.bugflow-attach-hint');
        if (hint) {
            hint.style.display = images.length >= MAX_IMAGES ? 'none' : 'block';
        }

        const addBtn = grid.querySelector('#bugflow-add-image');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.shadowRoot.querySelector('#bugflow-image-input').click();
            });
        }

        grid.querySelectorAll('.bugflow-attach-thumb').forEach((tile) => {
            const key = tile.dataset.key;
            const index = tile.dataset.imageIndex;

            tile.querySelector('.bugflow-attach-expand').addEventListener('click', (event) => {
                event.stopPropagation();
                const url = key === 'screenshot'
                    ? bugData.getScreenshot()
                    : (bugData.getImages()[Number(index)] || {}).previewUrl;
                this.openLightbox(url);
            });

            tile.querySelector('.bugflow-attach-remove').addEventListener('click', (event) => {
                event.stopPropagation();
                if (key === 'screenshot') {
                    bugData.setScreenshot('');
                } else {
                    bugData.removeImage(Number(index));
                }
                this.showImagesError('');
                this.renderAttachments();
            });
        });
    }

    tileHtml( key, url, label, index ) {
        const pop = key === this.justAddedKey ? ' bugflow-tile-pop' : '';
        return `
            <div class="bugflow-attach-tile bugflow-attach-thumb${pop}" data-key="${key}" data-image-index="${index}" style="background-image: url('${url}')">
                <button type="button" class="bugflow-attach-expand" aria-label="Preview ${escapeHtml(label)}">${expandIcon}</button>
                <button type="button" class="bugflow-attach-remove" aria-label="Remove ${escapeHtml(label)}">${removeImageIcon}</button>
            </div>
        `;
    }

    bindDragAndDrop() {
        // Bind to the full-viewport scrim, not just the card: while the modal
        // is open the whole screen becomes the drop zone, so a stray drop on
        // the backdrop can't fall through to the host page and navigate it
        // away. preventDefault on dragover/drop is what suppresses that.
        const target = this.shadowRoot.querySelector('#bugflow-modal-background');
        if (!target) {
            return;
        }
        this.dragDepth = 0;

        target.addEventListener('dragenter', (event) => {
            if (! this.dragHasFiles(event)) { return; }
            event.preventDefault();
            this.dragDepth++;
            this.showDropOverlay(true);
        });

        target.addEventListener('dragover', (event) => {
            if (! this.dragHasFiles(event)) { return; }
            event.preventDefault();
        });

        target.addEventListener('dragleave', (event) => {
            if (! this.dragHasFiles(event)) { return; }
            this.dragDepth--;
            if (this.dragDepth <= 0) {
                this.dragDepth = 0;
                this.showDropOverlay(false);
            }
        });

        target.addEventListener('drop', (event) => {
            event.preventDefault();
            this.dragDepth = 0;
            this.showDropOverlay(false);
            if (event.dataTransfer) {
                this.addImages(event.dataTransfer.files);
            }
        });
    }

    dragHasFiles( event ) {
        const types = event.dataTransfer ? Array.from(event.dataTransfer.types || []) : [];
        return types.includes('Files');
    }

    showDropOverlay( show ) {
        const overlay = this.shadowRoot.querySelector('#bugflow-drop-overlay');
        if (!overlay) {
            return;
        }
        // Never paint the overlay over the preflight-error state.
        const formPane = this.shadowRoot.querySelector('#bugflow-modal-form');
        if (show && (!formPane || formPane.hasAttribute('hidden'))) {
            return;
        }
        overlay.classList.toggle('bugflow-open', show);
    }

    resetDragState() {
        this.dragDepth = 0;
        this.showDropOverlay(false);
    }

    handlePaste( event ) {
        if (state.get('reporting_state') !== 'reporting-modal') {
            return;
        }
        const formPane = this.shadowRoot.querySelector('#bugflow-modal-form');
        if (!formPane || formPane.hasAttribute('hidden')) {
            return;
        }

        const items = (event.clipboardData && event.clipboardData.items) || [];
        const files = [];
        for (const item of items) {
            if (item.kind === 'file' && item.type.indexOf('image/') === 0) {
                const file = item.getAsFile();
                if (file) {
                    files.push(file);
                }
            }
        }

        if (files.length) {
            event.preventDefault();
            this.addImages(files);
        }
    }

    showImagesError( message ) {
        const el = this.shadowRoot.querySelector('#bugflow-images-error');
        if (message) {
            el.textContent = message;
            el.style.display = 'block';
        } else {
            el.textContent = '';
            el.style.display = 'none';
        }
    }

    closeLightbox() {
        const box = this.shadowRoot.querySelector('#bugflow-lightbox');
        box.classList.remove('bugflow-open');
        this.lightboxOpen = false;
        setTimeout(() => {
            box.setAttribute('hidden', '');
            this.shadowRoot.querySelector('#bugflow-lightbox-image').src = '';
        }, 160);
    }

    resetForm() {
        this.shadowRoot.querySelector('#bugflow-guest-name').value = '';
        this.shadowRoot.querySelector('#bugflow-guest-email').value = '';
        this.shadowRoot.querySelector('#bugflow-issue-title').value = '';
        this.shadowRoot.querySelector('#bugflow-issue-title-length').innerText = '0/200';
        this.shadowRoot.querySelector('#bugflow-issue-title').classList.remove('no-input-icon');

        // Identity back to the first-time baseline; applyIdentityState() picks
        // the chip again on the next open if we still remember the visitor.
        this.shadowRoot.querySelector('#bugflow-identity').style.display = 'none';
        this.shadowRoot.querySelector('#bugflow-identity-fields').style.display = 'block';

        // The comments affordance only exists when enabled by the owner.
        const description = this.shadowRoot.querySelector('#bugflow-description');
        const addComments = this.shadowRoot.querySelector('#bugflow-add-additional-comments');
        const longContainer = this.shadowRoot.querySelector('#bugflow-long-description-container');
        if (description) { description.value = ''; }
        if (addComments) { addComments.style.display = 'flex'; }
        if (longContainer) { longContainer.style.display = 'none'; }

        // Attachments — bugData (screenshot + images) is cleared by
        // resetBugData(); re-render the (now empty) grid + clear error/drag state.
        this.renderAttachments();
        this.showImagesError('');
        this.resetDragState();
    }

    removeActiveBugMarker() {
        let activeBug = document.querySelectorAll('.active-bugflow-bug-location');

        if( activeBug.length > 0 ) {
            for( let i = 0; i < activeBug.length; i++ ) {
                activeBug[i].remove();
            }
        }
    }

    removeTextBoxes() {
        let textBoxes = document.querySelectorAll('.bugflow-text-input');

        if( textBoxes.length > 0 ) {
            for( let i = 0; i < textBoxes.length; i++ ) {
                textBoxes[i].remove();
            }
        }
    }

    bindKeyPress() {
        // hotkeys-js ignores INPUT/TEXTAREA/SELECT by default, but the whole
        // point of ⌘/Ctrl+Enter is to fire while the visitor is typing in a
        // field — so opt every field in. The bundled hotkeys instance is
        // scoped to this embed, so this never touches the host page.
        hotkeys.filter = () => true;

        // command+enter is macOS ⌘; ctrl+enter is Windows/Linux.
        hotkeys('ctrl+enter,command+enter', (event) => {
            event.preventDefault();
            this.submitFeedback(event);
        });
        hotkeys('escape', (event) => {
            // Escape closes the lightbox first if it's open, otherwise the modal.
            if (this.lightboxOpen) {
                this.closeLightbox();
                return;
            }
            bugData.resetBugData();
            this.resetForm();
            this.clearValidations();
            this.removeActiveBugMarker();
            this.removeTextBoxes();
            this.closeReportingModal();
        });
    }

    unbindKeyPress() {
        hotkeys.unbind('ctrl+enter,command+enter');
        hotkeys.unbind('escape');
    }

    captureScreenshot( data ) {
        const submit = this.shadowRoot.querySelector('#bugflow-submit-feedback');

        // New flow: by the time the modal opens, an annotated screenshot is
        // already in bugData (the Designer captured + annotated + handed it
        // off via the designer:done event). Just render it as the first tile.
        const existing = bugData.getScreenshot();
        if (data?.hasAnnotatedScreenshot || existing) {
            state.set('capturing_screenshot', false);
            submit.style.opacity = '1.0';
            this.renderAttachments();
            this.removeTextBoxes();
            return;
        }

        // Fallback: opened without an annotated screenshot — capture one so the
        // user still gets a screenshot attached. The grid shows a shimmer tile
        // until it lands.
        state.set('capturing_screenshot', true);
        submit.style.opacity = '0.5';
        this.renderAttachments();

        captureHostPage()
            .then((dataUrl) => {
                bugData.setScreenshot(dataUrl);
                submit.style.opacity = '1.0';
                this.removeTextBoxes();
            })
            .catch((err) => console.error('[bugflow] screenshot capture failed', err))
            .finally(() => {
                state.set('capturing_screenshot', false);
                this.renderAttachments();
            });
    }

    restoreName( name ) {
        bugData.setName( name );
        this.shadowRoot.querySelector('#bugflow-guest-name').value = name;
    }

    restoreEmail( email ) {
        bugData.setEmail( email );
        this.shadowRoot.querySelector('#bugflow-guest-email').value = email;
    }

    loadPreviousSelections() {
        let previousSelections = localStorage.getItem('bugflow-previous-selections');

        if( !previousSelections ){
            return null;
        }

       previousSelections = JSON.parse(previousSelections);
       let currentTime = new Date();

       if( currentTime.getTime() > previousSelections.expires_at ){
            localStorage.removeItem('bugflow-previous-selections');
            return null;
       }

       return previousSelections.value;
    }

    setSubmitting( isSubmitting ) {
        const submit = this.shadowRoot.querySelector('#bugflow-submit-feedback');
        if( isSubmitting ){
            submit.innerHTML = '<span class="bugflow-submit-spinner"></span>Submitting…';
            submit.style.opacity = '0.85';
            submit.style.pointerEvents = 'none';
        }else{
            submit.textContent = 'Submit Feedback';
            submit.style.opacity = '1';
            submit.style.pointerEvents = '';
        }
    }

    async submit(){
        this.setBugData();

        if( this.validate()
            && !this.submittingFeedback ){
                this.submittingFeedback = true;
                this.setSubmitting(true);

                let formData = await bugData.convertToFormData();

                let endpoint = state.get('endpoint');

                fetch( endpoint+'/feedback', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                } ).then( async response => {
                    this.submittingFeedback = false;
                    this.setSubmitting(false);

                    if( response.ok ){
                        this.saveSelections();
                        bugData.resetBugData();
                        this.resetForm();
                        this.removeActiveBugMarker();
                        this.removeTextBoxes();
                        this.closeReportingModal();

                        eventBus.emit('notify', { type: 'success' });
                        return;
                    }

                    // Server refused. Surface a respectful message — and
                    // for any of the known codes, NEVER name the customer
                    // or expose owner contact info. This widget runs on
                    // the customer's public page, so anything we show is
                    // visible to anonymous visitors.
                    let message = "We couldn't submit your feedback. Please try again.";
                    try{
                        const contentType = response.headers.get( 'content-type' ) || '';
                        if( contentType.includes( 'application/json' ) ){
                            const body = await response.json();
                            if( body && body.code === 'billing_inactive' ){
                                message = "Bug reporting is temporarily unavailable. Please contact this site's team directly.";
                            }else if( body && (body.code === 'project_not_found' || body.code === 'project_key_missing') ){
                                // A snippet pointing at a project that no
                                // longer exists (or one missing the project
                                // key entirely). Most often happens when a
                                // team is deleted but the snippet is left
                                // on the page. Visitor can't fix this; we
                                // tell them where it stops being their
                                // problem.
                                message = "This bug reporter isn't connected anymore. Please contact this site's team directly.";
                            }else if( body && body.code === 'widget_not_enabled' ){
                                message = "Bug reporting isn't enabled on this site right now.";
                            }
                        }
                    }catch{
                        // Stay on the generic fallback. The visitor doesn't
                        // need to see parse / network plumbing.
                    }

                    eventBus.emit('notify', { type: 'error', message });

                } ).catch( () => {
                    this.submittingFeedback = false;
                    this.setSubmitting(false);
                    eventBus.emit('notify', { type: 'error', message: "We couldn't submit your feedback. Please try again." });
                } );
        }
    }

    validate() {
        this.validForm = true;

        this.checkTitle();
        this.checkName();
        this.checkEmail();

        return this.validForm;
    }

    checkTitle(){
        let title = this.shadowRoot.querySelector('#bugflow-issue-title').value;

        if( title == '' ){
            this.validForm = false;
            this.shadowRoot.querySelector('#bugflow-issue-title-validation').style.display = 'block';
            this.shadowRoot.querySelector('#bugflow-issue-title').classList.add('invalid');
        }else if( title.length > 200 ){
            this.validForm = false;
            this.shadowRoot.querySelector('#bugflow-issue-title-validation').style.display = 'block';
            this.shadowRoot.querySelector('#bugflow-issue-title').classList.add('invalid');
        }else{
            this.shadowRoot.querySelector('#bugflow-issue-title-validation').style.display = 'none';
            this.shadowRoot.querySelector('#bugflow-issue-title').classList.remove('invalid');
        }
    }

    checkName(){
        // When the identity chip is showing, Name lives in a hidden but
        // populated input — validation still reads from it correctly.
        let name = this.shadowRoot.querySelector('#bugflow-guest-name').value;

        if( name == '' ){
            this.validForm = false;
            this.shadowRoot.querySelector('#bugflow-guest-name-validation').style.display = 'block';
            this.shadowRoot.querySelector('#bugflow-guest-name').classList.add('invalid');
        }else{
            this.shadowRoot.querySelector('#bugflow-guest-name-validation').style.display = 'none';
            this.shadowRoot.querySelector('#bugflow-guest-name').classList.remove('invalid');
        }
    }

    checkEmail(){
        let email = this.shadowRoot.querySelector('#bugflow-guest-email').value;

        if( email == '' ){
            this.validForm = false;
            this.shadowRoot.querySelector('#bugflow-guest-email-validation').style.display = 'block';
            this.shadowRoot.querySelector('#bugflow-guest-email').classList.add('invalid');
        }else if( !email.match(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) ){
            this.validForm = false;
            this.shadowRoot.querySelector('#bugflow-guest-email-validation').style.display = 'block';
            this.shadowRoot.querySelector('#bugflow-guest-email').classList.add('invalid');
        }else{
            this.shadowRoot.querySelector('#bugflow-guest-email-validation').style.display = 'none';
            this.shadowRoot.querySelector('#bugflow-guest-email').classList.remove('invalid');
        }
    }

    clearValidations(){
        this.shadowRoot.querySelector('#bugflow-issue-title-validation').style.display = 'none';
        this.shadowRoot.querySelector('#bugflow-issue-title').classList.remove('invalid');
        this.shadowRoot.querySelector('#bugflow-guest-name-validation').style.display = 'none';
        this.shadowRoot.querySelector('#bugflow-guest-name').classList.remove('invalid');
        this.shadowRoot.querySelector('#bugflow-guest-email-validation').style.display = 'none';
        this.shadowRoot.querySelector('#bugflow-guest-email').classList.remove('invalid');
    }

    setBugData(){
        const description = this.shadowRoot.querySelector('#bugflow-description');

        bugData.setName( this.shadowRoot.querySelector('#bugflow-guest-name').value );
        bugData.setEmail( this.shadowRoot.querySelector('#bugflow-guest-email').value );
        bugData.setTitle( this.shadowRoot.querySelector('#bugflow-issue-title').value );
        bugData.setDescription( description ? description.value : '' );
        bugData.setUrl( window.location.href );
        bugData.setBrowserInfo();
        // Merge after setBrowserInfo() — it rebuilds this.meta from scratch,
        // so custom metadata must be applied last to survive the rebuild.
        bugData.setCustomMetadata( state.get('metadata') );
        bugData.setKey( state.get('key') );
    }

    saveSelections(){
        let currentTime = new Date();

        let selections = {
            value: {
                name: bugData.getName(),
                email: bugData.getEmail(),
            },
            expires_at: currentTime.getTime() + ( 3600 * 1000 )
        }

        localStorage.setItem('bugflow-previous-selections', JSON.stringify( selections ));
    }

    closeReportingModal(){
        if (this.lightboxOpen) {
            this.closeLightbox();
        }

        this.resetDragState();
        this.unlockScroll();
        this.unbindKeyPress();

        // Play the exit transition, then hand back to the controller to hide
        // the host. The delay matches the scrim fade-out duration.
        const bg = this.shadowRoot.querySelector('#bugflow-modal-background');
        if (bg) {
            bg.classList.remove('bugflow-open');
        }
        setTimeout(() => eventBus.emit('close-reporting-modal'), 200);
    }
}
