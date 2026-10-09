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
genvm-lint check contracts/SourceLock.py --json
python -m pytest tests/direct -q
```

## Deployment

StudioNet:

```text
Contract: 0x00DBBA73dAd28d25FFB16EaF8D15bb387e79E130
Deploy tx: 0xac3b271db92371c0291d42cfbfa7a2477ff33aa9c396bd7bf017fb5b0d0c7ff6
```

## Live Verification

Live lifecycle run on StudioNet:

```text
LOCK_SOURCE_TX=0xc0cd87560f1fc0d263b9c043da9873070c43b2827f1d4f80728ba84270ca1d08
REVIEW_SOURCE_TX=0xf89ca4b2bfac6d8c330f9683d5a042b2c38d9fe78518f217411c5bac8d8c1750
REVIEW_STATUS=STABLE
REVIEW_SCORE=100
OPEN_CHALLENGE_TX=0x5c7f8792620942b77b1369c6dc7e19fd600e212080d56ffd1895e025f452a98c
RESOLVE_CHALLENGE_TX=0x03c72fd1ffaa9c2b260372cd56f87e42f44a53d664f7a5a397e3db42f625d9fa
FINAL_SOURCE_STATUS=STABLE
FINAL_CHALLENGE_STATUS=REJECTED
SUMMARY={'bonds_paid': '1', 'challenged_sources': '0', 'changed_sources': '0', 'reviews_completed': '1', 'revoked_sources': '0', 'sources_locked': '1', 'stable_sources': '1', 'total_bonded': '2'}
```

Set the deployed address in Vercel and local `.env.local`:

```bash
NEXT_PUBLIC_SOURCELOCK_CONTRACT=0x00DBBA73dAd28d25FFB16EaF8D15bb387e79E130
NEXT_PUBLIC_GENLAYER_ENDPOINT=https://studio.genlayer.com/api
```
