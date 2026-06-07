import { FloatingIcon } from './FloatingIcon.js';
import { Designer } from './Designer.js';
import { Toolbar } from './Toolbar.js';
import { BugMarker } from './BugMarker.js';
import { ReportingModal } from './ReportingModal.js';
import { Notification } from './Notification.js';

// The legacy <bugflow-canvas> is gone — its Snap.svg drawing role is now
// owned by the Konva engine inside <bugflow-designer>'s shadow root.

export function registerComponents() {
    if (!customElements.get('bugflow-floating-icon')) {
        customElements.define('bugflow-floating-icon', FloatingIcon);
    }

    if (!customElements.get('bugflow-designer')) {
        customElements.define('bugflow-designer', Designer);
    }

    if (!customElements.get('bugflow-toolbar')) {
        customElements.define('bugflow-toolbar', Toolbar);
    }

    if (!customElements.get('bugflow-bug-marker')) {
        customElements.define('bugflow-bug-marker', BugMarker);
    }

    if (!customElements.get('bugflow-reporting-modal')) {
        customElements.define('bugflow-reporting-modal', ReportingModal);
    }

    if (!customElements.get('bugflow-notification')) {
        customElements.define('bugflow-notification', Notification);
    }
}

export {
    FloatingIcon,
    Designer,
    Toolbar,
    BugMarker,
    ReportingModal,
    Notification,
};
