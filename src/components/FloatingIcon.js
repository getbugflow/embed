import { state } from '../state.js';
import { floatingIconStyles } from '../styles/components/floating-icon.js';
import { eventBus } from '../utils/events.js';

const iconTemplate = () => {
    switch( state.get('icon') ) {
        case 'message-square-left':
            return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="'+state.get('icon_text_color')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="tooltip">Send Feedback</span>'
        break;
        case 'message-square-right':
            return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 15C3 15.5304 3.21071 16.0391 3.58579 16.4142C3.96086 16.7893 4.46957 17 5 17H17L21 21V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V15Z" stroke="'+state.get('icon_text_color')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="tooltip">Send Feedback</span>'
        break;
        case 'message-circle-left':
            return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7117 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92176 4.44061 8.37485 5.27072 7.03255C6.10083 5.69025 7.28825 4.60557 8.7 3.9C9.87812 3.30493 11.1801 2.99656 12.5 3H13C15.0843 3.11499 17.053 3.99476 18.5291 5.47086C20.0052 6.94695 20.885 8.91565 21 11V11.5Z" stroke="'+state.get('icon_text_color')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="tooltip">Send Feedback</span>';
        break;
        case 'message-circle-right':
            return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.00003 11.5C2.99659 12.8199 3.30496 14.1219 3.90003 15.3C4.60559 16.7118 5.69027 17.8992 7.03257 18.7293C8.37487 19.5594 9.92178 19.9994 11.5 20C12.8199 20.0034 14.1219 19.6951 15.3 19.1L21 21L19.1 15.3C19.6951 14.1219 20.0034 12.8199 20 11.5C19.9994 9.92177 19.5594 8.37487 18.7293 7.03257C17.8992 5.69027 16.7118 4.60559 15.3 3.90003C14.1219 3.30496 12.8199 2.99659 11.5 3.00003H11C8.91567 3.11502 6.94698 3.99479 5.47088 5.47088C3.99479 6.94698 3.11502 8.91567 3.00003 11V11.5Z" stroke="'+state.get('icon_text_color')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="tooltip">Send Feedback</span>'
        break;
        case 'mail':
            return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6M22 6L12 13L2 6" stroke="'+state.get('icon_text_color')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="tooltip">Send Feedback</span>'
        break;
        case 'help':
            return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="'+state.get('icon_text_color')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="tooltip">Send Feedback</span>';
        break;
    }
}

const iconTemplateAndText = () => {
    switch( state.get('icon') ) {
        case 'message-square-left':
            return '<svg width="24" height="24" class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="'+state.get('icon_text_color')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="color: '+state.get('icon_text_color')+'">'+state.get('widget_text')+'</span>';
        break;
        case 'message-square-right':
            return '<svg width="24" height="24" class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 15C3 15.5304 3.21071 16.0391 3.58579 16.4142C3.96086 16.7893 4.46957 17 5 17H17L21 21V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V15Z" stroke="'+state.get('icon_text_color')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="color: '+state.get('icon_text_color')+'">'+state.get('widget_text')+'</span>';
        break;
        case 'message-circle-left':
            return '<svg width="24" height="24" class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7117 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92176 4.44061 8.37485 5.27072 7.03255C6.10083 5.69025 7.28825 4.60557 8.7 3.9C9.87812 3.30493 11.1801 2.99656 12.5 3H13C15.0843 3.11499 17.053 3.99476 18.5291 5.47086C20.0052 6.94695 20.885 8.91565 21 11V11.5Z" stroke="'+state.get('icon_text_color')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="color: '+state.get('icon_text_color')+'">'+state.get('widget_text')+'</span>';
        break;
        case 'message-circle-right':
            return '<svg width="24" height="24" class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.00003 11.5C2.99659 12.8199 3.30496 14.1219 3.90003 15.3C4.60559 16.7118 5.69027 17.8992 7.03257 18.7293C8.37487 19.5594 9.92178 19.9994 11.5 20C12.8199 20.0034 14.1219 19.6951 15.3 19.1L21 21L19.1 15.3C19.6951 14.1219 20.0034 12.8199 20 11.5C19.9994 9.92177 19.5594 8.37487 18.7293 7.03257C17.8992 5.69027 16.7118 4.60559 15.3 3.90003C14.1219 3.30496 12.8199 2.99659 11.5 3.00003H11C8.91567 3.11502 6.94698 3.99479 5.47088 5.47088C3.99479 6.94698 3.11502 8.91567 3.00003 11V11.5Z" stroke="'+state.get('icon_text_color')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="color: '+state.get('icon_text_color')+'">'+state.get('widget_text')+'</span>';
        break;
        case 'mail':
            return '<svg width="24" height="24" class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6M22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6M22 6L12 13L2 6" stroke="'+state.get('icon_text_color')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="color: '+state.get('icon_text_color')+'">'+state.get('widget_text')+'</span>';
        break;
        case 'help':
            return '<svg width="24" height="24" class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="'+state.get('icon_text_color')+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="color: '+state.get('icon_text_color')+'">'+state.get('widget_text')+'</span>';
        break;
    }
};

const template = () => {
    if( state.get('widget_style') === 'circle' ) {
        return iconTemplate();
    } else {
        return iconTemplateAndText();
    }
};

// Rectangle is too small for the 22px ring spinner used on the circle —
// instead, the icon morphs into a 9px ring and the text becomes "Capturing…",
// keeping the same height, color, and rhythm. Circle stays silent (the in-place
// 22px spinner inside the 60px button is enough on its own).
const loadingTemplate = () => {
    if( state.get('widget_style') === 'circle' ) {
        return '';
    }

    return '<span class="bugflow-loading bugflow-loading-rectangle" style="color: '+state.get('icon_text_color')+';"><span class="bugflow-loading-spinner" style="border-top-color: '+state.get('icon_text_color')+';"></span>Capturing…</span>';
};

export class FloatingIcon extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
        this.subscribeToState();
    }

    disconnectedCallback() {
        
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>${floatingIconStyles}</style>
            <button id="bugflow-floating-icon-button" style="background-color: ${state.get('widget_color')};" class="${state.get('widget_style')} ${state.get('alignment')}">
                ${loadingTemplate()}${template()}
            </button>
        `;

        this.classList.add(state.get('widget_style'));
        this.classList.add(state.get('alignment'));
    }

    subscribeToState() {
        state.subscribe((key, value) => {
            let keys = [
                'widget_style',
                'alignment',
                'icon_text_color',
                'widget_color',
                'widget_text',
                'icon'
            ];

            if( keys.includes(key) ){
                this.render();
                this.attachEventListeners();
                return;
            }

            if (key === 'reporting_state') {
                // Toggle the in-place spinner state on the host so the user
                // sees the click acknowledged the moment they press it,
                // while the screenshot capture runs invisibly in the
                // background. The page stays visible throughout — no black
                // overlay until the annotator is ready to fade in.
                this.classList.toggle('capturing', value === 'capturing');
            }
        });
    }

    attachEventListeners() {
        this.shadowRoot.querySelector('#bugflow-floating-icon-button').addEventListener('click', () => {
            eventBus.emit('design-bug');
        });
    }
}