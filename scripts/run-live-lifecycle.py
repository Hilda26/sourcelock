import os
import time
from pathlib import Path

from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded
from gltest.types import TransactionStatus
from gltest_cli.config.general import get_general_config
from gltest_cli.config.types import PluginConfig
from gltest_cli.config.user import load_user_config


ROOT = Path(__file__).parents[1]
DEFAULT_ADDRESS = "0x00DBBA73dAd28d25FFB16EaF8D15bb387e79E130"
SOURCE_URL = "https://raw.githubusercontent.com/Hilda26/sourcelock/main/README.md"
COUNTER_URL = "https://raw.githubusercontent.com/Hilda26/sourcelock/main/CONTRACT_STATUS.md"


def configure_gltest() -> None:
    general = get_general_config()
    general.user_config = load_user_config(str(ROOT / "gltest.config.yaml"))
    general.plugin_config = PluginConfig()


def tx_hash(receipt) -> str:
    return str(receipt.get("hash") or receipt.get("transaction_hash") or receipt.get("tx_hash") or receipt.get("tx_id") or "UNKNOWN")


def wait_tx(call, label: str, value: int = 0):
    receipt = call.transact(
        value=value,
        wait_transaction_status=TransactionStatus.FINALIZED,
        wait_interval=5000,
        wait_retries=240,
    )
    print(f"SOURCELOCK_LIFECYCLE {label}_TX={tx_hash(receipt)}")
    if not tx_execution_succeeded(receipt):
        raise SystemExit(f"{label} failed: {receipt}")
    return receipt


def main() -> None:
    configure_gltest()
    address = os.environ.get("SOURCELOCK_CONTRACT") or os.environ.get("NEXT_PUBLIC_SOURCELOCK_CONTRACT") or DEFAULT_ADDRESS
    source_id = os.environ.get("SOURCELOCK_SOURCE_ID") or f"sourcelock-readme-{int(time.time())}"
    review_id = f"{source_id}-review"
    challenge_id = f"{source_id}-challenge"
    factory = get_contract_factory(contract_file_path="SourceLock.py")
    registry = factory.build_contract(contract_address=address)

    title = "SourceLock README states the GenLayer product purpose"
    commitment = (
        "The SourceLock README describes SourceLock as a GenLayer app for source-backed public commitments, "
        "where a claimant bonds a URL and a precise commitment, the contract snapshots and hashes the page, "
        "and later reviews or challenges use validator consensus to decide whether the source materially drifted."
    )
    expiry = "2030-01-01T00:00:00Z"

    try:
        source = registry.get_source(args=[source_id]).call()
        print(f"SOURCELOCK_LIFECYCLE EXISTING_SOURCE_STATUS={source['status']}")
    except Exception:
        wait_tx(registry.lock_source(args=[source_id, title, SOURCE_URL, commitment, expiry]), "LOCK_SOURCE", value=1)
        source = registry.get_source(args=[source_id]).call()
        print(f"SOURCELOCK_LIFECYCLE LOCKED_STATUS={source['status']}")

    try:
        review = registry.get_review(args=[review_id]).call()
        print(f"SOURCELOCK_LIFECYCLE EXISTING_REVIEW_STATUS={review['status']}")
    except Exception:
        wait_tx(registry.review_source(args=[review_id, source_id]), "REVIEW_SOURCE")
        review = registry.get_review(args=[review_id]).call()
        print(f"SOURCELOCK_LIFECYCLE REVIEW_STATUS={review['status']}")
        print(f"SOURCELOCK_LIFECYCLE REVIEW_SCORE={review['materiality_score']}")

    source = registry.get_source(args=[source_id]).call()
    if source["status"] in ("LOCKED", "STABLE", "CHANGED"):
        try:
            challenge = registry.get_challenge(args=[challenge_id]).call()
            print(f"SOURCELOCK_LIFECYCLE EXISTING_CHALLENGE_STATUS={challenge['status']}")
        except Exception:
            statement = (
                "This challenge intentionally exercises the bonded dispute path. The counter-source is the contract status "
                "document, so it should not by itself prove that the README materially weakened the locked commitment."
            )
            wait_tx(registry.open_challenge(args=[challenge_id, source_id, COUNTER_URL, statement]), "OPEN_CHALLENGE", value=1)
            challenge = registry.get_challenge(args=[challenge_id]).call()
            print(f"SOURCELOCK_LIFECYCLE CHALLENGE_STATUS={challenge['status']}")

    source = registry.get_source(args=[source_id]).call()
    if source["status"] == "CHALLENGED":
        wait_tx(registry.resolve_challenge(args=[challenge_id]), "RESOLVE_CHALLENGE")

    final_source = registry.get_source(args=[source_id]).call()
    final_challenge = registry.get_challenge(args=[challenge_id]).call()
    summary = registry.get_registry(args=[]).call()
    print(f"SOURCELOCK_LIFECYCLE FINAL_SOURCE_STATUS={final_source['status']}")
    print(f"SOURCELOCK_LIFECYCLE FINAL_CHALLENGE_STATUS={final_challenge['status']}")
    print(f"SOURCELOCK_LIFECYCLE FINAL_CHALLENGE_VERDICT={final_challenge['verdict']}")
    print(f"SOURCELOCK_LIFECYCLE SUMMARY={summary}")
    if final_source["status"] not in ("STABLE", "CHANGED", "REVOKED"):
        raise SystemExit(f"unexpected final source status: {final_source}")


if __name__ == "__main__":
    main()
