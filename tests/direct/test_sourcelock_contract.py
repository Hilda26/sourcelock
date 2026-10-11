def test_sourcelock_deploys_and_starts_empty(direct_deploy):
    registry = direct_deploy("contracts/SourceLock.py")
    summary = registry.get_registry()
    assert summary["sources_locked"] == "0"
    assert summary["stable_sources"] == "0"
    assert summary["changed_sources"] == "0"
    assert summary["challenged_sources"] == "0"
    assert summary["reviews_completed"] == "0"
    assert summary["total_bonded"] == "0"
    assert registry.list_sources("", 0, 50) == []
    assert registry.list_reviews("", 0, 50) == []
    assert registry.list_challenges("", 0, 50) == []


def test_unknown_source_read_reverts(direct_deploy, direct_vm):
    registry = direct_deploy("contracts/SourceLock.py")
    with direct_vm.expect_revert("Unknown source"):
        registry.get_source("missing")


SOURCE_URL = "https://example.com/source"
COUNTER_URL = "https://example.com/counter"
FUTURE_EXPIRY = "2030-01-01T00:00:00Z"
PAST_EXPIRY = "2026-01-01T00:00:00Z"


def _lock_source(registry, direct_vm, claimant, source_id="source-1", expires_at=FUTURE_EXPIRY, bond=5):
    direct_vm.sender = claimant
    direct_vm.value = bond
    direct_vm.mock_web(SOURCE_URL, {"status": 200, "body": "Original source text keeps the locked commitment intact."})
    registry.lock_source(
        source_id,
        "Refund commitment source",
        SOURCE_URL,
        "The public source promises that annual customers can request a prorated refund after renewal.",
        expires_at,
    )
    direct_vm.value = 0


def _mark_changed(registry, direct_vm, reviewer, source_id="source-1"):
    direct_vm.clear_mocks()
    direct_vm.sender = reviewer
    direct_vm.mock_web(SOURCE_URL, {"status": 200, "body": "The refund promise was removed from this changed source."})
    direct_vm.mock_llm(
        "reviewing a SourceLock public commitment",
        '{"verdict":"MATERIAL_CHANGE","score":91,"rationale":"The current source removes the refund commitment."}',
    )
    registry.review_source("review-1", source_id)


def _open_challenge(registry, direct_vm, challenger, challenge_id="challenge-1", source_id="source-1", bond=2):
    direct_vm.clear_mocks()
    direct_vm.sender = challenger
    direct_vm.value = bond
    direct_vm.mock_web(COUNTER_URL, {"status": 200, "body": "Counter-evidence submitted for dispute resolution."})
    registry.open_challenge(
        challenge_id,
        source_id,
        COUNTER_URL,
        "The counter-evidence argues that the source materially changed and should be reviewed by consensus.",
    )
    direct_vm.value = 0


def test_claimant_cannot_self_challenge(direct_deploy, direct_vm, direct_alice):
    registry = direct_deploy("contracts/SourceLock.py")
    _lock_source(registry, direct_vm, direct_alice)

    direct_vm.sender = direct_alice
    direct_vm.value = 2
    with direct_vm.expect_revert("Claimant cannot challenge own source"):
        registry.open_challenge(
            "challenge-1",
            "source-1",
            COUNTER_URL,
            "The claimant should not be allowed to dispute their own bonded source commitment.",
        )
    direct_vm.value = 0


def test_rejected_challenge_preserves_changed_status_and_pays_claimant(direct_deploy, direct_vm, direct_alice, direct_bob):
    registry = direct_deploy("contracts/SourceLock.py")
    _lock_source(registry, direct_vm, direct_alice)
    _mark_changed(registry, direct_vm, direct_bob)

    assert registry.get_source("source-1")["status"] == "CHANGED"
    _open_challenge(registry, direct_vm, direct_bob)
    assert registry.get_source("source-1")["status"] == "CHALLENGED"
    assert registry.get_challenge("challenge-1")["previous_status"] == "CHANGED"

    direct_vm.clear_mocks()
    direct_vm.sender = direct_bob
    direct_vm.mock_llm(
        "resolving a SourceLock bonded challenge",
        '{"verdict":"REJECTED","rationale":"The counter-evidence does not prove a material weakening."}',
    )
    registry.resolve_challenge("challenge-1")

    source = registry.get_source("source-1")
    challenge = registry.get_challenge("challenge-1")
    summary = registry.get_registry()
    assert source["status"] == "CHANGED"
    assert source["active_challenge_id"] == ""
    assert challenge["status"] == "REJECTED"
    assert challenge["bond"] == "0"
    assert summary["changed_sources"] == "1"
    assert summary["challenged_sources"] == "0"
    assert summary["stable_sources"] == "0"
    assert summary["bonds_paid"] == "2"


def test_retire_source_requires_expiry(direct_deploy, direct_vm, direct_alice):
    registry = direct_deploy("contracts/SourceLock.py")
    _lock_source(registry, direct_vm, direct_alice)

    direct_vm.sender = direct_alice
    direct_vm.warp("2027-01-01T00:00:00Z")
    with direct_vm.expect_revert("Source cannot retire before expiry"):
        registry.retire_source("source-1")

    source = registry.get_source("source-1")
    assert source["status"] == "LOCKED"
    assert source["bond"] == "5"
    assert registry.get_registry()["bonds_paid"] == "0"


def test_retire_source_after_expiry_returns_claimant_bond(direct_deploy, direct_vm, direct_alice):
    registry = direct_deploy("contracts/SourceLock.py")
    direct_vm.warp("2025-01-01T00:00:00Z")
    _lock_source(registry, direct_vm, direct_alice, expires_at=PAST_EXPIRY)

    direct_vm.sender = direct_alice
    direct_vm.warp("2026-02-01T00:00:00Z")
    registry.retire_source("source-1")

    source = registry.get_source("source-1")
    summary = registry.get_registry()
    assert source["status"] == "RETIRED"
    assert source["bond"] == "0"
    assert summary["bonds_paid"] == "5"
