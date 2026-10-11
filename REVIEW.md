# SourceLock Protocole Review Response

This file documents the changes made in response to the team review:

> Please enforce the bonded lifecycle in repository source by preventing bond-returning retirement before expiry, prohibiting claimant self-challenges, and preserving the prior source status when a challenge is rejected instead of automatically changing a previously changed source to stable. Also expose working resolve_challenge and retire_source actions through the application, and add direct regression tests covering those authorization, status, expiry, and payout paths.

## Status

All requested changes have been implemented, committed, pushed to GitHub, deployed, and verified.

## GitHub

Repository:

```text
https://github.com/Hilda26/sourcelock
```

Review fix commit:

```text
9729481 Enforce SourceLock bonded lifecycle
```

## Live App

```text
https://sourcelock-protocole.vercel.app
```

## Updated GenLayer Contract

```text
0x5518987316f919396A7420CEf16b5c5ECC2ee1cE
```

## Contract Changes

Implemented in:

```text
contracts/SourceLock.py
```

Changes:

- `open_challenge` now rejects claimant self-challenges.
- `open_challenge` records `previous_status` before moving a source into `CHALLENGED`.
- `resolve_challenge` restores `previous_status` when a challenge is `REJECTED`.
- `resolve_challenge` restores `previous_status` when a challenge is `INCONCLUSIVE`.
- `retire_source` now rejects retirement before `expires_at`.
- `_retire` now accounts the returned source bond in `bonds_paid`.
- Inconclusive challenge refunds are now accounted in `bonds_paid`.
- Contract time now uses GenLayer transaction time via `datetime.now(timezone.utc)`.

## Application Changes

Implemented in:

```text
src/components/lock-source-form.tsx
src/app/page.tsx
src/lib/sourcelock.ts
```

Changes:

- Added a working `resolve_challenge` action panel.
- Added a working `retire_source` action panel.
- Exposed `previous_status` in the frontend challenge type.
- Wired both new actions through the existing wallet transaction flow.

## Regression Tests

Implemented in:

```text
tests/direct/test_sourcelock_contract.py
```

Coverage added:

- Claimant cannot challenge their own source.
- Rejected challenge preserves a previously `CHANGED` source status.
- Rejected challenge clears active challenge state and pays the challenge bond to the claimant.
- Retirement before expiry is rejected.
- Retirement after expiry returns the claimant bond and updates payout accounting.

## Verification

Commands run successfully:

```text
python -m pytest tests/direct -q
genvm-lint check contracts/SourceLock.py --json
npm run lint
npx next build --webpack
```

Results:

```text
Direct tests: 6 passed
GenVM lint: ok true
Frontend lint: passed
Production build: passed
```

## Live Verification

New StudioNet deployment:

```text
Deploy tx: 0xe34e5866df23ed9c8bdd18684ae8c6616ff63e6dd7e134d7d304da1df45d8c80
```

Live lifecycle run:

```text
LOCK_SOURCE_TX=0xb15bd179ca4dd56037972ab28218d8d53940824992ad0efd550d93a325dafd6b
REVIEW_SOURCE_TX=0xfa28530797a02dfcdf20bd5456d280f5022bd4b595ea1ca0bdb83167f707b453
OPEN_CHALLENGE_TX=0x5274f9b0ba06fb1563a98c20f5886774132c7707c04ec09923267516559c2dac
RESOLVE_CHALLENGE_TX=0x8895933eaa9a5ad2775c194c763f101b19e1409b38bba6dcacf2a3b029ef1297
FINAL_SOURCE_STATUS=STABLE
FINAL_CHALLENGE_STATUS=REJECTED
FINAL_CHALLENGE_VERDICT=REJECTED
```

Production API verification:

```text
sources_locked: 2
stable_sources: 2
reviews_completed: 2
total_bonded: 3
bonds_paid: 1
```

## Resubmission Answer

The requested review fixes are complete and the project is ready to resubmit.
