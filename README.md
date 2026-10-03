# bot-wa-owner

Astro dashboard for bot-wa. Integration release: owner login and read-only operational views. Not the complete admin panel; final QuizForge styling and mutating admin forms remain unfinished. Backend changes live in the separate bot-wa repository.

## Build and tests

```sh
npm ci
node tests/proxy.test.mjs
npm run build
npx wrangler@4.147.0 deploy --dry-run
```

## Cloudflare Workers

Deploy with the included `wrangler.jsonc`. The Worker runs before `/api/*` and proxies only `/api/owner/v1` to the configured upstream. Static frontend calls the same origin; no browser credentials or public backend token required.

Runtime Text variable:

```
OWNER_API_UPSTREAM=https://pay.ghzm.us
```

The upstream is intentionally restricted to HTTPS `pay.ghzm.us`. Update the server-side allowlist and tests if the backend domain changes. Missing configuration returns 503 JSON, not a misleading HTML response.

## Cloudflare Pages

Build `npm run build`, output `dist`. The `functions/api/owner/v1/[[path]].js` Pages Function uses the same proxy. Deploy using Pages Git integration or Wrangler Pages Functions deployment, not an assets-only upload. Set the same server-side variable. Backend owner origin allowlist must include the exact Pages production origin.

## Backend setup (JKT, not Cloudflare/public variables)

- `OWNER_API_OWNERS`: explicit permitted owner identifiers.
- `OWNER_API_SECRET`: private login password.
- `OWNER_SESSION_SECRET`: separate random signing secret.
- `OWNER_API_ORIGINS`: exact permitted dashboard origins.

Keep credentials out of Git and group chats. Sessions use Secure HttpOnly cookies, CSRF checks and no-store responses. Login/logout are enabled; unverified business mutations are intentionally disabled server-side. The backend's unrelated legacy routes need a separate compatibility/security review.

## Verification scope

Build, proxy regression and isolated backend HTTP tests are required. Live login/logout and authenticated reads must be tested after deployment without changing balances, inventory, provider settings or transactions. A successful build alone is not a complete admin-panel acceptance test.
