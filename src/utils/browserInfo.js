export class BrowserInfo {
    constructor() {
        
    }

    getBrowserInfo() {
        let userAgent = this.getUserAgent();
        let resolution = this.getResolution();
        let viewport = this.getViewport();
        let operatingSystem = this.getOperatingSystem();
        let dpi = this.getDPI();
        let colorDepth = this.getColorDepth();
        let deviceType = this.getDeviceType();
        
        return {
            user_agent: userAgent,
            resolution: resolution,
            viewport: viewport,
            operating_system: operatingSystem,
            dpi: dpi,
            color_depth: colorDepth,
            device_type: deviceType
        }
    }

    clearBrowserInfo() {
        return {
            user_agent: '',
            resolution: '',
            viewport: '',
            operating_system: '',
            dpi: '',
            color_depth: '',
            device_type: ''
        }
    }

    getUserAgent() {
        let userAgent = navigator.userAgent;
        let browserName  = navigator.appName;
        let fullVersion  = ''+parseFloat( navigator.appVersion ); 
        let majorVersion = parseInt( navigator.appVersion, 10 );
        let nameOffset, verOffset, ix;

        if ( ( verOffset = userAgent.indexOf("Edg") ) != -1 ) {
            browserName = "Microsoft Edge";
            fullVersion = userAgent.substring(verOffset+4);
        }
        
        else if ( ( verOffset = userAgent.indexOf("Chrome") ) != -1 ) {
            browserName = "Chrome";
            fullVersion = userAgent.substring(verOffset+7);
        }
        
        else if ( ( verOffset = userAgent.indexOf("Safari") ) !=-1 ) {
            browserName = "Safari";
            fullVersion = userAgent.substring( verOffset + 7 );

            if ( ( verOffset = userAgent.indexOf("Version") ) != -1 ){ 
                fullVersion = userAgent.substring( verOffset + 8 );
            }
        }
        
        else if ( ( verOffset = userAgent.indexOf("Firefox") ) != -1 ) {
            browserName = "Firefox";
            fullVersion = userAgent.substring(verOffset+8);
        }
        
        else if ( ( nameOffset=userAgent.lastIndexOf(' ') + 1 ) < 
            ( verOffset = userAgent.lastIndexOf('/') ) ){

            browserName = userAgent.substring( nameOffset, verOffset );
            fullVersion = userAgent.substring( verOffset + 1 );

            if ( browserName.toLowerCase() == browserName.toUpperCase() ) {
                browserName = navigator.appName;
            }
        }
        
        if ( ( ix = fullVersion.indexOf(";") ) != -1 ){
            fullVersion = fullVersion.substring( 0, ix );
        }

        if ( ( ix = fullVersion.indexOf(" ") ) != -1 ){
            fullVersion = fullVersion.substring( 0, ix );
        }

        majorVersion = parseInt( '' + fullVersion, 10 );

        if ( isNaN( majorVersion ) ) {
            fullVersion  = ''+parseFloat( navigator.appVersion ); 
            majorVersion = parseInt( navigator.appVersion, 10 );
        }

        return browserName + ' ' + majorVersion + ' (' + fullVersion + ')';
    }

    getResolution() {
        return {
            height: window.screen.height,
            width: window.screen.width
        }
    }
    
    getViewport() {
        return {
            width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
            height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        }
    }
    
    getOperatingSystem() {
        if (window.navigator.userAgentData) {
            return window.navigator.userAgentData.platform || '';
        }
        const v = navigator.appVersion || '';
        if (v.indexOf('Win') !== -1) {
            return 'Windows OS';
        }
        if (v.indexOf('Mac') !== -1) {
            return 'MacOS';
        }
        if (v.indexOf('X11') !== -1) {
            return 'UNIX OS';
        }
        if (v.indexOf('Linux') !== -1) {
            return 'Linux OS';
        }
        return '';
    }

    getDeviceType() {
        if (window.navigator.userAgentData && window.navigator.userAgentData.mobile === true) {
            return 'Mobile';
        }
        return 'Computer';
    }

    getDPI() {
        return window.devicePixelRatio;
    }

    getColorDepth() {
        return window.screen.colorDepth;
    }
}

export const browserInfo = new BrowserInfo();