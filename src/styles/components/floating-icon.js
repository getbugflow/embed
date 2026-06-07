export const floatingIconStyles = `
    :host {
        position: fixed;
        z-index: 999999999;
        cursor: pointer;
        display: flex;
        align-items: center;
    }

    /* Lower placements use max(10px, safe-area) so the icon clears the iOS
       home indicator and Android gesture bar without changing position on
       desktop. middle-* placements aren't affected by bottom chrome so they
       only respect horizontal safe-area for landscape notches. */
    :host(.circle.lower-right){
        bottom: max(10px, env(safe-area-inset-bottom));
        right: max(10px, env(safe-area-inset-right));
    }

    :host(.circle.lower-left){
        bottom: max(10px, env(safe-area-inset-bottom));
        left: max(10px, env(safe-area-inset-left));
    }

    :host(.circle.middle-right){
        top: calc(50% - 30px);
        right: max(10px, env(safe-area-inset-right));
    }

    :host(.circle.middle-left){
        top: calc(50% - 30px);
        left: max(10px, env(safe-area-inset-left));
    }

    :host button#bugflow-floating-icon-button{
        border: none;
        padding: 0;
        cursor: pointer;
        position: relative;
        transition: transform 180ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    :host button#bugflow-floating-icon-button.circle {
        border-radius: 9999px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    }

    /* Capturing — instant visual acknowledgement of the click.
       Untitled UI dark spinner: white-25% ring with white top-arc, no layout shift. */
    :host(.capturing) button#bugflow-floating-icon-button {
        cursor: default;
        transform: scale(0.96);
    }
    /* Circle: fade icon + tooltip out so the centered 22px ring (::after) is
       the only thing visible. */
    :host(.capturing.circle) button#bugflow-floating-icon-button > svg,
    :host(.capturing.circle) button#bugflow-floating-icon-button > span:not(.bugflow-loading) {
        opacity: 0;
        transition: opacity 120ms ease-out;
    }
    /* Rectangle: hard-swap icon + text out so the inline loading element takes
       their place without layout shift. */
    :host(.capturing.rectangle) button#bugflow-floating-icon-button > svg,
    :host(.capturing.rectangle) button#bugflow-floating-icon-button > span:not(.bugflow-loading) {
        display: none;
    }
    :host(.capturing.circle) button#bugflow-floating-icon-button::after {
        content: '';
        position: absolute;
        inset: 0;
        margin: auto;
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        border: 2px solid rgba(255, 255, 255, 0.25);
        border-top-color: #FFFFFF;
        animation: bugflow-icon-spin 0.7s linear infinite;
    }

    @keyframes bugflow-icon-spin {
        to { transform: rotate(360deg); }
    }

    /* Loading element is hidden by default; .capturing.rectangle reveals it.
       Circle never renders one — its loadingTemplate() returns ''. */
    span.bugflow-loading {
        display: none;
    }
    span.bugflow-loading-rectangle {
        align-items: center;
        font-family: system-ui, sans-serif;
        font-size: 12px;
        line-height: 1;
    }
    :host(.capturing.rectangle) span.bugflow-loading-rectangle {
        display: inline-flex;
    }
    span.bugflow-loading-spinner {
        display: inline-block;
        width: 9px;
        height: 9px;
        margin-right: 4px;
        border-radius: 9999px;
        border: 1.5px solid rgba(255, 255, 255, 0.35);
        animation: bugflow-icon-spin 0.7s linear infinite;
    }
    
    span.tooltip{
        visibility: hidden;
        width: 100px;
        background-color: black;
        color: #fff;
        text-align: center;
        border-radius: 6px;
        padding: 5px 0;
        position: absolute;
        z-index: 1;
        left: 50%;
        margin-left: -60px;
        font-size: 12px;
        font-family: system-ui, sans-serif;
    }

    span.tooltip::after{
        content: " ";
        position: absolute;
        border-style: solid;
    }
    
    :host button#bugflow-floating-icon-button.circle.lower-left span.tooltip{
        bottom: calc( 100% + 5px );
        left: 100%;
    }

    :host button#bugflow-floating-icon-button.circle.lower-right span.tooltip{
        bottom: calc( 100% + 5px );
        left: 20px;
    }

    :host button#bugflow-floating-icon-button.circle.middle-left span.tooltip{
        bottom: calc( 100% + 5px );
        left: 100%;
    }

    :host button#bugflow-floating-icon-button.circle.middle-right span.tooltip{
        bottom: calc( 100% + 5px );
        left: 20px;
    }

    :host button#bugflow-floating-icon-button.circle.lower-left span.tooltip::after{
        bottom: -10px;
        left: 25px;
        border-width: 5px;
        border-color: black transparent transparent transparent;
    }

    :host button#bugflow-floating-icon-button.circle.lower-right span.tooltip::after{
        bottom: -10px;
        right: 25px;
        border-width: 5px;
        border-color: black transparent transparent transparent;
    }

    :host button#bugflow-floating-icon-button.circle.middle-left span.tooltip::after{
        bottom: -10px;
        left: 25px;
        border-width: 5px;
        border-color: black transparent transparent transparent;
    }

    :host button#bugflow-floating-icon-button.circle.middle-right span.tooltip::after{
        bottom: -10px;
        right: 25px;
        border-width: 5px;
        border-color: black transparent transparent transparent;
    }

    /* Tooltip on hover — gated behind (hover: hover) so it doesn't fire on
       touch devices where the first tap would briefly flash a tooltip
       before the click registers. */
    @media (hover: hover) {
        :host button#bugflow-floating-icon-button.circle:hover span.tooltip{
            visibility: visible;
        }
    }

    :host button#bugflow-floating-icon-button.rectangle{
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        padding-top: 4px;
        padding-bottom: 4px;
        padding-right: 8px;
        padding-left: 8px;
        font-family: system-ui, sans-serif;
        font-size: 12px;
    }

    :host(.rectangle.lower-right){
        bottom: env(safe-area-inset-bottom, 0px);
        right: max(20px, env(safe-area-inset-right));
    }

    :host(.rectangle.lower-left){
        bottom: env(safe-area-inset-bottom, 0px);
        left: max(20px, env(safe-area-inset-left));
    }

    :host(.rectangle.middle-right){
        right: 0px;
        top: 50%;
        transform: rotate(270deg) translateX(50%);
        -moz-transform-origin: 100% 100%;
        -o-transform-origin: 100% 100%;
        -webkit-transform-origin: 100% 100%;
    }

    :host(.rectangle.middle-left){
        left: 0px;
        top: 50%;
        transform: rotate(90deg) translateX(-50%);
        -moz-transform-origin: 0 22px;
        -o-transform-origin: 0 22px;
        -webkit-transform-origin: 0 22px;
    }

    :host button#bugflow-floating-icon-button.rectangle .icon{
        width: 9px;
        height: 9px;
        margin-right: 4px;
    }

    /** The floating icon is inactive by default **/
    :host button#bugflow-floating-icon-button.inactive{
        display: flex;
    }

    :host button#bugflow-floating-icon-button.prompt{
        display: none;
    }

    /** When the floating icon is active **/
    :host button#bugflow-floating-icon-button.active .inactive{
        display: none;
    }

    :host button#bugflow-floating-icon-button.active .prompt{
        display: flex;
        -webkit-animation: rotate-in-2-cw 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                animation: rotate-in-2-cw 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
    }
`;