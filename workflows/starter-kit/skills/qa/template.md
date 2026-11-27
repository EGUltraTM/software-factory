# QA-Bericht: <PROJ-ID> <Feature-Name> (#<issue-nr>)

**Spec:** [spec.md](spec.md) · **Design:** [design.md](design.md)
**Getestet am:** YYYY-MM-DD · **Commit:** `<sha>`

## Ergebnis
**Produktionsreif:** Ja / Nein
- Akzeptanzkriterien: X von Y bestanden
- Bugs: Critical 0 · High 0 · Medium 0 · Low 0

## Akzeptanzkriterien
- ✅ AK-1: …
- ❌ AK-2: … (siehe Bug B-1)

## Edge Cases
- ✅ EC-1: …

## Bugs
- **B-1 (High):** Beschreibung · Schritte: 1. … 2. … · Erwartet: … · Tatsächlich: …

## Sicherheit
- Keine Auffälligkeiten / Befund: …

## Automatisierte Tests
- Unit: … · E2E: …

## Oberflächen-Review
<!-- Pflicht. Entweder der Abschnitt aus dem Skill pionea-review oder genau diese Zeile: -->
<!-- Oberflächen-Review: entfällt, es wurden keine Oberflächen-Dateien geändert. -->

**Geltungsbereich:** geprüfte Dateien, Oberflächen und Verwender · nicht geprüfte Verwender: n

| Bereich | Ergebnis | Nachweis |
| --- | --- | --- |
| A Barrierefreiheit | Geprüft | Prüfskript `/work/review-<name>.json`, Tab-Durchgang |
| B Layout und Abstände | Geprüft | Screenshots 375 px / 1440 px |
| C Typografie | Geprüft | … |
| D Farben und Kontrast | Geprüft | Prüfskript, Paare gemessen |
| E Texte | Geprüft | Begriffsinventar, Diff gelesen |
| F Zustände | Geprüft | leer / laden / fehler / lang / 375 px gerendert |
| G Kaputtmach-Versuche | Geprüft | Worst-Case-Fixture `…` |

| Fund | Schwere | Stelle | Behebung |
| --- | --- | --- | --- |
| … | Hoch / Mittel / Niedrig | `pfad/datei.tsx:zeile` | …, Commit `<sha>` |

**Annahmen:** … (oder „keine“)
**Außerhalb des Auftrags:** … (höchstens drei, nicht behoben; Abschnitt entfällt, wenn leer)

## Screenshots
![…](…)
