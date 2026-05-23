# Statvio Backend — Go Rewrite & Stripe Migration Plan

**Status:** Phases 1–8 implemented in [`../backend-go/`](../backend-go/); Phases 9–10 (deploy + cutover) ready to run — see [`../backend-go/DEPLOY.md`](../backend-go/DEPLOY.md)
**Author:** Joshua Watkins
**Date:** 2026-05-23

> **Implementation note:** The Go service builds, vets, and is gofmt-clean. It is
> read/write compatible with the existing Atlas DB and accepts the same JWTs, so
> it can run alongside the Node service during cutover. Deviations from this spec:
> the official `mongo-driver` v1 is used instead of v2 (API stability), and the
> Stripe webhook records subscription status but not `currentPeriodEnd` (the field
> moved to subscription items in recent Stripe API versions — add later if needed).

---

## 1. Goal

Rewrite the existing Node/Express backend in **Go**, achieving full feature parity with the
current API, while making two deliberate changes along the way:

1. **Rip out PayPal entirely** and replace it with **Stripe** (recurring subscription billing).
2. **Deploy to Google Cloud Run** instead of EC2 (cheaper, scale-to-zero, no VM to babysit).

MongoDB stays on **Atlas** and file storage stays on **S3** — neither is on the box being
replaced, so neither has to move. The only thing being rebuilt is the compute layer + the
payment integration.

### Locked decisions

| Decision | Choice |
|---|---|
| Billing model | **Recurring subscription** (Stripe Checkout `subscription` mode + webhook) |
| Go HTTP framework | **Gin** |
| SoundCloud / Apple Music stubs | **Port as-is** (keep placeholder structure for future parity) |
| Deploy target | **Google Cloud Run** |

---

## 2. Current-state inventory (what we must preserve)

The Node backend is a single Express service. Below is the complete API surface and behaviour
that the Go version must reproduce **byte-for-byte at the JSON/HTTP contract level** (the React
frontend at `statvio.com` depends on these exact shapes).

### 2.1 Route map

All routes are mounted under `/api`. Auth = requires valid JWT (`authenticateToken`).

| Method | Path | Auth | Rate limit | Handler / behaviour |
|---|---|---|---|---|
| POST | `/api/auth/signup` | – | authLimiter (5 / 10min) | Create user, validates username/email/password |
| POST | `/api/auth/login` | – | authLimiter | Verify credentials, set httpOnly JWT cookie + return `{token, userId}` |
| POST | `/api/auth/logout` | ✓ | – | Clear cookie, set `lastLogout` |
| GET | `/api/auth/verify` | ✓ | verifyLimiter (10 / 10min) | Return `{isValid, user}` |
| GET | `/api/auth/dashboard` | ✓ | – | Return dashboard payload **(BUG — see §7)** |
| GET | `/api/auth/user` | ✓ | – | Return full user doc (minus password) |
| GET | `/api/auth/api-info` | ✓ | – | Return `{apiCount, apisLinked}` |
| PUT | `/api/auth/update-username` | ✓ | – | Change username (uniqueness checked) |
| PUT | `/api/auth/update-email` | ✓ | – | Change email (uniqueness checked) |
| PUT | `/api/auth/update-password` | ✓ | – | Change password (bcrypt re-hash) |
| PUT | `/api/auth/update-tutorial-status` | ✓ | – | Toggle `tutorialComplete` |
| GET | `/api/music/spotify/callback` | – | – | OAuth callback, exchanges code, stores tokens, redirects to frontend |
| GET | `/api/music/spotify/auth` | ✓ | – | Redirect to Spotify authorize URL (JWT passed as `state`) |
| GET | `/api/music/spotify/overview` | ✓ | – | Aggregated profile+playlists+top+history (cached 5 min) |
| GET | `/api/music/spotify/top-songs` | ✓ | – | `?time_range=` top tracks |
| GET | `/api/music/spotify/top-artists` | ✓ | – | `?time_range=` top artists |
| GET | `/api/music/spotify/listening-history` | ✓ | – | Recently played |
| GET | `/api/music/spotify/playlists` | ✓ | – | User playlists |
| GET | `/api/music/spotify/status` | ✓ | – | `{linked}`; lazily adds "Spotify" to `apisLinked` |
| GET | `/api/music/spotify/recommend-playlist-songs` | ✓ | – | `?playlist_id=` → OpenAI 6-song recommendation |
| GET | `/api/music/spotify/analyse-playlist-stats` | ✓ | – | `?playlist_id=` → OpenAI stat summary |
| POST | `/api/music/spotify/unlink` | ✓ | – | Clear Spotify tokens + `apisLinked` |
| POST | `/api/ai/generate-response` | ✓ | – | Generic OpenAI passthrough (`{input}`) |
| POST | `/api/aws/upload` | ✓ | – | `multipart profileImage` → S3, replaces old, updates user |
| GET | `/api/paypal/pay` | ✓ | – | **→ REPLACE with Stripe checkout** |
| GET | `/api/paypal/complete-order` | ✓ | – | **→ REPLACE (webhook-driven)** |
| GET | `/api/paypal/cancel-order` | ✓ | – | **→ REPLACE** |
| — | SoundCloud routes | – | – | Commented-out stubs (port as placeholder) |

