# M3 - Plugin Developer Experience

Goal: make plugin contribution predictable with minimal hidden conventions.

## Issue-sized tasks

- [ ] Publish plugin authoring guide.
  - Scope: config shape, metadata requirements, module wiring, naming conventions.
  - Done when: a contributor can create a plugin from docs alone.

- [ ] Add a minimal example plugin package.
  - Scope: one device plugin and one logic plugin example.
  - Done when: contributors can copy and adapt a known-good template.

- [ ] Replace plugin directory scan with deterministic manifest registration.
  - Scope: explicit plugin list and load order.
  - Done when: plugin boot behavior is stable and review-friendly.

- [ ] Improve startup diagnostics for plugin loading.
  - Scope: log loaded plugins, skipped plugins, and validation failures clearly.
  - Done when: plugin boot issues are actionable without deep debugging.

- [ ] Add plugin extension contract tests.
  - Scope: metadata validity, duplicate detection, provider registration checks.
  - Done when: plugin regressions are caught early.
