# SourceLock

SourceLock is a dashboard prototype for source-backed public commitments. It watches important web pages, snapshots meaningful changes, queues materiality reviews, and surfaces a live evidence ledger for claims that should not quietly drift.

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
