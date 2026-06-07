import { browserInfo } from './browserInfo.js';

// ------------------------------------------------------------------
// Console recorder
//
// Captures the same shape as the browser extension's logger so the
// server-side issue renderer (Modules/Project/.../MergeIssueTemplate.php)
// can produce one report format regardless of whether the feedback came
// from the embed widget or the browser extension. Mirrors:
//
//   - level (canonical) + severity (back-compat)
//   - kind: 'console' | 'window-error' | 'unhandled-rejection'
//           | 'group-start' | 'group-end' | 'table'
//   - source: { url, line, col, fn, label }    — captured at call site
//   - stack: [{ fn, url, line, col }]          — for error/warn/window/rejection
//   - count                                    — repeats collapsed in-place
//   - parentGroupId, group: { id, depth }      — for console.group children
//   - table: { columns, rows }                 — for console.table
// ------------------------------------------------------------------

const MAX_LOG_ENTRIES = 250;
let logEntries = [];
let lastDedupeKey = '';
let entryIdCounter = 0;
let groupIdCounter = 0;
const groupIdStack = [];

function nextEntryId() { return ++entryIdCounter; }
function nextGroupId() { return 'g' + (++groupIdCounter); }

// Parse a single line of an Error.stack into { fn, url, line, col }.
// Handles Chrome ("at fn (url:l:c)") and Firefox/Safari ("fn@url:l:c").
function parseStackFrame(line) {
    const t = (line || '').trim();
    if (!t) return null;
    let m = /^at (?:async )?(?:(.+?) )?\((.+?):(\d+):(\d+)\)$/.exec(t);
    if (m) return { fn: m[1] || '<anonymous>', url: m[2], line: +m[3], col: +m[4] };
    m = /^at (?:async )?(.+?):(\d+):(\d+)$/.exec(t);
    if (m) return { fn: '<anonymous>', url: m[1], line: +m[2], col: +m[3] };
    m = /^(.*?)@(.+?):(\d+):(\d+)$/.exec(t);
    if (m) return { fn: m[1] || '<anonymous>', url: m[2], line: +m[3], col: +m[4] };
    return null;
}

