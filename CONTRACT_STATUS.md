# SourceLock Contract Status

## Implemented

- `contracts/SourceLock.py` is a GenLayer Intelligent Contract for source-backed public commitments.
- `lock_source` snapshots a URL with `gl.nondet.web.get`, hashes the body, stores a baseline excerpt, and escrows a claimant bond.
- `review_source` re-fetches the same URL and uses validator consensus to classify the current page as `STABLE`, `MATERIAL_CHANGE`, or `INCONCLUSIVE`.
- `open_challenge` records bonded counter-evidence and moves the source into `CHALLENGED`.
- `resolve_challenge` uses consensus over the baseline, latest source, and counter-evidence, then pays the claimant or challenger according to the result.
- The frontend reads `get_registry`, `list_sources`, `list_reviews`, and `list_challenges` through `genlayer-js` and writes through a connected wallet on StudioNet.

## Local Verification

```bash
npm run lint
npx next build --webpack
python -m pytest tests/direct -q
```

## Deployment

Set the deployed address in Vercel and local `.env.local`:

```bash
NEXT_PUBLIC_SOURCELOCK_CONTRACT=0x...
NEXT_PUBLIC_GENLAYER_ENDPOINT=https://studio.genlayer.com/api
```
