"use client";

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import type { CalldataEncodable, TransactionHash } from "genlayer-js/types";
import { STUDIONET_EXPLORER } from "@/lib/network";

const DEFAULT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000" as const;
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_SOURCELOCK_CONTRACT || DEFAULT_CONTRACT_ADDRESS) as `0x${string}`;
const endpoint = process.env.NEXT_PUBLIC_GENLAYER_ENDPOINT ?? "https://studio.genlayer.com/api";

export type SourceStatus = "LOCKED" | "STABLE" | "CHANGED" | "CHALLENGED" | "REVOKED" | "RETIRED" | string;
export type ReviewStatus = "PENDING" | "STABLE" | "MATERIAL_CHANGE" | "INCONCLUSIVE" | string;
export type ChallengeStatus = "OPEN" | "ACCEPTED" | "REJECTED" | "INCONCLUSIVE" | string;

export type SourceSummary = {
  sources_locked: string;
  stable_sources: string;
  changed_sources: string;
  challenged_sources: string;
  revoked_sources: string;
  reviews_completed: string;
  total_bonded: string;
  bonds_paid: string;
};

export type LockedSource = {
  id: string;
  claimant: string;
  title: string;
  source_url: string;
  effective_host: string;
  commitment: string;
  baseline_sha256: string;
  baseline_excerpt: string;
  latest_sha256: string;
  latest_excerpt: string;
  status: SourceStatus;
  locked_at: string;
  updated_at: string;
  expires_at: string;
  bond: string;
  review_count: string;
  active_challenge_id: string;
  last_verdict: string;
  last_materiality_score: string;
  last_rationale: string;
};

export type SourceReview = {
  id: string;
  source_id: string;
  reviewer: string;
  captured_sha256: string;
  captured_excerpt: string;
  status: ReviewStatus;
  materiality_score: string;
  rationale: string;
  reviewed_at: string;
};

export type ChangeChallenge = {
  id: string;
  source_id: string;
  challenger: string;
  counter_url: string;
  counter_sha256: string;
  counter_excerpt: string;
  statement: string;
  status: ChallengeStatus;
  verdict: string;
  rationale: string;
  opened_at: string;
  resolved_at: string;
  bond: string;
};

export type Dashboard = { summary: SourceSummary; sources: LockedSource[]; reviews: SourceReview[]; challenges: ChangeChallenge[] };

export const EMPTY_SUMMARY: SourceSummary = {
  sources_locked: "0",
  stable_sources: "0",
  changed_sources: "0",
  challenged_sources: "0",
  revoked_sources: "0",
  reviews_completed: "0",
  total_bonded: "0",
  bonds_paid: "0",
};

export const EMPTY_DASHBOARD: Dashboard = { summary: EMPTY_SUMMARY, sources: [], reviews: [], challenges: [] };

export const txUrl = (hash: string) => `${STUDIONET_EXPLORER}/tx/${hash}`;
export const addressUrl = (address: string) => `${STUDIONET_EXPLORER}/address/${address}`;

type EncodedArg =
  | string
  | number
  | boolean
  | null
  | EncodedArg[]
  | { __sourceLockBigInt: string }
  | { [key: string]: EncodedArg };

function client(account?: `0x${string}`) {
  return createClient({ chain: studionet, endpoint, account, provider: typeof window === "undefined" ? undefined : window.ethereum });
}

function configuredAddress(): `0x${string}` {
  if (!CONTRACT_ADDRESS || /^0x0{40}$/i.test(CONTRACT_ADDRESS)) throw new Error("SourceLock contract not configured.");
  return CONTRACT_ADDRESS;
}

export async function readContract<T>(functionName: string, args: CalldataEncodable[] = []): Promise<T> {
  if (typeof window !== "undefined") {
    const response = await fetch("/api/sourcelock/read", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ functionName, args: args.map(encodeArg) }),
    });
    const payload = await response.json() as { result?: T; error?: string };
    if (!response.ok || payload.error) throw new Error(payload.error ?? "Unable to read SourceLock.");
    return payload.result as T;
  }

  return await client().readContract({ address: configuredAddress(), functionName, args }) as T;
}

function encodeArg(value: CalldataEncodable): EncodedArg {
  if (typeof value === "bigint") return { __sourceLockBigInt: value.toString() };
  if (Array.isArray(value)) return value.map((item) => encodeArg(item as CalldataEncodable));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encodeArg(item as CalldataEncodable)]));
  }
  return value as EncodedArg;
}

export async function loadDashboard(): Promise<Dashboard> {
  const [summary, sources, reviews, challenges] = await Promise.all([
    readContract<SourceSummary>("get_registry"),
    readContract<LockedSource[]>("list_sources", ["", 0n, 50n]),
    readContract<SourceReview[]>("list_reviews", ["", 0n, 50n]),
    readContract<ChangeChallenge[]>("list_challenges", ["", 0n, 50n]),
  ]);
  return { summary, sources, reviews, challenges };
}

export async function writeContract(account: `0x${string}`, functionName: string, args: CalldataEncodable[], value = 0n) {
  const writer = client(account);
  await writer.connect("studionet");
  return await writer.writeContract({ address: configuredAddress(), functionName, args, value, consensusMaxRotations: 3 }) as TransactionHash;
}

export async function waitFinalized(account: `0x${string}`, hash: TransactionHash) {
  const writer = client(account);
  await writer.connect("studionet");
  await writer.waitForTransactionReceipt({ hash, status: TransactionStatus.FINALIZED, interval: 5000, retries: 180 });
  const transaction = await writer.getTransaction({ hash });
  const execution = transaction?.consensus_data?.leader_receipt?.[0]?.execution_result;
  if (execution && execution !== "SUCCESS") throw new Error(`Finalized transaction rolled back (${execution}).`);
  return { transaction, triggered: (transaction as unknown as { triggered_transactions?: string[] } | undefined)?.triggered_transactions ?? [] };
}
