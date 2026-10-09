# SourceLock

SourceLock is a GenLayer app for source-backed public commitments. A claimant bonds a URL and a precise commitment, the Intelligent Contract snapshots and hashes the page, and later reviews/challenges use validator consensus to decide whether the source materially drifted.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

The verified production build uses webpack:

```bash
npx next build --webpack
```

The default Turbopack build path hit an internal PostCSS panic in this local environment, so `vercel.json` pins the deployment build to webpack.

## Contract

`contracts/SourceLock.py` exposes:

```text
lock_source(...)
review_source(...)
open_challenge(...)
resolve_challenge(...)
retire_source(...)
get_registry()
list_sources(...)
list_reviews(...)
list_challenges(...)
get_source(...)
```

Configure after deployment:

```bash
NEXT_PUBLIC_SOURCELOCK_CONTRACT=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_GENLAYER_ENDPOINT=https://studio.genlayer.com/api
```

Deploy the contract:

```bash
python scripts/deploy-sourcelock.py
```
