"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Clock3,
  DatabaseZap,
  FileClock,
  History,
  Home,
  Link2,
  LockKeyhole,
  Menu,
  Radar,
  RefreshCcw,
  Search,
  Settings,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ChallengeSourceForm, LockSourceForm, ReviewSourceForm } from "@/components/lock-source-form";
import { useWallet } from "@/components/wallet-provider";
import { CONTRACT_ADDRESS, EMPTY_DASHBOARD, type Dashboard, type LockedSource, loadDashboard } from "@/lib/sourcelock";

type Filter = "All" | "LOCKED" | "STABLE" | "CHANGED" | "CHALLENGED" | "REVOKED";

const nav = [
  { label: "Dashboard", icon: Home },
  { label: "Source Watch", icon: Radar },
  { label: "Claims", icon: LockKeyhole },
  { label: "Reviews", icon: ClipboardCheck },
  { label: "History", icon: History },
];

export default function HomePage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboard, setDashboard] = useState<Dashboard>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const { address, connected, connect, disconnect } = useWallet();

  async function refresh() {
    setLoading(true);
    setError(undefined);
    try {
      setDashboard(await loadDashboard());
    } catch (cause) {
      setDashboard(EMPTY_DASHBOARD);
      setError(cause instanceof Error ? cause.message : "Unable to read SourceLock on StudioNet.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const visibleSources = useMemo(() => {
    return filter === "All" ? dashboard.sources : dashboard.sources.filter((source) => source.status === filter);
  }, [dashboard.sources, filter]);

  const selectedSource = visibleSources[0] ?? dashboard.sources[0];
  const summary = dashboard.summary;
  const configured = CONTRACT_ADDRESS && !/^0x0{40}$/i.test(CONTRACT_ADDRESS);
  const integrityScore = Number(summary.sources_locked) === 0
    ? "0.00"
    : Math.max(0, 100 - (Number(summary.changed_sources) + Number(summary.revoked_sources) * 2) * 8).toFixed(2);

  return (
    <main className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <strong>sourcelock</strong>
        </div>

        <nav className="side-nav" aria-label="Main navigation">
          {nav.map((item, index) => {
            const Icon = item.icon;
            return (
              <button key={item.label} type="button" className={index === 0 ? "active" : ""}>
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <section className="sidebar-callout">
          <BookOpen size={20} />
          <strong>Intelligent Contract</strong>
          <p>Sources are snapshotted, hashed, reviewed, and challenged by GenLayer consensus.</p>
          <button type="button" aria-label="Open contract brief"><ArrowUpRight size={16} /></button>
        </section>

        <button type="button" className="logout-button">
          <Settings size={18} />
          StudioNet settings
        </button>
      </aside>

      {sidebarOpen && <button className="scrim" type="button" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}

      <section className="main-panel">
        <header className="topbar">
          <button className="menu-button" type="button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div>
            <p>GenLayer StudioNet</p>
            <h1>SourceLock</h1>
          </div>
          <div className="top-actions">
            <button type="button" aria-label="Search dashboard"><Search size={19} /></button>
            <button type="button" aria-label="Refresh contract data" onClick={() => void refresh()}><RefreshCcw size={19} /></button>
            <button type="button" aria-label="Wallet" onClick={() => connected ? disconnect() : void connect()}><UserRound size={19} /></button>
          </div>
        </header>

        <section className={`referral-strip ${error ? "warning-strip" : ""}`}>
          <div>
            <span className="icon-chip dark">{error ? <AlertTriangle size={18} /> : <DatabaseZap size={18} />}</span>
            <strong>{error ? "Contract read unavailable" : `Contract: ${shortAddress(CONTRACT_ADDRESS)}`}</strong>
            <small>{connected ? `Wallet ${shortAddress(address ?? "")}` : "Wallet not connected"}</small>
          </div>
          <button type="button" onClick={() => void refresh()}>{loading ? "Reading" : "Refresh"}<RefreshCcw size={18} /></button>
        </section>

        {error && (
          <section className="empty-contract panel">
            <h2>{configured ? "SourceLock could not read StudioNet" : "SourceLock contract not configured"}</h2>
            <p>
              {configured
                ? error
                : "Set NEXT_PUBLIC_SOURCELOCK_CONTRACT to a deployed SourceLock.py address. Until then the app shows no invented claims, reviews, or ledger rows."}
            </p>
          </section>
        )}

        <section className="season-grid">
          <article className="season-card primary">
            <span className="icon-chip"><LockKeyhole size={18} /></span>
            <p>Registry integrity</p>
            <strong>{integrityScore}</strong>
            <small>{summary.sources_locked} source(s) locked on-chain</small>
            <div className="sparkline" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
          </article>

          <article className="season-card soft">
            <span className="icon-chip"><ShieldAlert size={18} /></span>
            <p>Open pressure</p>
            <strong>{Number(summary.changed_sources) + Number(summary.challenged_sources)}</strong>
            <small>{summary.changed_sources} changed, {summary.challenged_sources} challenged</small>
          </article>

          <article className="connect-card">
            <div>
              <span className="icon-chip teal"><FileClock size={18} /></span>
              <p>Reviews completed</p>
              <strong>{summary.reviews_completed}</strong>
            </div>
            <div className="quality-ring"><span>{summary.total_bonded}</span></div>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel wide">
            <div className="panel-heading">
              <div>
                <p>Source watch</p>
                <h2>Contract-backed commitments</h2>
              </div>
              <div className="segmented" aria-label="Source filters">
                {(["All", "LOCKED", "STABLE", "CHANGED", "CHALLENGED", "REVOKED"] as const).map((item) => (
                  <button key={item} type="button" className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>
                    {titleCase(item)}
                  </button>
                ))}
              </div>
            </div>

            <div className="source-list">
              {visibleSources.length === 0 ? (
                <div className="empty-state">No contract sources match this view.</div>
              ) : (
                visibleSources.map((source) => <SourceRow key={source.id} source={source} />)
              )}
            </div>
          </article>

          <LockSourceForm onSettled={refresh} />
          <ReviewSourceForm sourceId={selectedSource?.id} onSettled={refresh} />
          <ChallengeSourceForm sourceId={selectedSource?.id} onSettled={refresh} />

          <article className="panel">
            <div className="panel-heading compact">
              <div>
                <p>Live ledger</p>
                <h2>Recent contract events</h2>
              </div>
              <span className="status-pill">StudioNet</span>
            </div>
            <div className="history-list">
              {dashboard.reviews.slice(0, 3).map((review) => (
                <div className={`history-row ${review.status === "STABLE" ? "good" : review.status === "MATERIAL_CHANGE" ? "warning" : "neutral"}`} key={review.id}>
                  <span>{review.status === "STABLE" ? <Check size={16} /> : <CircleDot size={16} />}</span>
                  <div>
                    <strong>{review.source_id}</strong>
                    <small>{review.status}: {review.rationale || "Review recorded."}</small>
                  </div>
                  <time>{review.reviewed_at || "pending"}</time>
                </div>
              ))}
              {dashboard.challenges.slice(0, 3).map((challenge) => (
                <div className={`history-row ${challenge.status === "ACCEPTED" ? "danger" : "neutral"}`} key={challenge.id}>
                  <span>{challenge.status === "ACCEPTED" ? <X size={16} /> : <CircleDot size={16} />}</span>
                  <div>
                    <strong>{challenge.source_id}</strong>
                    <small>{challenge.status}: {challenge.statement}</small>
                  </div>
                  <time>{challenge.opened_at}</time>
                </div>
              ))}
              {dashboard.reviews.length === 0 && dashboard.challenges.length === 0 && (
                <div className="empty-state">No reviews or challenges have been written yet.</div>
              )}
            </div>
          </article>
        </section>

        <nav className="mobile-nav" aria-label="Mobile navigation">
          {nav.slice(0, 4).map((item, index) => {
            const Icon = item.icon;
            return (
              <button key={item.label} type="button" className={index === 0 ? "active" : ""} aria-label={item.label}>
                <Icon size={21} />
              </button>
            );
          })}
        </nav>
      </section>
    </main>
  );
}

function SourceRow({ source }: { source: LockedSource }) {
  const score = Math.min(100, Math.max(0, Number(source.last_materiality_score || "0")));
  return (
    <article className="source-row">
      <span className={`state-dot ${source.status.toLowerCase()}`} />
      <div className="source-copy">
        <strong>{source.title}</strong>
        <span><Link2 size={14} /> {source.effective_host || source.source_url}</span>
      </div>
      <div className="source-meta">
        <small>{shortAddress(source.claimant)}</small>
        <b>{titleCase(source.status)}</b>
      </div>
      <div className="drift-meter" aria-label={`${score}% materiality`}><i style={{ width: `${score}%` }} /></div>
      <div className="source-tail">
        <span><FileClock size={15} /> {source.review_count}</span>
        <span><Clock3 size={15} /> {source.updated_at || source.locked_at}</span>
      </div>
      <button type="button" aria-label={`Open ${source.title}`}><ChevronRight size={18} /></button>
    </article>
  );
}

function shortAddress(value: string) {
  if (!value) return "not connected";
  if (value.length <= 14) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function titleCase(value: string) {
  if (value === "All") return value;
  return value.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