Global middleware order (must be preserved): `helmet` → CORS (allowlist) → OPTIONS preflight
handler → `trust proxy` → JSON/cookie/urlencoded body parsing → `globalLimiter` → routes →
error handler. `ipBan` and `botFilter` exist but are **currently commented out** — port them in
the same disabled state.

### 2.2 Data model (MongoDB `users` collection)

Single `User` document. Field names below are exactly what's stored in Atlas today and must be
matched by Go `bson` tags (Mongoose also writes `createdAt`, `updatedAt`, `__v`).

- `username` (unique, regex `^\w{4,}$`)
- `email` (unique, email regex)
- `password` (bcrypt hash, `$2...`)
- `role` (`user` | `admin`, default `user`)
- `tutorialComplete` (bool)
- `profileImageUrl` (default gravatar mp), `profileImageKey` (S3 key)
- `lastLogin`, `lastLogout` (dates)
- `apisLinked` (`[]string`), `apiCount` (int)
- `spotify` { linked, spotifyId, displayName, email, profileImageUrl, accessToken, refreshToken, tokenExpiresAt, lastSyncedAt }
- `soundcloud` { same shape as spotify } — present but unused
- `timestamps` (createdAt / updatedAt)

> **New for Stripe (§5):** a `subscription` sub-document will be added.

### 2.3 External integrations

| Integration | What it does | Auth style |
|---|---|---|
| **Spotify Web API** | OAuth2 auth-code flow, token refresh, fetch profile/playlists/top/history, 429 retry, 5-min in-memory cache | Per-user access/refresh tokens stored on user |
| **OpenAI** (`gpt-4o-mini`) | 3 prompts: generic, 6-song recommendation, playlist stat analysis | Server API key |
| **AWS S3** | Profile image upload (memory → S3, 5 MB, jpg/png), delete old | IAM access key/secret |
| **PayPal** (Orders v2) | One-time $1 AUD "Test Payment" redirect flow | client_credentials | **→ being removed** |

### 2.4 Auth mechanics (must stay identical so frontend is untouched)

- **JWT**: HS256, payload `{id}`, **1h** expiry, signed with `JWT_SECRET`.
- Token accepted from **`Authorization: Bearer`** header **or** `?token=` query param (Spotify
  OAuth uses the query form via `state`).
- **Cookie**: `token`, httpOnly, `secure` in prod, `sameSite=strict`, 1h maxAge.
- **Password**: bcrypt, cost 10. Go's `golang.org/x/crypto/bcrypt` is wire-compatible with the
  existing `$2` hashes → **no password migration / no forced reset.**

