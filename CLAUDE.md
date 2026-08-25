# @getbugflow/embed

The Bugflow feedback widget any site drops in: floating launcher, screenshot capture, annotation, technical-context collection, and submission to a Bugflow instance's `/api/v1`.

## This repo is public

Source-available under Apache-2.0 on GitHub, published to npm. It accepts no external contributions, issues, or PRs. Never reference internal infrastructure, GitLab URLs, customer names, or unreleased plans in code, comments, or docs here.

## Constraints

- **No build step, no framework.** `src/` is published verbatim and also bundled by `bugflow-web-app` into `public/embed.js` (served as `cdn.bugflow.io/embed.js`). Same source powers both — there is no behavioral fork. Ship ESM that runs in a browser as-is.
- **It runs on someone else's page.** The UI is Web Components with Shadow DOM; each component's CSS is a template string in `src/styles/components/` that starts from `:host { all: initial }`. Nothing may leak into, or depend on, the host page's CSS, globals, or libraries. Keep dependencies minimal — every byte is on a customer's critical path.
- **`@getbugflow/annotator-core` is imported dynamically** so the engine and `konva` only load when a reporter actually opens the annotator. Keep that import lazy.
- **The public API is a contract.** `Bugflow.init()`, `setMetadata()`, `clearMetadata()`, `recordBug()` and the `init` config keys are documented on the marketing site and pasted into customers' pages. Additive changes only; a rename is a breaking release.
- **The CDN snippet queues calls before load** (`window.Bugflow._q`). Anything new that customers call before the script finishes loading must be drained from that queue too.

## Commands

```bash
pnpm test        # placeholder — no tests yet
```

There is no test suite, so verify changes by running the widget in a consumer.

## Working on it

`bugflow-web-app`'s `yarn dev` sets `BUGFLOW_LOCAL_EMBED=1`, aliasing this package to `../bugflow-embed/src/index.js` and rebuilding `public/embed.js` on save. That is the real verification loop:

```bash
cd ../bugflow-web-app && spin run node yarn dev
```

Requires the repos cloned side by side. See the workspace `CLAUDE.md` one directory up.

## Releasing

Bump `version` in `package.json`, commit, then push a matching `vX.Y.Z` tag. `.github/workflows/publish.yml` publishes via OIDC trusted publishing — no `NPM_TOKEN`.

Then bump the pin in `bugflow-web-app`. Its production build bundles the `node_modules` copy into `public/embed.js`, so without the bump the CDN keeps serving the old widget.
