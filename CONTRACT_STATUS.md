# SourceLock Protocole Contract Status

## Implemented

- `contracts/SourceLock.py` is the SourceLock Protocole GenLayer Intelligent Contract for source-backed public commitments.
- `lock_source` snapshots a URL with `gl.nondet.web.get`, hashes the body, stores a baseline excerpt, and escrows a claimant bond.
- `review_source` re-fetches the same URL and uses validator consensus to classify the current page as `STABLE`, `MATERIAL_CHANGE`, or `INCONCLUSIVE`.
- `open_challenge` records bonded counter-evidence and moves the source into `CHALLENGED`.
- `resolve_challenge` uses consensus over the baseline, latest source, and counter-evidence, then pays the claimant or challenger according to the result.
- The frontend reads `get_registry`, `list_sources`, `list_reviews`, and `list_challenges` through `genlayer-js` and writes through a connected wallet on StudioNet.

## Local Verification

```bash
npm run lint
npx next build --webpack
genvm-lint check contracts/SourceLock.py --json
python -m pytest tests/direct -q
```

## Deployment

StudioNet:

```text
Contract: 0x5518987316f919396A7420CEf16b5c5ECC2ee1cE
Deploy tx: 0xe34e5866df23ed9c8bdd18684ae8c6616ff63e6dd7e134d7d304da1df45d8c80
Production app: https://sourcelock-protocole.vercel.app
```

## Live Verification

Live lifecycle run on StudioNet:

```text
LOCK_SOURCE_TX=0xb15bd179ca4dd56037972ab28218d8d53940824992ad0efd550d93a325dafd6b
REVIEW_SOURCE_TX=0xfa28530797a02dfcdf20bd5456d280f5022bd4b595ea1ca0bdb83167f707b453
REVIEW_STATUS=STABLE
REVIEW_SCORE=100
OPEN_CHALLENGE_TX=0x5274f9b0ba06fb1563a98c20f5886774132c7707c04ec09923267516559c2dac
RESOLVE_CHALLENGE_TX=0x8895933eaa9a5ad2775c194c763f101b19e1409b38bba6dcacf2a3b029ef1297
FINAL_SOURCE_STATUS=STABLE
FINAL_CHALLENGE_STATUS=REJECTED
SUMMARY={'bonds_paid': '1', 'challenged_sources': '0', 'changed_sources': '0', 'reviews_completed': '2', 'revoked_sources': '0', 'sources_locked': '2', 'stable_sources': '2', 'total_bonded': '3'}
```

Regression fixes added for the review:

- Claimants cannot open challenges against their own sources.
- Manual retirement is blocked until the source expiry has passed.
- Rejected and inconclusive challenges restore the source status that existed before the challenge.
- Bond payouts are accounted when challenges resolve and when expired sources retire.

Set the deployed address in Vercel and local `.env.local`:

```bash
NEXT_PUBLIC_SOURCELOCK_CONTRACT=0x5518987316f919396A7420CEf16b5c5ECC2ee1cE
NEXT_PUBLIC_GENLAYER_ENDPOINT=https://studio.genlayer.com/api
```