---

## 3. Target Go architecture

### 3.1 Stack & library mapping

| Concern | Node (current) | Go (target) |
|---|---|---|
| HTTP framework | express | **gin-gonic/gin** |
| Mongo driver | mongoose | **go.mongodb.org/mongo-driver/v2** + thin repository layer |
| Password hashing | bcryptjs | **golang.org/x/crypto/bcrypt** (compatible) |
| JWT | jsonwebtoken | **golang-jwt/jwt/v5** |
| CORS | cors | **gin-contrib/cors** |
| Security headers | helmet | **gin-contrib/secure** (or manual header middleware) |
| Rate limiting | express-rate-limit | **didip/tollbooth** (or custom token bucket) — in-memory, per-IP |
| Cookies / body parsing | cookie-parser, express.json | gin built-ins (`c.Cookie`, `c.ShouldBindJSON`) |
| Env config | dotenv | **joho/godotenv** + typed `config` struct |
| File upload | multer + multer-s3 | gin `c.FormFile` + **aws-sdk-go-v2** `manager.Uploader` |
| S3 | @aws-sdk/client-s3 | **aws-sdk-go-v2/service/s3** |
| In-memory cache | node-cache | **patrickmn/go-cache** |
| OpenAI | openai | **sashabaranov/go-openai** |
| Payments | paypal-rest-sdk | **stripe/stripe-go/v81** |
| HTTP client (Spotify) | axios | stdlib `net/http` + small wrapper |
| UUID | uuid | **google/uuid** |
| Validation | manual / regex | **go-playground/validator/v10** + regex parity |
| Logging | winston + daily-rotate-file | **log/slog** → stdout JSON (Cloud Run captures it; file rotation dropped — see §7) |

### 3.2 Project layout

```
backend-go/
  cmd/server/main.go              # entrypoint: load config, build router, listen on $PORT
  internal/
    config/config.go              # typed env config + validation at boot
    db/mongo.go                    # Atlas connection, indexes
    db/user_repo.go                # all user queries (find, create, update)
    auth/jwt.go  auth/password.go  # token sign/verify, bcrypt helpers
    models/user.go                 # User struct with bson tags matching Atlas
    middleware/                    # auth, cors, ratelimit, security, recover, ipban(stub), botfilter(stub)
    handlers/
      user.go  spotify.go  ai.go  aws.go  stripe.go  health.go
    services/
      spotify/auth.go  spotify/client.go    # OAuth + Web API client + retry + cache
      openai/client.go                      # 3 prompt methods
      storage/s3.go                         # upload/delete
      payments/stripe.go                     # checkout session + webhook handling
      soundcloud/  applemusic/               # ported stubs (placeholder)
    server/router.go                # route registration mirroring §2.1
  Dockerfile
  .env.example
  go.mod / go.sum
```

This keeps a 1:1 mental map with the current `controllers/`, `services/`, `middleware/`,
`config/` structure so the port is mechanical, not a redesign.

---

## 4. Data & auth compatibility (de-risking the cutover)

These are the things that let the Go service talk to the **same database** the Node service
uses, so we can run both side-by-side during cutover:

- **Collection name:** Mongoose `model("User")` → collection **`users`**. Go repo must target
  `users`.
- **`_id`:** `primitive.ObjectID`; expose as hex string in JSON (`id` field) to match current
  responses.
- **bson tags:** every struct field tagged to the exact stored key (`tutorialComplete`,
  `profileImageUrl`, `apisLinked`, nested `spotify.*`, `createdAt`, `updatedAt`). Include
  `__v` (or configure the driver to ignore it) so writes don't drop it.
- **Passwords:** bcrypt-compatible — existing users log in unchanged.
- **JWT secret:** reuse the **same `JWT_SECRET`** → tokens issued by Node remain valid under Go
  and vice-versa during the overlap window.
