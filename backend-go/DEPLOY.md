# Deploy & Cutover Runbook — Google Cloud Run

This is the Phase 9/10 runbook for the migration plan. The code is build-ready;
these are the steps **you** run (they need your GCP, Stripe, Spotify and Atlas
accounts). Commands assume the `gcloud` CLI is installed and you're in
`backend-go/`.

Set these once for the session:

```bash
export PROJECT_ID=statvio              # your GCP project id
export REGION=australia-southeast1     # Sydney; closest to your users
export SERVICE=statvio-backend
gcloud config set project $PROJECT_ID
```

---

## 1. One-time GCP setup

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  cloudbuild.googleapis.com
```

## 2. Create secrets

Store every secret in Secret Manager (never bake them into the image). Reuse the
**same `JWT_SECRET`** the Node service uses so existing logins keep working.

```bash
# Pipe each value in without it landing in shell history where possible.
printf '%s' 'mongodb+srv://...'            | gcloud secrets create MONGO_URI            --data-file=-
printf '%s' 'the-same-secret-as-node'      | gcloud secrets create JWT_SECRET           --data-file=-
printf '%s' 'AKIA...'                      | gcloud secrets create AWS_ACCESS_KEY_ID    --data-file=-
printf '%s' '...'                          | gcloud secrets create AWS_SECRET_ACCESS_KEY --data-file=-
printf '%s' 'sk-...'                       | gcloud secrets create OPENAI_API_KEY       --data-file=-
printf '%s' '...'                          | gcloud secrets create SPOTIFY_CLIENT_ID    --data-file=-
printf '%s' '...'                          | gcloud secrets create SPOTIFY_CLIENT_SECRET --data-file=-
printf '%s' 'sk_live_...'                  | gcloud secrets create STRIPE_SECRET_KEY    --data-file=-
printf '%s' 'whsec_...'                    | gcloud secrets create STRIPE_WEBHOOK_SECRET --data-file=-
printf '%s' 'price_...'                    | gcloud secrets create STRIPE_PRICE_ID      --data-file=-
```

> Update a secret later with: `printf '%s' 'newval' | gcloud secrets versions add NAME --data-file=-`

Grant the Cloud Run runtime service account read access (replace with your
project number's compute SA, or a dedicated SA):

```bash
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
SA="$PROJECT_NUMBER-compute@developer.gserviceaccount.com"
for S in MONGO_URI JWT_SECRET AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY OPENAI_API_KEY \
         SPOTIFY_CLIENT_ID SPOTIFY_CLIENT_SECRET STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET STRIPE_PRICE_ID; do
  gcloud secrets add-iam-policy-binding $S \
    --member="serviceAccount:$SA" --role="roles/secretmanager.secretAccessor"
done
```

## 3. Deploy

Non-secret config goes in `--set-env-vars`; secrets are mounted with
`--set-secrets`. `--source .` builds the Dockerfile via Cloud Build — no manual
push needed.

```bash
gcloud run deploy $SERVICE \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 1 \
  --set-env-vars "NODE_ENV=production,BASE_URL=https://api.statvio.com,ALLOWED_ORIGINS=https://www.statvio.com\,https://statvio.com,FRONTEND_SPOTIFY_URL=https://www.statvio.com/dashboard/music/spotify,AWS_REGION=ap-southeast-2,S3_BUCKET_NAME=your-bucket,SPOTIFY_REDIRECT_URI=https://api.statvio.com/api/music/spotify/callback,SPOTIFY_AUTH_URL=https://accounts.spotify.com,SPOTIFY_API_URL=https://api.spotify.com/v1,STRIPE_SUCCESS_URL=https://www.statvio.com/subscribe/success?session_id={CHECKOUT_SESSION_ID},STRIPE_CANCEL_URL=https://www.statvio.com/subscribe/cancel" \
  --set-secrets "MONGO_URI=MONGO_URI:latest,JWT_SECRET=JWT_SECRET:latest,AWS_ACCESS_KEY_ID=AWS_ACCESS_KEY_ID:latest,AWS_SECRET_ACCESS_KEY=AWS_SECRET_ACCESS_KEY:latest,OPENAI_API_KEY=OPENAI_API_KEY:latest,SPOTIFY_CLIENT_ID=SPOTIFY_CLIENT_ID:latest,SPOTIFY_CLIENT_SECRET=SPOTIFY_CLIENT_SECRET:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,STRIPE_PRICE_ID=STRIPE_PRICE_ID:latest"
```

Notes:
- Commas inside an env value (the `ALLOWED_ORIGINS` list) are escaped as `\,`.
- `--max-instances 1` keeps the in-memory rate limiter / Spotify cache correct
  (migration plan §7.4). Raise it only after externalising that state.
- Set `--min-instances 1` if you want to eliminate cold starts for a live product
  (small always-on cost).

Grab the service URL:

```bash
gcloud run services describe $SERVICE --region $REGION --format='value(status.url)'
```

Smoke test: `curl https://<service-url>/healthz` → `{"status":"ok"}`.

## 4. Atlas network access

Cloud Run egresses from a wide IP range. Either:
- **Simple:** Atlas → Network Access → add `0.0.0.0/0` (rely on SCRAM auth), or
- **Tighter:** create a Serverless VPC connector + Cloud NAT for a static egress
  IP and allow-list just that.

## 5. Custom domain

Map `api.statvio.com` to the service (the frontend `.env.production` already
points there):

```bash
gcloud beta run domain-mappings create --service $SERVICE --domain api.statvio.com --region $REGION
```

Add the DNS records it prints. Until DNS resolves, you can test against the
`run.app` URL.

## 6. Spotify dashboard

In the Spotify developer dashboard, add the redirect URI:
`https://api.statvio.com/api/music/spotify/callback`

## 7. Stripe setup

1. Create a **recurring Price** (Products → add product → recurring) and put its
   id in the `STRIPE_PRICE_ID` secret.
2. Add a webhook endpoint: `https://api.statvio.com/api/stripe/webhook`, subscribed
   to: `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.payment_failed`. Put its signing
   secret in `STRIPE_WEBHOOK_SECRET`.
3. Test locally with the Stripe CLI: `stripe listen --forward-to localhost:5000/api/stripe/webhook`.

## 8. Cutover

1. Deploy and verify staging against the `run.app` URL (auth, Spotify OAuth,
   image upload, subscribe in Stripe **test** mode).
2. Point the frontend prod env at Cloud Run (already `api.statvio.com`) and
   redeploy the Vercel frontend.
3. Smoke-test all flows in production.
4. Flip Stripe to **live** keys + live webhook secret (update the secrets, redeploy).
5. Monitor Cloud Logging for a soak period.
6. Snapshot, then decommission the EC2 instance and release its Elastic IP.

## Rollback

The Go service and the Node service are read/write compatible against the same
Atlas DB and accept the same JWTs. To roll back, just repoint the frontend at the
old EC2 URL — no data migration to undo.
