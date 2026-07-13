# Migrazione documentazione — 2026-07-13

Questo documento descrive la ristrutturazione di README, CHANGELOG e `docs/` applicata per ridurre duplicazione e allinearsi a Keep a Changelog 2.0.

## Obiettivi

| Problema | Soluzione |
|----------|-----------|
| 4 sezioni `[Unreleased]` nel CHANGELOG | Una sola `[Unreleased]` + versioni `X.Y.Z` con date ISO |
| README 285 righe senza TOC | README ≤200 righe, 6 sezioni H2, indice con anchor |
| Duplicazione README ↔ CHANGELOG | README = uso/setup/matrix; CHANGELOG = evoluzione utente |
| Troubleshooting inline | Spostato in `docs/TROUBLESHOOTING.md` |
| Roadmap inline | Consolidata in `docs/ROADMAP.md` |

## Cosa è stato spostato

| Contenuto originale | Nuova collocazione |
|---------------------|-------------------|
| Troubleshooting (tabella README) | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) |
| Roadmap fasi v1–v2.2 | [ROADMAP.md](./ROADMAP.md) |
| Storico dettagliato release | [CHANGELOG.md](../CHANGELOG.md) versioni 1.0.0–2.2.0 |
| Feature flags sparsi | [README § Feature Matrix](../README.md#-scene-e-feature-matrix) |
| Dettaglio shader/Gemini nel README | Solo in CHANGELOG 2.2.0 / ROADMAP; README rimanda a `config.ts` |

## File invariati (riferimento storico)

- `docs/PROMPT_MASTER_v2.0.md` — specifica originale v2.0
- `docs/PROMPT_MASTER_v2.1_Supplementare.md` — specifica v2.1
- `docs/ROADMAP_v2.md` — snapshot fase v2.0 (non aggiornato; usare `ROADMAP.md`)

## Link e manutenzione

### Anchor README

Gli anchor GitHub derivano dai titoli H2 (minuscole, spazi → `-`). Se rinomini una sezione, aggiorna l'indice.

### Link CHANGELOG (compare)

1. Imposta `repository.url` in `package.json` (sostituisci `OWNER`).
2. Esegui `node scripts/sync-changelog-links.mjs`.
3. Crea i tag: `git tag v2.2.0` (e versioni precedenti se necessario).

### Screenshot

Placeholder: `docs/screenshots/terra.png`. Istruzioni in [screenshots/README.md](./screenshots/README.md).

## Regole per aggiornamenti futuri

1. **CHANGELOG** — una sola `[Unreleased]`; categorie: Added, Changed, Deprecated, Removed, Fixed, Security.
2. **README** — niente changelog inline; link a CHANGELOG e ROADMAP.
3. **Nuove feature** — aggiorna Feature Matrix se il flag è scena-specifico.
4. **Nuovi problemi noti** — solo in TROUBLESHOOTING.md.

## Checklist vincoli (completata)

- [x] README ≤ 200 righe
- [x] CHANGELOG date ISO 8601 per versione
- [x] Feature Matrix scena × flag
- [x] TOC con anchor
- [x] Troubleshooting in `docs/`
- [x] Roadmap in `docs/ROADMAP.md`
- [x] Link compare CHANGELOG (placeholder OWNER)
- [x] Lingua italiana