- **Validation parity:** reproduce the exact regexes (username `^\w{4,}$`, password
  complexity, email) and the length checks (username 4–20, email 5–45, password 8–40) so error
  messages and rejection behaviour match.

---

## 5. Stripe migration (replacing PayPal)

### 5.1 What changes conceptually

The current PayPal flow is a **client-redirect-driven one-time charge** with **no record of
payment anywhere** — nothing is written back to the user when payment succeeds. We're replacing
it with a **recurring subscription** that is **fulfilled server-side via webhook**, which also
fixes that gap.

### 5.2 New/changed endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/stripe/create-checkout-session` | ✓ | Create a Stripe Checkout Session in `subscription` mode for the configured Price; return `{url}` (or 302 redirect to keep the old `/pay` ergonomics) |
| GET | `/api/stripe/verify` | ✓ | Optional: confirm a `session_id`'s status for the success page |
| POST | `/api/stripe/webhook` | – (signature-verified) | Source of truth: handle `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` and update the user's subscription state |
| — | cancel | – | Cancel just routes the user back in the frontend; no backend capture needed |

The old `/api/paypal/*` routes are deleted.

### 5.3 User model addition

```
subscription: {
  status            // none | active | past_due | canceled
  stripeCustomerId
  stripeSubscriptionId
  priceId
  currentPeriodEnd  // date
  updatedAt
}
```

A user is mapped to a Stripe **Customer** on first checkout (store `stripeCustomerId`). The
webhook flips `status`/`currentPeriodEnd`. Add a small helper + middleware (`requireActiveSub`)
for any routes you later want to gate behind a paid plan.

### 5.4 Webhook handling specifics (important)

- The webhook route must read the **raw request body** (Stripe signature is computed over raw
  bytes) — register it **before** any JSON body-binding middleware, and verify with
  `STRIPE_WEBHOOK_SECRET`.
- Make handlers **idempotent** (Stripe retries; key off event ID / subscription ID).
- Cloud Run scale-to-zero is fine for webhooks — the request itself wakes an instance.

### 5.5 Frontend changes required (small)

- `frontend/vite.config.js`: the injected `__PAYPAL_BASE_URL__` / `__PAYPAL_COMPLETE_ORDER_URL__`
  defines become `__STRIPE_*__` (plus a `STRIPE_PUBLISHABLE_KEY` if we ever move to embedded
  Elements; not needed for hosted Checkout).
- `pages/user/Subscribe.jsx`: instead of `window.location = .../pay`, call
  `create-checkout-session` and redirect to the returned Checkout URL.
- `pages/paypal/SuccessPage.jsx` → rename to a Stripe success page: it no longer needs to
  "capture" anything (the webhook does fulfilment); it just confirms via `/verify` or shows
  success and redirects to `/dashboard`.
- `App.jsx` routes `/complete-order` & `/cancel-order` → Stripe success/cancel routes.