function parseStack(stack) {
    if (!stack) return [];
    const out = [];
    for (const ln of String(stack).split('\n')) {
        const f = parseStackFrame(ln);
        if (!f) continue;
        // Skip frames inside the bundled embed so the source link points at
        // the caller, not our wrappers. Everything bundles into `embed.js`
        // at build time (vite mode=embed → public/embed.js), so a basename
        // match is sufficient.
        if (/\/embed\.js(?:[?#]|$)/.test(f.url)) continue;
        out.push(f);
    }
    return out;
}

function captureStackHere() {
    let s = '';
    try { throw new Error(); } catch (e) { s = e.stack || ''; }
    return parseStack(s);
}

function shortLabel(url, line) {
    if (!url) return '';
    let last = '';
    try {
        const u = new URL(url);
        const segs = (u.pathname || '').split('/').filter(Boolean);
        last = segs[segs.length - 1] || u.host || url;
    } catch {
        const segs = String(url).split(/[\\/]/).filter(Boolean);
        last = segs[segs.length - 1] || url;
    }
    last = last.split('?')[0].split('#')[0];
    return line ? `${last}:${line}` : last;
}

function sourceFromFrame(f) {
    if (!f) return null;
    return { url: f.url, line: f.line, col: f.col, fn: f.fn, label: shortLabel(f.url, f.line) };
}

function messageOf(args) {
    if (!Array.isArray(args)) return '';
    return args.map((a) => {
        if (a == null) return String(a);
        if (typeof a === 'string') return a;
        if (a instanceof Error) return a.message || a.toString();
        try { return JSON.stringify(a); } catch { return String(a); }
    }).join(' ');
}

function dedupeKey(level, kind, text) {
    // Same incident often surfaces via more than one capture path
    // (window 'error' listener AND an explicit console.error). Collapsing
    // error-level rows on text alone keeps the count honest.
    if (level === 'error') return 'error::' + text;
    return level + ':' + kind + ':' + text;
}

function pushLog(entry) {
    entry.id = nextEntryId();
    entry.timestamp = entry.timestamp || new Date().toISOString();
    entry.url = entry.url || (typeof window !== 'undefined' ? window.location.href : '');
    if (groupIdStack.length && !entry.parentGroupId && entry.kind !== 'group-start' && entry.kind !== 'group-end') {
        entry.parentGroupId = groupIdStack[groupIdStack.length - 1];
    }

    // group-end markers carry no message — never dedup; never count.
    if (entry.kind !== 'group-end') {
        const text = entry.error || entry.message
            || (entry.reason && entry.reason.message)
            || (entry.args ? messageOf(entry.args) : '')
            || '';
        const key = dedupeKey(entry.level, entry.kind, text);
        if (key === lastDedupeKey && logEntries.length) {
            const prev = logEntries[logEntries.length - 1];
            if (prev) {
                prev.count = (prev.count || 1) + 1;
                return;
            }
        }
        lastDedupeKey = key;
        entry.count = 1;
    }

    if (logEntries.length >= MAX_LOG_ENTRIES) return;
    logEntries.push(entry);
}

// ------------------------------------------------------------------
// Console.table → { columns, rows } extractor. Mirrors the extension
// in producing rows keyed by their column name so the server-side
// renderer can lay them out as an ASCII table.
// ------------------------------------------------------------------
function buildTable(data, columnsFilter) {
    try {
        const rows = [];
        const cols = [];
        const seen = Object.create(null);
        const addCol = (k) => {
            if (columnsFilter && columnsFilter.indexOf(k) === -1 && k !== '(index)' && k !== 'Values') return;
            if (!seen[k]) { seen[k] = true; cols.push(k); }
        };
        addCol('(index)');
        const preview = (v) => {
            if (v == null) return String(v);
            if (typeof v === 'string') return v.length > 60 ? v.slice(0, 60) + '…' : v;
            if (typeof v === 'number' || typeof v === 'boolean') return String(v);
            try { return JSON.stringify(v); } catch { return String(v); }
        };
        const ingest = (idx, row) => {
            if (row && typeof row === 'object') {
                const out = { '(index)': String(idx) };
                let keys = [];
                try { keys = Object.keys(row); } catch {}
                for (const k of keys) {
                    addCol(k);
                    out[k] = preview(row[k]);
                }
                rows.push(out);
            } else {
                addCol('Values');
                rows.push({ '(index)': String(idx), Values: preview(row) });
            }
        };
        if (Array.isArray(data)) {
            data.forEach((r, i) => ingest(i, r));
        } else if (data && typeof data === 'object') {
            for (const k of Object.keys(data)) ingest(k, data[k]);
        } else {
            addCol('Values');
            rows.push({ '(index)': '0', Values: preview(data) });
        }
        return { columns: cols, rows };
    } catch {
        return null;
    }
}

function initLogger() {
    const orig = {
        log:   console.log,
        info:  console.info,
        debug: console.debug,
        warn:  console.warn,
        error: console.error,
        group: console.group,
        groupCollapsed: console.groupCollapsed,
        groupEnd: console.groupEnd,
        table: console.table,
    };

    function wrap(level) {
        return function (...args) {
            try { orig[level].apply(console, args); } catch {}
            try {
                const includeStack = level === 'error' || level === 'warn';
                const stack = includeStack ? captureStackHere() : null;
                const source = sourceFromFrame((stack && stack[0]) || captureStackHere()[0]);
                pushLog({
                    level,
                    kind: 'console',
                    severity: level === 'error' ? 'error' : level === 'warn' ? 'warning' : null,
                    error: messageOf(args),
                    args,
                    source,
                    stack: includeStack ? stack : null,
                });
            } catch { /* never let logging break user code */ }
        };
    }

    console.log   = wrap('log');
    console.info  = wrap('info');
    console.debug = wrap('debug');
    console.warn  = wrap('warn');
    console.error = wrap('error');

    function pushGroupStart(args, collapsed) {
        const id = nextGroupId();
        const stack = captureStackHere();
        const source = sourceFromFrame(stack[0]);
        pushLog({
            level: 'log',
            kind:  'group-start',
            error: messageOf(args),
            args,
            source,
            group: { id, depth: groupIdStack.length, collapsed: !!collapsed },
        });
        groupIdStack.push(id);
    }

    console.group = function (...args) {
        try { orig.group.apply(console, args); } catch {}
        try { pushGroupStart(args, false); } catch {}
    };

    console.groupCollapsed = function (...args) {
        try { orig.groupCollapsed.apply(console, args); } catch {}
        try { pushGroupStart(args, true); } catch {}
    };

    console.groupEnd = function () {
        try { orig.groupEnd.apply(console, []); } catch {}
        try {
            const popped = groupIdStack.pop();
            pushLog({ level: 'log', kind: 'group-end', parentGroupId: popped || null });
        } catch {}
    };

    console.table = function (data, columnsFilter) {
        try { orig.table.apply(console, [data, columnsFilter]); } catch {}
        try {
            const stack = captureStackHere();
            const source = sourceFromFrame(stack[0]);
            const tbl = buildTable(data, columnsFilter);
            pushLog({
                level: 'log',
                kind:  'table',
                error: 'console.table()',
                args:  [data],
                source,
                table: tbl,
            });
        } catch {}
    };

    window.addEventListener('error', (event) => {
        try {
            const errStack = event.error && event.error.stack ? parseStack(event.error.stack) : null;
            const entry = {
                level:    'error',
                kind:     'window-error',
                severity: 'error',
                type:     'error',
                error:    event.message,
                filename: event.filename,
                lineno:   event.lineno,
                colno:    event.colno,
            };
            if (errStack && errStack.length) {
                entry.stack = errStack;
                entry.source = sourceFromFrame(errStack[0]);
            } else if (event.filename) {
                entry.source = {
                    url:   event.filename,
                    line:  event.lineno,
                    col:   event.colno,
                    fn:    '<anonymous>',
                    label: shortLabel(event.filename, event.lineno),
                };
            }
            pushLog(entry);
        } catch {}
    });

    window.addEventListener('unhandledrejection', (event) => {
        try {
            const r = event.reason || {};
            const reason = {
                message: typeof r === 'string' ? r : (r.message || 'Unknown rejection'),
                stack:   r.stack || null,
            };
            const parsed = reason.stack ? parseStack(reason.stack) : null;
            const entry = {
                level:    'error',
                kind:     'unhandled-rejection',
                severity: 'error',
                type:     'unhandledrejection',
                error:    reason.message,
                reason,
            };
            if (parsed && parsed.length) {
                entry.stack = parsed;
                entry.source = sourceFromFrame(parsed[0]);
            }
            pushLog(entry);
        } catch {}
    });
}

initLogger();

class BugflowBugData {
    name = '';
    email = '';
    title = '';
    description = '';
    url = '';
    screenshot = '';
    // Visitor-attached extra images: { file, previewUrl }. The previewUrl is
    // an object URL used both for the in-modal thumbnail/lightbox AND as the
    // url_key embedded in the description markdown, so the server's
    // MergeAttachments rewrites it to a real URL on display + issue sync.
    images = [];
    meta = {
        user_agent: '',
        resolution: '',
        viewport: '',
        operating_system: '',
        dpi: '',
        color_depth: '',
        device_type: '',
        element: '',
        logs: []
    };
    uuid = '';

    constructor() {
        
    }

    setName( name ) {
        this.name = name;
    }

    getName() {
        return this.name;
    }

    setEmail( email ) {
        this.email = email;
    }

    getEmail() {
        return this.email;
    }

    setTitle( title ) {
        this.title = title;
    }

    getTitle() {
        return this.title;
    }

    setDescription( description ) {
        this.description = description;
    }

    getDescription() {
        return this.description;
    }

    setUrl( url ) {
        this.url = url;
    }

    getUrl() {
        return this.url;
    }

    setScreenshot( screenshot ) {
        this.screenshot = screenshot;
    }

    getScreenshot() {
        return this.screenshot;
    }

    addImage( file ) {
        const previewUrl = this.getObjectUrl( file );
        this.images.push({ file, previewUrl });
        return previewUrl;
    }

    removeImage( index ) {
        const image = this.images[index];
        if( image ) {
            try { URL.revokeObjectURL( image.previewUrl ); } catch {}
            this.images.splice( index, 1 );
        }
    }

    getImages() {
        return this.images;
    }

    setBrowserInfo(){
        // Preserve any pin coordinates already captured during the
        // annotator phase. setBrowserInfo() rebuilds `this.meta` from
        // scratch at submit time, so without this guard the pin would
        // be silently dropped when called after `setPin()`.
        const pin = this.meta?.bug_pin ?? null;

        this.meta = browserInfo.getBrowserInfo();
        this.meta.logs = [...logEntries];

        if (pin) {
            this.meta.bug_pin = pin;
        }
    }

    /**
     * Stash the bug-pin coordinates captured during annotation so they ride
     * along on `meta.bug_pin` in the submit payload. AI agents reading the
     * GitHub/GitLab issue can then cite the exact pixel + normalized
     * location of the issue. Pass `null` to clear.
     */
    setPin( coords ){
        if (!this.meta) {
            this.meta = {};
        }
        if (coords) {
            this.meta.bug_pin = coords;
        } else {
            delete this.meta.bug_pin;
        }
    }

    setKey( key ) {
        this.uuid = key;
    }

    setElement( element ) {
        this.meta.element = element.outerHTML;
    }

    /**
     * Attach developer-supplied custom metadata (e.g. app version, plan,
     * active route) under a single nested `custom_metadata` key so it never
     * collides with the reserved environment keys above. Sanitized here to
     * keep the payload small and honest — the server re-validates because the
     * widget endpoint is public and this guard is bypassable.
     */
    setCustomMetadata( metadata ) {
        if( !metadata || typeof metadata !== 'object' ) {
            return;
        }

        const MAX_PAIRS = 50;
        const MAX_KEY_LENGTH = 64;
        const MAX_VALUE_LENGTH = 1024;

        const clean = {};
        let count = 0;

        for( const [rawKey, rawValue] of Object.entries( metadata ) ) {
            if( count >= MAX_PAIRS ) {
                break;
            }

            const key = String( rawKey ).trim().slice( 0, MAX_KEY_LENGTH );

            if( key === '' ) {
                continue;
            }

            const type = typeof rawValue;
            if( type !== 'string' && type !== 'number' && type !== 'boolean' ) {
                continue;
            }

            const value = String( rawValue ).slice( 0, MAX_VALUE_LENGTH );

            if( value.trim() === '' ) {
                continue;
            }

            clean[key] = value;
            count++;
        }

        if( Object.keys( clean ).length > 0 ) {
            this.meta.custom_metadata = clean;
        }
    }

    async convertToFormData() {
        let formData = new FormData();

        let screenshotUrl = '';
        let index = 0;

        if( this.screenshot != '' ){
            const screenshotFile = await this.urltoFile( this.screenshot, 'screenshot.jpg', 'image/jpeg' );

            screenshotUrl = this.getObjectUrl( screenshotFile );

            formData.append('attachments['+index+']', screenshotFile );
            formData.append('attachment_meta['+index+'][name]', 'screenshot.jpg' );
            formData.append('attachment_meta['+index+'][type]', 'image/jpeg' );
            formData.append('attachment_meta['+index+'][url]', screenshotUrl );
            formData.append('attachment_meta['+index+'][id]', 'screenshot');
            index++;
        }

        // Each extra image rides as its own attachment with a unique filename
        // (the server matches attachment_meta to files by name) and carries
        // its previewUrl as the url_key so MergeAttachments can rewrite the
        // matching ![image](previewUrl) in the description to a real URL.
        let imagesMarkdown = '';

        this.images.forEach( ( image, i ) => {
            const extension = ( image.file.type.split('/')[1] || 'png' ).replace('jpeg', 'jpg');
            const uniqueName = 'image-' + ( i + 1 ) + '.' + extension;
            const file = new File( [image.file], uniqueName, { type: image.file.type } );

            formData.append('attachments['+index+']', file );
            formData.append('attachment_meta['+index+'][name]', uniqueName );
            formData.append('attachment_meta['+index+'][type]', image.file.type );
            formData.append('attachment_meta['+index+'][url]', image.previewUrl );
            formData.append('attachment_meta['+index+'][id]', 'image-' + ( i + 1 ) );

            imagesMarkdown += '\n\n![image](' + image.previewUrl + ')';
            index++;
        });

        let markdown = this.buildMarkdown( screenshotUrl, imagesMarkdown );

        formData.append('title', this.title);
        formData.append('description', markdown);
        formData.append('url', this.url);
        formData.append('guest_name', this.name);
        formData.append('guest_email', this.email);
        formData.append('meta', JSON.stringify( this.meta ) );
        formData.append('uuid', this.uuid );

        return formData;
    }

    buildMarkdown( screenshotUrl, imagesMarkdown = '' ) {
        let markdown = '';

        if( screenshotUrl != '' ){
            markdown = '![Screenshot]('+screenshotUrl+')\n\n';
        }

        markdown += this.description;
        markdown += imagesMarkdown;

        return markdown;
    }

    getObjectUrl( file ) {
        const URLObj = window.URL || webkitURL;
        const blobUrl = URLObj.createObjectURL( file );

        return blobUrl;
    }
    
    async urltoFile(url, filename, mimeType){
        return (fetch(url)
            .then(function(res){return res.arrayBuffer();})
            .then(function(buf){return new File([buf], filename,{type:mimeType});})
        );
    }

    resetBugData() {
        this.name = '';
        this.email = '';
        this.title = '';
        this.description = '';
        this.url = '';
        this.screenshot = '';
        this.images.forEach( ( image ) => {
            try { URL.revokeObjectURL( image.previewUrl ); } catch {}
        });
        this.images = [];
        this.meta = browserInfo.clearBrowserInfo();
        this.meta.logs = [];
        this.uuid = '';
    }
}

export const bugData = new BugflowBugData();