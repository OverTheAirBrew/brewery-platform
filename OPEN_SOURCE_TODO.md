# Open Source Readiness TODO

This checklist focuses on making the backend easier for external contributors to understand, extend, and safely operate.

Milestone view: see `open-source-milestones/README.md`.

## 1. Documentation and Onboarding

- [ ] Rewrite backend README with real project docs (remove Nest starter template)
- [ ] Add quick-start commands for local setup, codegen, build, test, and dev server
- [ ] Add environment variable reference with defaults and examples
- [ ] Add troubleshooting section for common build issues (workspace cache, generated files)
- [ ] Create CONTRIBUTING guide with branch, PR, and commit expectations

## 2. Plugin Developer Experience

- [ ] Create a plugin authoring guide with required exports and metadata fields
- [ ] Document plugin folder/module conventions and naming expectations
- [ ] Add a minimal example plugin package for contributors to copy
- [ ] Replace directory scan plugin loading with deterministic manifest registration
- [ ] Add startup diagnostics that clearly list loaded plugins and failures

## 3. Build and CI Reliability

- [ ] Add a `build:force` script that bypasses turbo cache safely
- [ ] Ensure CI runs codegen before backend build checks
- [ ] Add CI check to verify generated artifacts are current
- [ ] Add CI matrix for lint, typecheck, unit tests, and e2e tests
- [ ] Document canonical local validation command sequence

## 4. Security and Auth Defaults

- [ ] Remove hardcoded dev credentials from users service
- [ ] Add documented dev auth bootstrap flow (seeded dev user or local auth toggle)
- [ ] Replace `console.log` auth error logging with structured Nest logger usage
- [ ] Review API key and JWT middleware behavior for explicit failure modes
- [ ] Add security notes for running in public/open-source environments

## 5. Type Safety and Code Quality

- [ ] Reduce use of `any` in plugin and backend abstractions where practical
- [ ] Introduce stricter lint rules gradually (warn first, then enforce)
- [ ] Add rule strategy for new/changed files to avoid blocking legacy cleanup
- [ ] Add a typed helper layer for repeated provider registration patterns
- [ ] Audit public package exports and generated types for consistency

## 6. Testing and Contract Coverage

- [ ] Add plugin contract tests (metadata validity, config options, provider registration)
- [ ] Add plugin loading tests for failure cases and duplicate detection
- [ ] Add regression tests for generated FTSS message imports/paths
- [ ] Add integration test that boots app with representative plugin set
- [ ] Publish testing conventions for contributors

## 7. Repo Governance and Community

- [ ] Add issue templates (bug report, feature request, plugin proposal)
- [ ] Add pull request template with test/lint checklist
- [ ] Define code owners or maintainership boundaries
- [ ] Add release/versioning guidance for workspace packages
- [ ] Add support channels and response expectations

## Suggested implementation order

1. Documentation and onboarding
2. Build/CI reliability
3. Plugin developer experience
4. Security/auth defaults
5. Testing contracts
6. Governance and templates
