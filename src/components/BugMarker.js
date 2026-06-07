const template = () => {
    return `
        <svg width="70" height="70" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.1">
                <rect x="0.5" width="40" height="40" rx="20" fill="#6CE9A6"/>
            </g>
            <g opacity="0.2">
                <rect x="8.5" y="8" width="24" height="24" rx="12" fill="#6CE9A6"/>
            </g>
            <rect x="16.5" y="16" width="8" height="8" rx="4" fill="#6CE9A6"/>
        </svg>
    `;
}

export class BugMarker extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = template();
    }
}