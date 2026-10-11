"use client";

import { useState } from "react";
import { Archive, CheckCircle2, Link2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useWallet } from "@/components/wallet-provider";
import { useTransaction } from "@/lib/tx/useTransaction";

export function LockSourceForm({ onSettled }: { onSettled: () => Promise<void> }) {
  const { address, connect } = useWallet();
  const tx = useTransaction(onSettled);
  const [form, setForm] = useState({
    id: "refund-policy-annual-plans",
    title: "Refund policy remains available for annual plans",
    sourceUrl: "https://example.com/legal/refunds",
    commitment: "This page promises that annual plan customers can request a prorated refund within 30 days of renewal.",
    expiresAt: "2027-01-31T23:59:59Z",
    bond: "5",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    const account = address ?? await connect();
    await tx.send(
      "Lock source claim",
      "lock_source",
      [form.id, form.title, form.sourceUrl, form.commitment, form.expiresAt],
      account,
      BigInt(form.bond || "0"),
    );
  }

  return (
    <section className="panel action-panel">
      <div className="panel-heading compact">
        <div>
          <p>Write to GenLayer</p>
          <h2>Lock a source</h2>
        </div>
        <span className="icon-chip teal"><LockKeyhole size={18} /></span>
      </div>
      <div className="form-grid">
        <label>Lock ID<input value={form.id} onChange={(event) => update("id", event.target.value)} /></label>
        <label>Bond GEN<input inputMode="numeric" value={form.bond} onChange={(event) => update("bond", event.target.value)} /></label>
        <label className="wide">Title<input value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
        <label className="wide">Source URL<input value={form.sourceUrl} onChange={(event) => update("sourceUrl", event.target.value)} /></label>
        <label className="wide">Commitment<textarea value={form.commitment} onChange={(event) => update("commitment", event.target.value)} /></label>
        <label className="wide">Expires at<input value={form.expiresAt} onChange={(event) => update("expiresAt", event.target.value)} /></label>
      </div>
      <button type="button" className="primary-action" onClick={() => void submit()}>
        <Link2 size={17} />
        Snapshot and lock
      </button>
      {tx.error && <p className="form-error">{tx.error}</p>}
      <TxStack transactions={tx.transactions} />
    </section>
  );
}

export function ReviewSourceForm({ sourceId, onSettled }: { sourceId?: string; onSettled: () => Promise<void> }) {
  const { address, connect } = useWallet();
  const tx = useTransaction(onSettled);
  const [reviewId, setReviewId] = useState("review-source-drift");

  async function submit() {
    const account = address ?? await connect();
    await tx.send("Review source drift", "review_source", [reviewId, sourceId ?? ""], account);
    setReviewId(`review-${Date.now().toString(36)}`);
  }

  return (
    <section className="panel action-panel compact-action">
      <div>
        <p>Consensus check</p>
        <h2>Review drift</h2>
      </div>
      <label>Review ID<input value={reviewId} onChange={(event) => setReviewId(event.target.value)} /></label>
      <button type="button" className="secondary-action" disabled={!sourceId} onClick={() => void submit()}>
        Review selected source
      </button>
      {!sourceId && <p className="muted-copy">Lock a source first, then reviews fetch the live page and compare it to the stored baseline.</p>}
      {tx.error && <p className="form-error">{tx.error}</p>}
      <TxStack transactions={tx.transactions} />
    </section>
  );
}

export function ChallengeSourceForm({ sourceId, onSettled }: { sourceId?: string; onSettled: () => Promise<void> }) {
  const { address, connect } = useWallet();
  const tx = useTransaction(onSettled);
  const [form, setForm] = useState({
    id: "challenge-material-change",
    url: "https://example.com/archive/refunds",
    statement: "The current wording no longer preserves the original refund promise. The linked archive shows the prior commitment clearly.",
    bond: "5",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    const account = address ?? await connect();
    await tx.send("Challenge source change", "open_challenge", [form.id, sourceId ?? "", form.url, form.statement], account, BigInt(form.bond || "0"));
  }

  return (
    <section className="panel action-panel compact-action">
      <div>
        <p>Bonded dispute</p>
        <h2>Challenge change</h2>
      </div>
      <label>Challenge ID<input value={form.id} onChange={(event) => update("id", event.target.value)} /></label>
      <label>Counter-source URL<input value={form.url} onChange={(event) => update("url", event.target.value)} /></label>
      <label>Statement<textarea value={form.statement} onChange={(event) => update("statement", event.target.value)} /></label>
      <label>Bond GEN<input inputMode="numeric" value={form.bond} onChange={(event) => update("bond", event.target.value)} /></label>
      <button type="button" className="secondary-action" disabled={!sourceId} onClick={() => void submit()}>
        Open challenge
      </button>
      {tx.error && <p className="form-error">{tx.error}</p>}
      <TxStack transactions={tx.transactions} />
    </section>
  );
}

export function ResolveChallengeForm({ challengeId, onSettled }: { challengeId?: string; onSettled: () => Promise<void> }) {
  const { address, connect } = useWallet();
  const tx = useTransaction(onSettled);
  const [manualId, setManualId] = useState("");
  const resolvedChallengeId = manualId || challengeId || "";

  async function submit() {
    const account = address ?? await connect();
    await tx.send("Resolve challenge", "resolve_challenge", [resolvedChallengeId], account);
  }

  return (
    <section className="panel action-panel compact-action">
      <div>
        <p>Settle dispute</p>
        <h2>Resolve challenge</h2>
      </div>
      <label>Challenge ID<input placeholder={challengeId || "challenge id"} value={manualId} onChange={(event) => setManualId(event.target.value)} /></label>
      <button type="button" className="secondary-action" disabled={!resolvedChallengeId} onClick={() => void submit()}>
        <CheckCircle2 size={17} />
        Resolve challenge
      </button>
      {!resolvedChallengeId && <p className="muted-copy">Select a challenged source or enter a challenge ID to run the consensus settlement path.</p>}
      {tx.error && <p className="form-error">{tx.error}</p>}
      <TxStack transactions={tx.transactions} />
    </section>
  );
}

export function RetireSourceForm({ sourceId, expiresAt, onSettled }: { sourceId?: string; expiresAt?: string; onSettled: () => Promise<void> }) {
  const { address, connect } = useWallet();
  const tx = useTransaction(onSettled);
  const [manualId, setManualId] = useState("");
  const retiredSourceId = manualId || sourceId || "";

  async function submit() {
    const account = address ?? await connect();
    await tx.send("Retire source", "retire_source", [retiredSourceId], account);
  }

  return (
    <section className="panel action-panel compact-action">
      <div>
        <p>Expiry payout</p>
        <h2>Retire source</h2>
      </div>
      <label>Source ID<input placeholder={sourceId || "source id"} value={manualId} onChange={(event) => setManualId(event.target.value)} /></label>
      {expiresAt && <p className="muted-copy">Retirement pays the claimant bond only after expiry: {expiresAt}</p>}
      <button type="button" className="secondary-action" disabled={!retiredSourceId} onClick={() => void submit()}>
        <Archive size={17} />
        Retire source
      </button>
      {tx.error && <p className="form-error">{tx.error}</p>}
      <TxStack transactions={tx.transactions} />
    </section>
  );
}

function TxStack({ transactions }: { transactions: { hash: string; label: string; state: string }[] }) {
  if (transactions.length === 0) return null;
  return (
    <div className="tx-stack">
      {transactions.slice(0, 3).map((item) => (
        <div key={item.hash}><ShieldCheck size={15} /> {item.label}: {item.state}</div>
      ))}
    </div>
  );
}