### 5.6 New environment variables

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`, `STRIPE_SUCCESS_URL`,
`STRIPE_CANCEL_URL`. Remove all `PAYPAL_*`.

---

## 6. Feature-by-feature port checklist

Each item = port to Go at full parity (same routes, same JSON, same status codes).

- [ ] **Config + boot** — typed env load, fail-fast on missing required vars, Mongo connect.
- [ ] **Logging** — slog structured logger to stdout (replaces winston; see §7 re: files).
- [ ] **User model + repository** — bson-tagged struct, CRUD against `users`.
- [ ] **Auth core** — JWT sign/verify (header + query), bcrypt, cookie issuance identical.
- [ ] **Auth middleware** — `authenticateToken` equivalent populating request user id.
- [ ] **Security middleware** — helmet→secure headers, CORS allowlist (`statvio.com`,
      `www.statvio.com`, the Vercel preview), credentials + custom no-origin logic, OPTIONS handler.
- [ ] **Rate limiters** — global (100/15m, skip login/signup/verify + OPTIONS), auth (5/10m),
      verify (10/10m). 429 JSON message parity.
- [ ] **Error handler** — central recovery middleware reproducing: duplicate-key (Mongo 11000)
      → 400, validation → 400, unauthorized → 401, generic → 500 with the same messages.
- [ ] **User endpoints** — all 11 routes from §2.1 incl. uniqueness checks & messages.
      Fix the `dashboard` bug (§7).
- [ ] **Spotify** — auth URL build, code exchange, refresh-on-expiry, unlink; client methods
      (profile, playlists, specific playlist, top songs/artists, history, overview) with 429
      retry (3×, 2s) and 5-min cache on overview. Preserve mapped JSON field names exactly.
- [ ] **OpenAI** — 3 methods (generic, recommend 6 songs, stat analysis) with the **same system
      prompts, model `gpt-4o-mini`, token/temperature/penalty settings**.
- [ ] **S3 upload** — multipart `profileImage`, 5 MB limit, jpg/jpeg/png filter, UUID key
      `{userId}-{uuid}.{ext}`, delete previous, update user, return `{imageUrl}`.
- [ ] **Stripe** — §5 in full (replaces PayPal).
- [ ] **SoundCloud / Apple Music** — port as placeholder packages + commented route block.
- [ ] **Health check** — add `GET /healthz` for Cloud Run.

---

## 7. Pre-existing bugs & gaps (fix or consciously carry)

Found during the audit — flagging so they're decisions, not surprises:

1. **`getUserDashboard` is broken.** It references an undefined `requestId`, which throws a
   `ReferenceError` at runtime. → **Fix** in the Go port (drop or properly thread the value).
2. **Payment was never persisted.** PayPal success wrote nothing back to the user. The Stripe
   webhook design (§5.4) fixes this.
3. **No payment webhook today** — fulfilment relied on the browser hitting `complete-order`,
   which is abandonable/replayable. Stripe webhook fixes this.
4. **In-memory state won't survive multi-instance.** Rate limiter, Spotify cache, and the
   (disabled) ipBan all use process memory. On Cloud Run with >1 instance these are per-instance.
   → Acceptable at launch with `--max-instances=1`; note Redis/MemoryStore as the future fix if
   you scale out.
5. **Disk logging is pointless on Cloud Run** (ephemeral filesystem). → Drop
   winston-daily-rotate-file; log JSON to stdout and read it in Cloud Logging.
6. **`SPOTIFY_REDIRECT_URI` / callback URL** must be updated to the new Cloud Run domain in both
   the env and the Spotify developer dashboard.

---

## 8. Deployment — Google Cloud Run

Go's single static binary + tiny container is close to an ideal Cloud Run workload (sub-second
cold starts, scale-to-zero ≈ free at low traffic).

### 8.1 Container

- Multi-stage Dockerfile: `golang:1.2x` build stage → `gcr.io/distroless/static` (or `scratch`)
  final image. Resulting image is a few MB.
- Listen on **`$PORT`** (Cloud Run injects it, default 8080). The current code already reads
  `process.env.PORT` — mirror that.
- Bind `0.0.0.0`.

### 8.2 Services & wiring

- **Artifact Registry** for the image; build with `gcloud builds submit` (or `gcloud run deploy
  --source .` to skip a manual build).
- **Secret Manager** for all secrets (`JWT_SECRET`, `MONGO_URI`, AWS keys, `OPENAI_API_KEY`,
  Spotify creds, Stripe keys); mount as env vars on the service.
- **MongoDB Atlas access:** Cloud Run egresses from a broad IP range, so either allowlist
  `0.0.0.0/0` on the Atlas cluster (simplest, rely on SCRAM auth) or set up a VPC connector +
  static egress IP for a tighter allowlist.
- **Allow unauthenticated** invocations (it's a public API; your own JWT layer guards it).
- **`--min-instances=0`** for cost (or `1` if you want to kill cold starts on a live product),
  **`--max-instances=1`** initially (see §7.4).
- **Stripe webhook:** register the deployed Cloud Run URL `/api/stripe/webhook` in the Stripe
  dashboard; put `STRIPE_WEBHOOK_SECRET` in Secret Manager.
- **CORS / redirect URLs / Spotify callback:** update to the Cloud Run domain (or a custom
  domain mapped to the service).

### 8.3 Frontend pointer

The Vercel frontend's API base URL (and the new Stripe defines) point at the Cloud Run URL.
Keep EC2 running until the frontend is switched and Stripe is verified, then decommission.

---

## 9. Phased roadmap

### 9.0 Overview & dependencies

| Phase | Deliverable | Depends on |
|---|---|---|
| **0. Decisions** | This doc approved | — |
| **1. Scaffold** | go.mod, config, logging, Mongo, User model+repo, auth core, Dockerfile | 0 |
| **2. Auth/User** | All 11 auth routes at parity (dashboard bug fixed) | 1 |
| **3. Middleware** | CORS, rate limits, security headers, error handler, stubs | 1 |
| **4. Spotify** | Full OAuth + client + cache + retry | 2, 3, **5** |
| **5. OpenAI** | 3 prompt methods | 1 |
| **6. S3 upload** | Profile image upload/replace | 2, 3 |
| **7. Stripe** | Checkout + webhook + subscription state on user | 2, 3 |
| **8. Frontend wiring** | Stripe pages + vite defines + API base URL | 7 |
| **9. Deploy** | Cloud Run service + secrets + webhook registered | 1–7 |
| **10. Cutover** | Point frontend at Cloud Run, verify, decommission EC2 | 8, 9 |

**Parallelism:** Phases 4, 6, 7 are independent of each other and can be built in any order once
2+3 land. Phase 5 (OpenAI) is a dependency of two Spotify endpoints (`recommend-playlist-songs`,
`analyse-playlist-stats`), so do 5 before/with 4. Phases 1–6 are **pure parity** and validate
against **live Atlas data** without touching production traffic (read/write compatible). Phases
7–10 change behaviour and warrant the most testing.

**Cross-cutting (do continuously):** before porting each endpoint, capture the current Node JSON
response as a fixture, then diff the Go output against it (§10 "contract drift").

### 9.1 Phase 1 — Scaffold & foundations
- [ ] `go mod init` (module path, Go 1.2x); add deps: gin, mongo-driver/v2, golang-jwt/v5, x/crypto, godotenv, go-cache, validator/v10, google/uuid
- [ ] `config` package: typed struct, load via godotenv, **fail-fast** on missing required keys at boot
- [ ] `slog` JSON logger → stdout; level from `NODE_ENV`/`ENV`
- [ ] `db/mongo.go`: Atlas connect + ping + context timeouts + graceful disconnect
- [ ] Ensure unique indexes on `username` and `email` (match Mongoose constraints)
- [ ] `models/user.go`: struct with **exact bson tags** incl. nested `spotify`/`soundcloud`, `createdAt`/`updatedAt`, `__v` handling
- [ ] `db/user_repo.go`: `FindByID`, `FindByUsernameOrEmail`, `FindByUsername`, `FindByEmail`, `Create`, `Update`
- [ ] `auth/password.go`: `Hash`, `Compare` (bcrypt cost 10)
- [ ] `auth/jwt.go`: `Sign(userID)` HS256 1h, `Verify` → claims
- [ ] `cmd/server/main.go`: wire config→logger→db→router→`http.Server` on `$PORT`, graceful shutdown
- [ ] `GET /healthz`; multi-stage Dockerfile (distroless); `.env.example`
- **DoD:** builds, boots, connects to a **dev** Atlas DB, `/healthz` returns 200.

### 9.2 Phase 2 — Auth / User endpoints
- [ ] `authenticateToken` middleware (token from header **or** `?token=`, verify, set user id in context)
- [ ] `registerUser` — length checks (4–20 / 5–45 / 8–40) + regexes + uniqueness → 201
- [ ] `loginUser` — authenticate, set httpOnly cookie, update `lastLogin`, return `{token, userId}`
- [ ] `logoutUser` — clear cookie, set `lastLogout`
- [ ] `verifyAuth` → `{isValid, user}`
- [ ] `getUserDashboard` — **fix the `requestId` bug** (§7.1)
- [ ] `getUser`, `getApiInfo`
- [ ] `updateUsername`, `updateEmail`, `updatePassword`, `updateTutorialStatus`
- [ ] Match every status code + JSON message string
- **DoD:** existing Node-issued JWT works; frontend login/profile flows pass against Go.

### 9.3 Phase 3 — Middleware & cross-cutting
- [ ] CORS allowlist (`statvio.com`, `www.statvio.com`, Vercel preview) + credentials + custom no-origin logic + OPTIONS preflight handler
- [ ] Security headers (helmet equivalent)
- [ ] Trusted-proxy config (gin) so client IP is correct behind Cloud Run
- [ ] Rate limiters: global (100/15m, skip login/signup/verify + OPTIONS), auth (5/10m), verify (10/10m), 429 JSON parity
- [ ] Central recovery/error middleware: dup-key (11000)→400, validation→400, unauthorized→401, generic→500 (same messages)
- [ ] Port `ipBan` + `botFilter` **in disabled state** (flagged off, as today)
- **DoD:** middleware execution order mirrors the Node chain exactly.

### 9.4 Phase 4 — Spotify
- [ ] `spotify/auth.go`: `getAuthorisationUrl(scopes)`, `getAccessTokenFromCode`, `refreshAccessToken`, `unlinkUser`
- [ ] `spotify/client.go`: bearer HTTP client; methods `profile`, `playlists`, `specificPlaylist`, `topSongs`, `topArtists`, `history`, `overview` — **exact mapped field names**
- [ ] 429 retry (3×, 2s backoff); go-cache 5-min on `overview` keyed by token
- [ ] `refreshSpotifySession` (expiry check + persist refreshed tokens)
- [ ] Handlers: `callback` (verify `state` JWT, store tokens, redirect to `FRONTEND_SPOTIFY_URL`), `auth` redirect, all GETs, `status` (lazy `apisLinked`), `unlink`
- **DoD:** full OAuth round-trip + token refresh + cached overview verified end-to-end.

### 9.5 Phase 5 — OpenAI
- [ ] `openai/client.go`: 3 methods (`generic`, `recommend6Songs`, `statAnalysis`) — identical system prompts, model `gpt-4o-mini`, temperature/penalty/token settings
- [ ] `ai` handler: `POST /api/ai/generate-response`; expose recommend/analysis for Spotify to call
- **DoD:** outputs match the current format/shape.

### 9.6 Phase 6 — S3 upload
- [ ] `storage/s3.go`: `uploadToS3` (key `{userId}-{uuid}.{ext}`), `deleteFromS3`; aws-sdk-go-v2 with static creds
- [ ] Handler: multipart `profileImage`, 5 MB limit, jpg/jpeg/png filter, delete old, update user, return `{imageUrl}`
- **DoD:** upload + replace-old works against the existing bucket.

### 9.7 Phase 7 — Stripe (replaces PayPal)
- [ ] `payments/stripe.go`: init with `STRIPE_SECRET_KEY`
- [ ] `POST /api/stripe/create-checkout-session`: ensure/create Customer (store `stripeCustomerId`), `subscription`-mode session for `STRIPE_PRICE_ID`, success/cancel URLs, return `{url}`
- [ ] `POST /api/stripe/webhook`: **raw-body** route, signature verify, handle `checkout.session.completed` / `customer.subscription.updated` / `customer.subscription.deleted` / `invoice.payment_failed`, **idempotent**
- [ ] Add `subscription` sub-doc to user model + repo update methods
- [ ] `GET /api/stripe/verify` (optional, for success page); `requireActiveSub` middleware for future gating
- [ ] **Delete** all PayPal code, config, and `PAYPAL_*` env
- **DoD:** Stripe **test-mode** subscription completes and the webhook flips the user's `subscription.status` to `active`.

### 9.8 Phase 8 — Frontend wiring
- [ ] `vite.config.js`: rename `__PAYPAL_*__` defines → `__STRIPE_*__`; add API base URL
- [ ] `Subscribe.jsx`: call `create-checkout-session`, redirect to returned URL
- [ ] Rename/replace the PayPal success page → Stripe success (no capture; verify or just confirm + redirect to `/dashboard`)
- [ ] `App.jsx`: update `/complete-order` & `/cancel-order` routes; remove PayPal pages
- **DoD:** full subscribe flow works end-to-end in Stripe test mode from the UI.

### 9.9 Phase 9 — Deploy to Cloud Run
- [ ] GCP project + enable APIs: run, artifactregistry, secretmanager, cloudbuild
- [ ] Create Artifact Registry repo
- [ ] Create all secrets in Secret Manager (JWT, MONGO_URI, AWS, OpenAI, Spotify, Stripe)
- [ ] Build & deploy (`gcloud run deploy --source .`): region, `--allow-unauthenticated`, `--min-instances=0/1`, `--max-instances=1`, env from secrets
- [ ] Atlas network access: allowlist `0.0.0.0/0` **or** VPC connector + static egress IP *(decision pending)*
- [ ] Map custom domain (e.g. `api.statvio.com`) or use the `run.app` URL
- [ ] Update **Spotify dashboard** redirect URI to the new domain
- [ ] Register **Stripe webhook** endpoint + store `STRIPE_WEBHOOK_SECRET`
- [ ] Update CORS allowlist + Spotify callback/redirect URLs to the new domain
- **DoD:** staging service serves traffic; webhook receives a live test event.

### 9.10 Phase 10 — Cutover & decommission
- [ ] Point frontend **prod** env at Cloud Run
- [ ] Smoke-test all flows in prod: auth, Spotify OAuth, image upload, subscribe
- [ ] Monitor Cloud Logging / errors for a soak window
- [ ] Switch Stripe to **live mode** (live keys + live webhook)
- [ ] Back up / snapshot EC2, then stop instance, release Elastic IP, clean up
- **DoD:** EC2 is off, all production flows green on Cloud Run.

---

## 10. Risks & gotchas

- **JSON contract drift** — the frontend is coupled to exact field names (`topSongs`,
  `track_url`, `linked`, `apisLinked`, etc.). Snapshot current responses and diff against the Go
  output per endpoint.
- **bson tag mismatches** — a wrong/missing tag silently nulls a field. Verify against a real
  document dump.
- **Spotify `state` round-trip** — the JWT is passed through Spotify as `state`; the Go callback
  must verify it with the same secret and redirect to `FRONTEND_SPOTIFY_URL`.
- **Stripe raw-body requirement** — webhook signature fails if any middleware reads/transforms
  the body first. Wire that route specially.
- **Cookie `sameSite=strict` + cross-site** — confirm the cookie still behaves with the
  frontend on `statvio.com` and API on a Cloud Run / custom domain; may need `sameSite=none;
  secure` if they end up cross-site.
- **In-memory limiters under scale** — keep `--max-instances=1` until externalised.

---

## 11. Out of scope (explicitly not doing now)

- Actually **implementing** SoundCloud / Apple Music (porting empty stubs only).
- Migrating MongoDB or S3 (they stay put).
- Redis/MemoryStore for shared cache + rate limiting (future, only if scaling past 1 instance).
- Embedded Stripe Elements UI (using hosted Checkout for now).
- Email/notifications, admin tooling, tests beyond contract verification (can be a follow-up).
```