# ── Build stage ──────────────────────────────────────────────────────────────
FROM golang:1.25 AS build
WORKDIR /src

# Cache module downloads.
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Static binary so it runs on a distroless/scratch base. Cloud Run is linux/amd64.
ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64
RUN go build -ldflags="-s -w" -o /out/server ./cmd/server

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM gcr.io/distroless/static:nonroot
WORKDIR /
COPY --from=build /out/server /server

# Cloud Run injects $PORT (default 8080). The server reads it from config.
ENV PORT=8080
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/server"]
