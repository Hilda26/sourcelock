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
