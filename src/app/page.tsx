"use client";

import {
  Activity,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Clock3,
  DatabaseZap,
  FileClock,
  Flame,
  Gauge,
  Gift,
  History,
  Home,
  Layers3,
  Link2,
  LockKeyhole,
  Menu,
  Radar,
  RefreshCcw,
  Search,
  Settings,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  SquareStack,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type SourceState = "Stable" | "Changed" | "Disputed" | "Pending";

type SourceRecord = {
  id: number;
  title: string;
  owner: string;
  url: string;
  state: SourceState;
  lockedAt: string;
  drift: number;
  snapshots: number;
};

const sources: SourceRecord[] = [
  {
    id: 1,
    title: "Refund policy remains available for annual plans",
    owner: "Atlas Cloud",
    url: "atlas.example/legal/refunds",
    state: "Changed",
    lockedAt: "09:20",
    drift: 68,
    snapshots: 14,
  },
  {
    id: 2,
    title: "Open-source roadmap keeps self-hosting commitment",
    owner: "Northstar Labs",
    url: "northstar.example/roadmap",
    state: "Stable",
    lockedAt: "08:45",
    drift: 12,
    snapshots: 28,
  },
  {
    id: 3,
    title: "Creator royalty terms do not reduce payout floor",
    owner: "Mintlane",
    url: "mintlane.example/terms",
    state: "Disputed",
    lockedAt: "Yesterday",
    drift: 84,
    snapshots: 9,
  },
  {
    id: 4,
    title: "Carbon removal report still names the same registry",
    owner: "Verdant Works",
    url: "verdant.example/report",
    state: "Pending",
    lockedAt: "Queued",
    drift: 34,
    snapshots: 6,
  },
];

const tasks = [
  { label: "Review two changed commitments", points: "+450 lock score", progress: 75, icon: ClipboardCheck },
  { label: "Invite an auditor to the workspace", points: "+120 trust reach", progress: 35, icon: Share2 },
  { label: "Resolve one disputed source", points: "+800 reputation", progress: 15, icon: ShieldAlert },
];

const history = [
  { label: "Refund policy wording changed", detail: "Materiality check opened", time: "12 min ago", tone: "warning" },
  { label: "Roadmap source recaptured", detail: "Digest matched prior lock", time: "44 min ago", tone: "good" },
  { label: "Royalty terms challenged", detail: "Bonded contradiction posted", time: "2 hr ago", tone: "danger" },
  { label: "New source added", detail: "Carbon registry report queued", time: "4 hr ago", tone: "neutral" },
];

const nav = [
  { label: "Dashboard", icon: Home },
  { label: "Source Watch", icon: Radar },
  { label: "Claims", icon: LockKeyhole },
  { label: "Reviews", icon: ClipboardCheck },
  { label: "History", icon: History },
];

export default function HomePage() {
  const [filter, setFilter] = useState<"All" | SourceState>("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleSources = useMemo(() => {
    return filter === "All" ? sources : sources.filter((source) => source.state === filter);
  }, [filter]);

  return (
    <main className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
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
          <strong>SourceLock brief</strong>
          <p>Digest, archive, and challenge meaningful web-page changes.</p>
          <button type="button" aria-label="Open SourceLock brief">
            <ArrowUpRight size={16} />
          </button>
        </section>

        <button type="button" className="logout-button">
          <Settings size={18} />
          Workspace settings
        </button>
      </aside>

      {sidebarOpen && (
        <button className="scrim" type="button" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />
      )}

      <section className="main-panel">
        <header className="topbar">
          <button className="menu-button" type="button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div>
            <p>Hello, Reviewer</p>
            <h1>Dashboard</h1>
          </div>
          <div className="top-actions">
            <button type="button" aria-label="Search dashboard">
              <Search size={19} />
            </button>
            <button type="button" aria-label="Notifications">
              <Bell size={19} />
              <span />
            </button>
            <button type="button" aria-label="Profile">
              <UserRound size={19} />
            </button>
          </div>
        </header>

        <section className="referral-strip">
          <div>
            <span className="icon-chip dark">
              <Layers3 size={18} />
            </span>
            <strong>Total locked sources: 1,284</strong>
            <small>Pending review: 18</small>
          </div>
          <button type="button">
            Share
            <Share2 size={18} />
          </button>
        </section>

        <section className="season-grid">
          <article className="season-card primary">
            <span className="icon-chip">
              <Sparkles size={18} />
            </span>
            <p>Current epoch: October Watch</p>
            <strong>97.42</strong>
            <small>source integrity score</small>
            <div className="sparkline" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </article>

          <article className="season-card soft">
            <span className="icon-chip">
              <CalendarClock size={18} />
            </span>
            <p>Today&apos;s changes</p>
            <strong>43</strong>
            <small>8 need materiality review</small>
          </article>

          <article className="connect-card">
            <div>
              <span className="icon-chip teal">
                <DatabaseZap size={18} />
              </span>
              <p>Archive connection</p>
              <strong>Live</strong>
            </div>
            <div className="quality-ring">
              <span>91%</span>
            </div>
          </article>
        </section>

        <section className="dashboard-grid">
          <article className="panel wide">
            <div className="panel-heading">
              <div>
                <p>Source watch</p>
                <h2>Tracked commitments</h2>
              </div>
              <div className="segmented" aria-label="Source filters">
                {(["All", "Stable", "Changed", "Disputed", "Pending"] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={filter === item ? "selected" : ""}
                    onClick={() => setFilter(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="source-list">
              {visibleSources.map((source) => (
                <SourceRow key={source.id} source={source} />
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading compact">
              <div>
                <p>Checks</p>
                <h2>Review queue</h2>
              </div>
              <button type="button" className="mini-action" aria-label="Refresh review queue">
                <RefreshCcw size={16} />
              </button>
            </div>

            <div className="task-list">
              {tasks.map((task) => {
                const Icon = task.icon;
                return (
                  <div className="task-row" key={task.label}>
                    <span className="task-icon">
                      <Icon size={18} />
                    </span>
                    <div>
                      <strong>{task.label}</strong>
                      <small>{task.points}</small>
                      <span className="progress">
                        <i style={{ width: `${task.progress}%` }} />
                      </span>
                    </div>
                    <button type="button" aria-label={`Open ${task.label}`}>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="panel graph-panel">
            <div className="panel-heading compact">
              <div>
                <p>Drift trend</p>
                <h2>Materiality</h2>
              </div>
              <span className="positive">+12.8%</span>
            </div>
            <div className="bar-chart" aria-label="Materiality chart">
              {[36, 48, 42, 78, 54, 88, 61, 70, 44, 82, 57, 92].map((height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading compact">
              <div>
                <p>Live ledger</p>
                <h2>Recent events</h2>
              </div>
              <span className="status-pill">Synced</span>
            </div>
            <div className="history-list">
              {history.map((item) => (
                <div className={`history-row ${item.tone}`} key={item.label}>
                  <span>
                    {item.tone === "good" ? <Check size={16} /> : item.tone === "danger" ? <X size={16} /> : <CircleDot size={16} />}
                  </span>
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </div>
                  <time>{item.time}</time>
                </div>
              ))}
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

function SourceRow({ source }: { source: SourceRecord }) {
  return (
    <article className="source-row">
      <span className={`state-dot ${source.state.toLowerCase()}`} />
      <div className="source-copy">
        <strong>{source.title}</strong>
        <span>
          <Link2 size={14} />
          {source.url}
        </span>
      </div>
      <div className="source-meta">
        <small>{source.owner}</small>
        <b>{source.state}</b>
      </div>
      <div className="drift-meter" aria-label={`${source.drift}% drift`}>
        <i style={{ width: `${source.drift}%` }} />
      </div>
      <div className="source-tail">
        <span>
          <FileClock size={15} />
          {source.snapshots}
        </span>
        <span>
          <Clock3 size={15} />
          {source.lockedAt}
        </span>
      </div>
      <button type="button" aria-label={`Open ${source.title}`}>
        <ChevronRight size={18} />
      </button>
    </article>
  );
}
