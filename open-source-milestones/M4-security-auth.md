# M4 - Security and Auth Defaults

Goal: ensure open source defaults are safe while preserving local dev convenience.

## Issue-sized tasks

- [ ] Remove hardcoded credentials from backend auth flow.
  - Scope: use seeded dev users or environment-driven local auth bootstrap.
  - Done when: no plaintext credentials exist in source.

- [ ] Replace console logging in auth guard with structured logger.
  - Scope: avoid leaking sensitive token validation details.
  - Done when: auth failures are logged safely and consistently.

- [ ] Document auth modes for local/dev/prod.
  - Scope: JWT setup, API key behavior, and route protection expectations.
  - Done when: contributors understand secure defaults.

- [ ] Add explicit error handling policy for auth and security events.
  - Scope: user-facing vs internal error detail boundaries.
  - Done when: behavior is consistent across endpoints.

- [ ] Add security checklist for PR reviews.
  - Scope: auth changes, secret handling, dependency risk checks.
  - Done when: security review is repeatable.
