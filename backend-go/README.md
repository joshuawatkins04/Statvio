# Statvio Backend (Go)

Go rewrite of the Node/Express backend, with PayPal replaced by Stripe
(recurring subscriptions) and a container built for Google Cloud Run. See
[`../docs/backend-go-migration-plan.md`](../docs/backend-go-migration-plan.md)
for the full design and rationale.

## Stack

- **HTTP:** Gin
- **DB:** MongoDB (official driver) — same Atlas `users` collection as the Node app
- **Auth:** JWT (HS256, header or `?token=`) + bcrypt (compatible with existing hashes)
- **Integrations:** Spotify Web API, OpenAI (`gpt-4o-mini`), AWS S3, Stripe
- **Logging:** `log/slog` JSON to stdout

## Layout

```
cmd/server/          entrypoint (config → db → router → graceful shutdown)
internal/
  config/            typed env config, fail-fast validation
  logging/           slog setup
  db/                Mongo connection + indexes
  models/            User + PlaylistTrack (bson tags match the Mongoose schema)
  repository/        user data access
  auth/              jwt + password (bcrypt)
  middleware/        auth, cors, security headers, rate limit, error handler, disabled bot/ip filters
  server/            router + handlers (handlers_*.go) + route registration (register_*.go)
  services/
    openai/          3 prompt flows
    spotify/         OAuth + Web API client (retry + 5-min cache)
    storage/         S3 upload/delete
    stripe/          Checkout (subscription) + webhook verification
```

## Run locally

```bash
cp .env.example .env       # fill in values (use the SAME JWT_SECRET as the Node app)
go run ./cmd/server
```

The server listens on `$PORT` (default 5000) and exposes `GET /healthz`.

Required to boot: `MONGO_URI`, `JWT_SECRET`. Other integration keys are validated
lazily (the relevant feature errors at call time if its key is missing), so you can
run the service for the parts you've configured.

## Build / verify

```bash
go build ./...
go vet ./...
go test ./...         # unit tests: auth, validation, middleware, parsers, services
gofmt -l .            # should print nothing
docker build -t statvio-backend .
```

Tests cover the deployment-independent logic: JWT sign/verify, bcrypt, the
username/email/password validators, the auth/CORS/rate-limit/security middleware
(via `httptest`), the Mongo URI parser, and the Spotify/OpenAI helpers. Handler
flows that touch MongoDB/Stripe/S3/Spotify are verified during staging (DEPLOY.md).

## API surface

Identical to the Node service except payments. All routes are under `/api`:

- `/api/auth/*` — signup, login, logout, verify, dashboard, user, api-info, update-*
- `/api/music/spotify/*` — OAuth + data endpoints (SoundCloud routes ported as stubs)
- `/api/ai/generate-response`
- `/api/aws/upload`
- `/api/stripe/create-checkout-session`, `/api/stripe/verify`, `/api/stripe/webhook` *(replaces `/api/paypal/*`)*

## Deployment

See [`DEPLOY.md`](./DEPLOY.md) for the Cloud Run deploy + cutover runbook.
