# @getbugflow/embed

The [Bugflow](https://bugflow.io) visual feedback & bug-reporting widget — a drop-in launcher that
captures a screenshot, lets the reporter annotate it, collects full technical context (browser, OS,
viewport, console errors, the pinned element), and posts it to your Bugflow instance.

**Source-available under Apache-2.0.** This package is published so you can install and bundle it
directly. It is maintained by 521 Dimensions for the Bugflow product and is **not accepting external
contributions, issues, or pull requests.**

The same `src/` powers both the npm package and the CDN build (`cdn.bugflow.io/embed.js`) that the
Bugflow app serves — there is no behavioral fork.

## Install

```bash
npm install @getbugflow/embed
# or: pnpm add @getbugflow/embed
```

## Usage — npm / bundler

```js
import Bugflow from '@getbugflow/embed';

Bugflow.init({
  key: 'your-project-uuid',
  endpoint: 'https://app.bugflow.io/api/v1', // self-hosted: https://your-instance/api/v1
});
```

Optional configuration (all have sensible defaults): `widget_color`, `widget_text`, `alignment`,
`theme`, `modal_title`, `feedback_prompt`, `show_widget` (set `false` for headless mode and trigger
reporting yourself via `Bugflow.recordBug()`), and more. Attach changing context for SPAs with
`Bugflow.setMetadata({ ... })`.

## Usage — CDN script tag (no build step)

```html
<script>
  window.Bugflow = window.Bugflow || { _q: [], init:function(c){this._q.push(['init',c]);}, setMetadata:function(m){this._q.push(['setMetadata',m]);}, clearMetadata:function(){this._q.push(['clearMetadata']);} };
</script>
<script async src="https://cdn.bugflow.io/embed.js"></script>
<script>
  Bugflow.init({ key: 'your-project-uuid', endpoint: 'https://app.bugflow.io/api/v1' });
</script>
```

## Dependencies

The annotation engine lives in [`@getbugflow/annotator-core`](https://www.npmjs.com/package/@getbugflow/annotator-core)
(imported dynamically, so it only loads when a reporter opens the annotator). `konva` is pulled in as
its peer dependency. Screenshot capture uses `modern-screenshot`; hotkeys use `hotkeys-js`.
