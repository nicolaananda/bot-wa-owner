# bot-wa-owner

Astro owner dashboard for the existing bot-wa backend.

## Status: work in progress

This repository contains the current canonical frontend foundation, not a completed admin panel or production release. The final QuizForge styling, mutation forms, browser QA and secure same-origin API proxy are not complete. Backend changes live in the separate bot-wa repository and are not included here.

Do not deploy with production owner credentials until authentication, CSRF/session renewal, API compatibility and proxy integration have passed end-to-end review. A successful build is not evidence of completed functionality.

## Development

```sh
npm ci
npm run dev
npm run build
```

`npm run build` runs Astro diagnostics and emits static files to `dist/`.

`.env.example` contains only a placeholder public API URL. Never place owner secrets, provider credentials or shared backend tokens in `PUBLIC_*` variables. The frontend defaults to `/api/owner/v1`; same-origin routing is not yet implemented in this repository.

## Hosting targets

- Cloudflare Pages: build command `npm run build`, output directory `dist`.
- Cloudflare Workers Static Assets: configuration provided in `wrangler.jsonc`.

These settings cover static hosting only. They do not configure authentication, upstream API routing, CORS, deployment credentials or a custom domain. No deployment is performed by pushing this repository itself unless an external integration has separately been configured.

## Current limitations

- Frontend primarily reads existing owner API summaries.
- Several response shapes still need alignment with the evolving backend contract.
- Product/stock and balance actions must remain unavailable until backend concurrency and idempotency issues are resolved.
- Design does not yet match the requested QuizForge reference.
- No production deployment, API restart or production-data mutation is part of this initial import.
