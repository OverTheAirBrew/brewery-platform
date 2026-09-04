# M2 - Build and CI Reliability

Goal: make local and CI builds deterministic and contributor-friendly.

## Issue-sized tasks

- [ ] Add a root `build:force` script that bypasses turbo cache safely.
  - Scope: script should not forward invalid flags to package-local tsc builds.
  - Done when: maintainers can force clean workspace builds with one command.

- [ ] Add canonical local validation script sequence.
  - Scope: codegen, build, lint, unit, e2e ordering.
  - Done when: contributors can run one documented verification path.

- [ ] Ensure CI runs codegen before backend build.
  - Scope: enforce dependencies so generated files are always available.
  - Done when: backend build does not fail due to missing generated types.

- [ ] Add generated-artifact consistency check.
  - Scope: fail CI if committed generated outputs are stale.
  - Done when: generated files and source schemas remain in sync.

- [ ] Add CI matrix for lint, typecheck, unit, and e2e.
  - Scope: separate jobs with clear failure surfaces.
  - Done when: failures are fast to diagnose.
