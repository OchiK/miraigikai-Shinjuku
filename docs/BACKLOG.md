# Initial Backlog

## P0

### P0-1 Local boot
Acceptance:
- Supabase starts
- web/admin start
- seed reset passes

### P0-2 Branding compliance
Acceptance:
- No Team Mirai logo
- No original primary palette
- Required disclaimer visible
- Own source repository linked

### P0-3 Shinjuku config
Acceptance:
- title `みらい議会＠新宿区`
- `cityName = 新宿区`
- `councilName = 新宿区議会`
- Shinjuku official URLs
- AI chat enabled
- AI interview disabled
- party section disabled

### P0-4 Remove Kawasaki references
Acceptance:
`grep` results are only source comments/history where intentional.

## P1

### P1-1 2026 R2 session fixture
Acceptance:
- every published bill has stable external key
- source URLs saved
- result saved

### P1-2 Source provenance
Acceptance:
each derived content can trace back to source.

## P2

### P2-1 Restore easy difficulty
Acceptance:
- migration succeeds on fresh DB
- selector shows やさしい/ふつう/くわしく
- old normal/hard data still works

### P2-2 Easy Japanese prompt
Acceptance:
- no added policy claims
- numbers/dates preserved
- jargon explained
- sentences simplified

## P3

### P3-1 i18n UI
Acceptance:
language switch works without losing current bill.

### P3-2 Translation schema
Acceptance:
- locale unique per source content
- stale detection possible
- generated/reviewed status stored

### P3-3 Seven locales
Acceptance:
ja/en/zh-Hans/ko/ne/my/vi available.

## P4

### P4-1 Chat guardrails
Acceptance:
- bill context only
- off-topic blocked before paid call where possible
- answer language follows user
- source shown

### P4-2 Cost ceiling
Acceptance:
- per-user daily cap
- total daily cap
- total monthly cap
- clear UI when cap reached

## P5

### P5-1 Automation
Acceptance:
new Shinjuku page/PDF change creates draft, never silently overwrites reviewed content.
