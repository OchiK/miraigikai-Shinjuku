# Phase 0 verification — 2026-09-16

The Shinjuku fork now uses independent branding, explicit non-affiliation notices, and a link to its own public source repository. GitHub workflows target `main`. AI interview badges, bill links, and chat suggestions honor the disabled feature flag.

## Validation

| Check | Result | Evidence |
| --- | --- | --- |
| Locked dependency installation | PASS | `pnpm install --frozen-lockfile` |
| Formatting and lint | PASS | `pnpm lint`; 107 existing warnings remain |
| TypeScript | PASS | `pnpm typecheck` after production build generated Next.js route types |
| Production build | PASS | `pnpm build` for web and admin; Shiki externalization warnings remain |
| Unit tests | PASS | `pnpm test`: 1,198 tests across 138 files (web 762, admin 406, shared 30) |
| Web local operation | PASS | Homepage and bill detail loaded local Supabase data on port 3012 |
| Admin local operation | PASS | Development account login and bill list on port 3013 |
| Mobile layout | PASS | Homepage and bill detail at 390 × 844; document width remained 390px |
| Independent branding | PASS | Original logo, hero, OGP, PWA icons, primary palette; no party promotional links on homepage |
| Interview flag | PASS | No homepage interview badge or bill-detail interview CTA with `aiInterview: false` |
| Attribution | PASS | Footer shows non-affiliation notices and own source link |
| Kawasaki source scan | PASS | No matches in web/src, admin/src, packages TypeScript/TSX/Markdown |
| Public repository | PASS | GitHub repository metadata reports `private: false`, default branch `main` |
| Production deployment | NOT VERIFIED | No deployment or database migration was triggered |
| R2 screenshot upload | NOT VERIFIED | No local R2 configuration; screenshots are included below for PR review |

No database reset or seed write was performed. Existing local data was used; the five-bill fixture and its accuracy/completeness remain Phase 1 work. Bill thumbnail placeholders remain part of that fixture.

## Screenshots

- [Mobile homepage](verification/phase0/home-mobile.png)
- [Desktop homepage](verification/phase0/home-desktop.png)
- [Mobile bill detail](verification/phase0/bill-mobile.png)
- [Mobile footer](verification/phase0/footer-mobile.png)
- [Admin bill list](verification/phase0/admin.png)

The original 34 uncommitted files were backed up and transferred to the isolated `phase0-cleanup` worktree with matching SHA-256 hashes. The main checkout was left clean, and the recovery stash was retained.

The pre-existing `AGENTS.md` path correction is excluded from this PR and remains in the recovery stash and backup. The final Codex review found no actionable regressions; the test-guidelines and code-quality findings were addressed.
