# M5 - Testing and Contracts

Goal: enforce stable behavior with clear contracts for core and plugin layers.

## Issue-sized tasks

- [ ] Add plugin contract test suite.
  - Scope: metadata validation, config option generation, provider wiring.
  - Done when: all plugins pass a shared behavioral baseline.

- [ ] Add plugin module loading failure tests.
  - Scope: missing config export, invalid shape, duplicate IDs/providers.
  - Done when: error paths are intentional and tested.

- [ ] Add regression tests for generated FTSS message imports.
  - Scope: ensure codegen outputs are consumed by runtime modules correctly.
  - Done when: build does not regress on generated import paths.

- [ ] Add end-to-end startup test with representative plugin set.
  - Scope: boot app, resolve device/logic providers, hit type-list endpoints.
  - Done when: plugin integration works end-to-end in CI.

- [ ] Document testing conventions for contributors.
  - Scope: where to add unit vs integration vs e2e tests.
  - Done when: external PRs follow consistent test patterns.
