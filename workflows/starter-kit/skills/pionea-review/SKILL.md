---
name: pionea-review
description: Prüft geänderte Oberflächen (tsx/jsx/astro/css/html, Payload-Admin-Komponenten) gegen die Pionea-Maßstäbe für Layout, Typografie, Farben und Kontrast, Barrierefreiheit, Texte und Zustände, versucht sie mit realistischen Extremdaten kaputt zu machen und behebt jeden Fund. Pflicht in der qa-Phase der Factory, sobald Oberflächen-Dateien geändert wurden.
argument-hint: "Feature-Ordner oder Liste der geänderten Dateien"
user-invocable: true
---

# Oberflächen-Review (Factory-Modus)

## Rolle

Du prüfst die Oberfläche, die dieser Branch ändert, so streng wie ein eigener Reviewer, der nichts davon gebaut hat. Du läufst unbeaufsichtigt im Factory-Container: Niemand liest mit, niemand beantwortet Fragen, niemand entscheidet später über deine Funde. Deshalb gilt:

- **Jeder Fund wird behoben, auch kleine.** Ein Fund, der nur gemeldet wird, ist kein abgeschlossenes Review. Die Schwere bestimmt die Reihenfolge, nicht ob behoben wird.
- **Belege statt Geschmack.** Ein Fund braucht etwas Zeigbares: eine Datei und Zeile, einen gemessenen Wert, einen Screenshot, ein Element ohne Namen im Barrierefreiheitsbaum. Eine Dichte, ein Radius oder ein Tonfall, der dir nur nicht gefällt, ist kein Fund.
- **Im Idiom des Projekts.** Jede Behebung nutzt die Komponentenbibliothek, die Tokens, die Spacing-Skala und die Textkonventionen, die das Repo schon hat. Nie ein anderes Styling-System einführen, nie neue Schriften vorschlagen.
- **Die Änderung, nicht die Codebasis.** Geprüft wird, was der Branch geändert hat, plus die Oberflächen, auf denen diese Änderungen erscheinen. Vorbestehende Probleme in berührten Dateien gehören dazu und werden behoben. Vorbestehende Probleme außerhalb des Geltungsbereichs werden nicht angefasst, sondern am Ende des Berichts unter „Außerhalb des Auftrags“ genannt, höchstens drei.
- **Nichts im Chat fragen.** Eine Designentscheidung mit mehreren richtigen Antworten (umbrechen oder kürzen, Platzhalter oder Zeile weglassen) triffst du selbst nach den Regeln unten, hältst sie im Bericht als Annahme fest und baust sie so, dass sie leicht zu ändern ist.

Korrektheit, Sicherheit, Tests und Leistung prüft der qa-Skill an anderer Stelle. Nenne so einen Fund einmal, verweise dorthin und lass ihn hier weg.

## Wann der Skill gilt

Ermittle die geänderten Dateien gegen den Standard-Branch:

```bash
git fetch --quiet origin "$FACTORY_DEFAULT_BRANCH"
git diff --name-only "origin/$FACTORY_DEFAULT_BRANCH"...HEAD
```

Der Skill ist **Pflicht**, wenn darunter mindestens eine Oberflächen-Datei ist:

| Art | Muster |
| --- | --- |
| Komponenten und Seiten | `*.tsx`, `*.jsx`, `*.astro`, `*.vue`, `*.svelte`, `*.html`, `*.mdx` |
| Styles | `*.css`, `*.scss`, `*.pcss`, Tailwind-Konfiguration, `globals.css`, Theme- und Token-Dateien |
| Payload-Admin | eigene Admin-Komponenten (`admin.components` in Collections oder in `payload.config`), Feld-Komponenten, Dashboard-Views, Beschreibungen und Labels in Collection-Definitionen |
| Texte der Oberfläche | Übersetzungs- oder Nachrichtendateien (`locales/`, `messages/`, `*.po`), E-Mail-Vorlagen mit HTML |

Nicht dazu zählen Lockfiles, Snapshots, generierte Ausgaben (`dist/`, `.next/`, `*.gen.*`), Bilder und Schriftdateien. Eine neu eingebundene Schrift oder ein neues Bild wird über den Code geprüft, der sie referenziert.

Ist **keine** Oberflächen-Datei geändert, entfällt der Skill. Dann steht im `qa-report.md` und im PR-Text wörtlich: „Oberflächen-Review: entfällt, es wurden keine Oberflächen-Dateien geändert.“ Diese eine Zeile ist Pflicht, damit die Abnahme den Unterschied zwischen „nicht nötig“ und „vergessen“ sieht.

## Wirkungsradius

Eine geänderte Datei ist ein Beleg, nicht das Prüfobjekt. Geprüft werden die **Oberflächen, auf denen sie erscheint**:

- Eine geänderte Seite oder Route: die Seite selbst in allen Zuständen.
- Eine geänderte Komponente: ihre direkten Verwender (eine Ebene, `git grep` nach dem Import), höchstens fünf, zuerst Seiten und Layouts, dann nach Zahl der Verwender.
- Ein geändertes Token, eine Theme-Variable oder ein geteilter Baustein (Button, Input, Card): zwei Ebenen, weil eine Zeile das ganze Produkt erreicht.

Nenne im Bericht, welche Verwender du geprüft hast und wie viele nicht.

## Vorbereitung

1. Lies, was das Projekt über seine Oberfläche festgelegt hat: `docs/design-system.md`, `docs/stack.md` mit den genannten Stack-Packs, `CLAUDE.md` oder `AGENTS.md`, Token-Dateien, die Komponentenbibliothek. Eine dokumentierte Konvention entscheidet Geschmacksfragen, hebt aber nie eine Regel dieses Skills auf.
2. Inventarisiere die Begriffe der bestehenden Oberfläche: welches Substantiv für welches Objekt, welches Verb für welche Aktion, welche Schreibweise (Satzschreibung ist Standard). Neue Texte verwenden diese Begriffe.
3. Der Dev-Server läuft bereits aus dem qa-Skill. Nutze seine URL. Chromium und Playwright sind im Container vorhanden.
4. Starte das Prüfskript dieses Skills einmal pro geänderter Seite, es liefert Messwerte für mehrere Punkte der Liste:

```bash
node ~/.claude/skills/pionea-review/pruefskript.js "http://localhost:$PORT/<pfad>" --zoom 200 > /work/review-<name>.json
```

Es misst bei 375 px und 1440 px, jeweils auch bei 200 % Zoom, horizontalen Überlauf, abgeschnittenen Text, interaktive Elemente ohne zugänglichen Namen, Fokus-Stopps ohne sichtbaren Fokus, zu kleine Trefferflächen, Kontrastpaare unter 4,5:1 bzw. 3:1 sowie `lang`, Überschriften-Reihenfolge, fehlende Formular-Labels und ASCII-Ersatzschreibungen für Umlaute. Was es nicht sieht (Text auf Bildern, Bedeutung einer Farbe, Tonfall), prüfst du selbst.

## Entfernte Zeilen lesen

Regressionen sind im Endzustand unsichtbar. Lies die `-`-Seite des Diffs auf diese Signale und prüfe für jedes, ob die Änderung einen gleichwertigen Ersatz enthält:

```bash
git diff -U0 "origin/$FACTORY_DEFAULT_BRANCH"...HEAD -- . ':(exclude)*.lock' ':(exclude)*lock.json' \
  | grep -E '^-' | grep -vE '^--- ' \
  | grep -E 'aria-|role=|alt=|htmlFor|for=|focus|outline|tabindex|prefers-|lang=|dir=|text-wrap|line-clamp|overflow-wrap|tabular-nums|min-width|sr-only'
```

Gleichwertiger Ersatz ist zum Beispiel ein `div` mit `role="button"`, das zu einem `<button>` wurde, oder ein `outline`, das durch einen `box-shadow`-Ring auf demselben `:focus-visible` ersetzt wurde. Fehlt der Ersatz, ist es ein Fund mit Status „Regression“.

## Prüfliste

Arbeite jeden Block ab und halte pro Block fest, was du geprüft hast und womit. Die Reihenfolge ist Absicht: Grundlegendes zuerst, damit Politur nichts verdeckt.

### A. Barrierefreiheit

Zwei Durchgänge: einmal nur mit der Tastatur (jeder Ablauf endet ohne Maus), einmal aus Sicht eines Screenreaders (jedes Element hat Name, Rolle und Zustand).

| Prüfpunkt | So prüfen | Behebung |
| --- | --- | --- |
| Jedes interaktive Element hat einen zugänglichen Namen | Prüfskript `ohneNamen`; Icon-Buttons im Diff | `aria-label` mit der Aktion („Projekt löschen“), nie das Symbol („Mülleimer“); sichtbarer Text gehört in den Namen |
| Jeder Fokus-Stopp hat einen sichtbaren Fokus | Prüfskript `fokusOhneRing`; mit Tab durch die Seite | `:focus-visible` stylen, nie `outline: none` ohne verifizierten Ersatz, Ring mit 3:1 gegen alle Nachbarfarben |
| Alles per Zeiger Erreichbare geht auch per Tastatur | Hover-Menüs, Drag-Interaktionen, Karten mit `onClick` | Native `<button>` oder `<a href>`; Escape schließt Overlays; für Drag eine Schaltflächen-Alternative |
| Natives Element vor ARIA | `div onClick`, `role="button"` ohne `onKeyDown`, positiver `tabindex` | `<button>`, `<a href>`, `<dialog>` mit `showModal()`; `tabindex` nur `0` oder `-1` |
| Jedes Formularfeld hat ein `<label>` | Prüfskript `felderOhneLabel`; Platzhalter ist kein Label | `<label for>` oder umschließendes `<label>`; `autocomplete`, `type`, `inputmode` setzen; Einfügen nie blockieren |
| Fehler sind zugänglich | Absenden mit leeren Pflichtfeldern | `aria-invalid`, `aria-describedby` auf den Fehlertext, Fokus auf das erste fehlerhafte Feld; Absende-Button nie bis zur Gültigkeit deaktivieren |
| Bedeutung nie nur über Farbe | Status-Badges, Fehlerzustände, Pflichtmarkierung | Zusätzlich Icon, Text oder Unterstreichung |
| Bewegung respektiert `prefers-reduced-motion` | Transitions und Animationen im Diff | Bewegung nur unter `no-preference`, darunter Opacity-Überblendung; Autoplay und Parallax aus |
| Dynamische Inhalte werden angekündigt | Toasts, Ergebniszähler, Ladeende | `role="status"` für Ruhiges, `role="alert"` nur für dringende Fehler; Region vor der Textänderung rendern |
| Bilder haben passenden Alternativtext | `<img>` im Diff | Dekorativ `alt=""`, informativ beschreibt die Bedeutung, funktional die Aktion |
| Struktur trägt | Prüfskript `ueberschriften`; `<main>` vorhanden | Überschriften beschreiben ihren Abschnitt und steigen stufenweise ab; genau ein `<main>` |
| Trefferflächen mindestens 24 × 24 px, Ziel 40/44 px | Prüfskript `kleineZiele` | Padding oder Pseudo-Element vergrößern, Flächen dürfen sich nie überlappen |
| Zoom 200 % und 375 px ohne Verlust | Prüfskript `ueberlauf` und `abgeschnitten`; Seite bei 375 px mit Zoom | `min-height` statt `height`, `max-width` statt `width`; nie `maximum-scale=1` oder `user-scalable=no` |

### B. Layout und Abstände

| Prüfpunkt | So prüfen | Behebung |
| --- | --- | --- |
| Kein horizontaler Überlauf bei 375 px | Prüfskript `ueberlauf`, Screenshot 375 px | `minmax(0, 1fr)` auf Grid-Spalten, `min-width: 0` auf Flex-Kindern mit Text, `width: 100%` statt `100vw` |
| Gruppen durch Abstand, nicht durch Linien | Abstand zwischen Gruppen mindestens das Doppelte des Abstands innerhalb | Spacing-Schritte des Projekts; Trennlinien nur, wo Abstand allein nicht trägt |
| Bedienelemente unterscheiden sich vom Inhalt | Links und Buttons, die wie Fließtext aussehen | Hintergrundform, Rahmen, Unterstreichung oder fester Platz in einer Leiste |
| Gemeinsame Kanten | Linke Kanten und Abstände pro Verschachtelungsebene | Eine Spacing-Stufe pro Ebene, kein Einzelwert |
| Reihenfolge nach Wichtigkeit, DOM gleich Sichtbar | `order`, `row-reverse`, Grid-Platzierung im Diff | Quellreihenfolge ändern statt visuell umsortieren |
| Eine Primäraktion pro Ansicht | Zwei gefüllte Buttons nebeneinander | Nebenaktionen neutral, ab vier hinter ein Menü |
| Versteckter Inhalt hat einen Hinweis | Horizontale Scroller, Akkordeons, gekürzte Werte | Nächstes Element 16 bis 32 px hervorlugen lassen, Disclosure-Steuerung, Weg zum vollen Wert |
| Platz für Textwachstum | Feste `width` oder `height` auf Boxen mit Text, einwortige Button-Labels | `max-width` und `min-height`, Zeilen dürfen umbrechen |
| Logische Eigenschaften | `margin-left`, `padding-right`, `text-align: left` im Diff | `margin-inline-start`, `padding-inline-end`, `text-align: start` |
| Volle Höhe auf Mobil | `height: 100vh` | `100dvh` |
| Fixe Kopfzeile verdeckt nichts | Ankerziele und Fokus unter Sticky-Header | `scroll-padding-block-start` in Höhe des Headers |

### C. Typografie

| Prüfpunkt | So prüfen | Behebung |
| --- | --- | --- |
| Zeilenhöhe nach Rolle, unitless | Display 1.1, Überschriften 1.2 bis 1.3, Fließtext 1.5 bis 1.6; alles ab drei Zeilen mindestens 1.4 | Unitless-Werte statt `px` oder `rem` |
| Schriftgrößen aus der Skala, in `rem` | Einzelwerte im Diff, Body unter 16 px, Captions unter 12 px | Stufe der Projektskala; Fließtext ab 16 px, UI-Text ab 13 px |
| Eingabefelder mindestens 16 px auf Mobil | `<input>` mit 14 px ohne Mobil-Override | `text-base sm:text-sm` oder gleichwertig, sonst zoomt iOS die Seite |
| Gewicht unter 18 px mindestens 400 | `font-light`, `font-thin`, Gewicht 100 bis 300 auf kleinem Text | 400 oder schwerer |
| Überschriften-Größen steigen mit der Ebene ab | h2 größer als h1 im selben Abschnitt | Ebene auf die Skala abbilden |
| Zeilenlänge 60 bis 75 Zeichen bei Fließtext | Lange Absätze ohne `max-width` | `max-width` in `ch` oder Skalenwert |
| Bewusst umbrechen | Lange URLs, E-Mails, Komposita | `overflow-wrap: anywhere` auf dem Element, `text-wrap: balance` nur auf Überschriften, `text-wrap: pretty` auf Absätzen, `white-space: nowrap` auf Badges |
| Gekürzt nur mit Rückweg | `truncate`, `line-clamp` im Diff | `title`, Tooltip, Detailansicht oder Aufklappen; Zahlen, Beträge und Daten nie kürzen |
| Tabellenziffern auf veränderlichen Werten | Zähler, Preise, Spalten mit Zahlen | `font-variant-numeric: tabular-nums` |
| Kein Blocksatz, Text auswählbar | `text-align: justify`, `select-none` auf Textcontainern | `text-align: start`; `user-select: none` nur auf Drag-Flächen |
| Sprache gesetzt | `<html lang="de">` (Prüfskript `lang`) | `lang` setzen, bei gemischter Richtung `<bdi>` |
| Typografische Zeichen | `...`, `--`, `"` in gerenderten Strings | `…`, Gedankenstrich „–“ mit Leerzeichen, deutsche Anführungszeichen „…“; Code behält gerade Anführungszeichen |

### D. Farben und Kontrast

| Prüfpunkt | So prüfen | Behebung |
| --- | --- | --- |
| Text 4,5:1, großer Text und Bedienelement-Grenzen 3:1 | Prüfskript `kontrast` misst das tatsächlich gerenderte Paar; Text auf Bildern oder Verläufen selbst messen | Helligkeit ändern, nicht den Farbton; nie einen gemessenen Wert raten |
| Tokens statt Literale | Hex, `rgb(`, `oklch(` oder `bg-blue-600` in Komponentendateien | Semantisches Token des Projekts verwenden oder anlegen; Primitive gehören nicht in Komponenten |
| Token nur in seiner Rolle | Rahmen-Token als Textfarbe, Text-Token als Hintergrund | Token für die fehlende Rolle anlegen |
| Eine Farbe, eine Bedeutung | Gefahrenfarbe auf einer nicht zerstörenden Aktion, Status-Farbton nahe am Akzent | Bedeutung konsistent halten, Abstand von mindestens 15° Farbton |
| Genau eine gefüllte Primäraktion | Mehrere gefüllte Buttons als Gleichrangige | Peers neutral; Farbe auf den Hintergrund, nicht auf den Text |
| Dunkelmodus, wenn das Projekt ihn hat | Beide Themes rendern, Tokens in beiden Blöcken vorhanden | Fehlende Dunkel-Tokens ergänzen, Paare in beiden Modi messen |
| Text auf halbtransparenter Fläche | `/50`, `rgba(`, `color-mix` mit `transparent` unter Text | Gerendertes Ergebnis messen oder solides Token |

### E. Texte

Die Oberfläche ist deutsch, außer das Projekt ist ausdrücklich mehrsprachig. Dann gilt jede Sprache für sich, und jede neue Zeichenkette braucht einen Eintrag in jedem Katalog.

| Prüfpunkt | So prüfen | Behebung |
| --- | --- | --- |
| Echte Umlaute und ß | Prüfskript `asciiUmlaute`; `grep -rnE '\b(ae|oe|ue)\b|Ae|Oe|Ue|ss\b'` in neuen Strings mit Augenmaß | `ä ö ü Ä Ö Ü ß` schreiben; Ausnahmen nur in URLs, Dateinamen und Code |
| Keine erfundenen Aussagen | Jede Zahl, jeder Kundenname, jede Auszeichnung, jedes Versprechen und jeder Preis in neuen Texten | Nur, was Spec, Repo oder bestehende Texte belegen. Alles andere streichen oder durch eine belegte Aussage ersetzen. Keine Zielgruppen-Behauptungen, die nirgends stehen |
| Eine Stimme, ein Vokabular | Neue Begriffe gegen das Inventar aus der Vorbereitung | Das vorhandene Wort nehmen; ein Synonym ist nur ein Fund, wenn dieselbe Sache zwei Namen hat |
| Buttons beginnen mit dem Verb | „OK“, „Ja“, „Nein“, „Weiter!“ | „Speichern“, „Entwurf senden“, „Projekt löschen“ |
| Links nennen das Ziel | „Hier klicken“, zwei gleiche „Mehr erfahren“ | „Zur Preisübersicht“, „Mehr zu Exporten“ |
| Fehler sagen, wie es weitergeht, am Ort des Fehlers | „Etwas ist schiefgelaufen“, „Ups“, Ausrufezeichen | Was fehlgeschlagen ist plus der nächste Schritt: „Speichern nicht möglich. Verbindung prüfen und erneut versuchen.“ |
| Leere Zustände zeigen nach vorn | „Keine Ergebnisse.“ | Was dieser Ort ist, wie er sich füllt, eine klare Aktion; gefilterte Leere nennt den Filter und bietet den Ausweg |
| Zerstörende Aktionen: Rückgängig oder Bestätigung | Löschen ohne Dialog und ohne Undo | Umkehrbar und häufig: sofort ausführen und „Rückgängig“ anbieten. Sonst Dialog, dessen Titel Aktion und Objekt nennt und dessen Buttons Verb plus Objekt tragen, nie „Ja“ und „Nein“ |
| Strings ganz, Plural über Regeln | `"Sie haben " + n + " Nachrichten"`, `n === 1 ? "" : "e"` | Eine Nachricht mit Platzhalter, `Intl.PluralRules`, `Intl.NumberFormat("de-DE")`, `Intl.DateTimeFormat("de-DE")` |
| Eine Schreibweise pro Elementtyp | „Änderungen Speichern“ neben „Änderungen verwerfen“ | Satzschreibung überall, außer das Projekt legt etwas anderes fest |
| Schalter beschreiben den EIN-Zustand | „Keine Benachrichtigungen senden“ | „Benachrichtigungen senden“ |
| Platzhalter zeigen ein Beispiel | „Hier E-Mail eingeben“ | `name@example.com`, `TT.MM.JJJJ` |
| Direkte Ansprache | „Der Nutzer kann …“ | „Sie können …“ bzw. die Anrede, die das Projekt verwendet |

### F. Zustände

Jede geänderte Ansicht wird in jedem Zustand gerendert, der sie erreichen kann. Ein Zustand, der nur im Code existiert, zählt nicht als geprüft.

| Zustand | Was zu sehen sein muss |
| --- | --- |
| Leer | Erklärung und eine Aktion, kein leerer Bereich, kein Skelett ohne Ende |
| Laden | Skelett oder Indikator in der Form des späteren Inhalts, kein Layoutsprung, Indikator mit zugänglichem Namen |
| Fehler | Verständliche Meldung mit nächstem Schritt, kein roher Fehlertext, Bedienelemente bleiben erreichbar |
| Teilweise | Optionale Felder teils gefüllt, teils leer: keine verwaisten Striche, keine leeren Zeilen, Zeilen bleiben ausgerichtet |
| Lang | Sehr viele Einträge: Scrollen, Paginierung oder Virtualisierung, Zähler korrekt |
| Mobil 375 px | Alles erreichbar, kein horizontaler Überlauf, Hover-Aktionen auch per Tipp erreichbar |
| 1440 px | Zeilenlänge gedeckelt, Inhalt nicht an gegenüberliegende Kanten gestrandet |
| Dunkelmodus | Nur, wenn das Projekt ihn hat: keine hartkodierten Farben, Rahmen und Logos sichtbar |
| Ohne Rechte | Deaktivierte Aktionen: Zeile bleibt gleich aufgebaut, Grund erkennbar |

Screenshots je Ansicht bei 375 px und 1440 px mit `factory-screenshot <url> <name> "<Zustand>" --width 375 --height 812` bzw. `--width 1440 --height 900`. Die Markdown-Zeilen gehören in den Bericht.

### G. Kaputtmach-Versuche

Demo-Daten werden so gewählt, dass das Design gut aussieht: Namen, die in eine Zeile passen, Zähler ohne Tausendertrennzeichen, jedes optionale Feld gefüllt. Hier nimmst du diese Wahl zurück.

1. **Oberfläche kartieren.** Liste jeden Wert, den die geänderte Ansicht rendert, mit Quelle, Typ, Limit (Zod-Schema, Payload-Feld, Datenbankspalte, `maxLength`) und ob er optional ist. Zähler in Überschriften, relative Zeiten, Badge-Texte, Avatare und die Länge der Liste selbst gehören dazu. Ein Feld ohne Limit ist ein Fund („unbegrenzt“) und bekommt ein Limit, das Frontend und Backend gleich setzen.
2. **Worst-Case-Daten bauen.** Pro Feld einen realistischen Extremwert aus [worst-case.md](worst-case.md). Ein Datensatz trifft viele Zeilen gleichzeitig, verteilt über die ersten Zeilen (Zeile 1 der lange Name, Zeile 2 die lange E-Mail, Zeile 3 der Zwei-Buchstaben-Name). Dazu die Fälle Leer, genau Eins und Riesig.
3. **Daten ändern, nicht die Komponente.** Die Extremwerte kommen über dieselbe Grenze wie die Demo-Daten: Fixture, Mock, Props, Seed, API-Stub oder Payload-Testeintrag. Nie Markup oder CSS verändern, um einen Bruch zu erzeugen. Kein Umschalter in Produktionscode; was du dafür anlegst, bleibt nur als Testdaten oder E2E-Fixture im Repo.
4. **Hinsehen.** Bei 375 px, bei der echten Containerbreite (eine Seitenleiste ist keine Vollbreite), bei 1440 px und mit 200 % Zoom. Screenshot je Breite.
5. **Signaturen zuordnen.** Jeder Bruch hat Ursache und Behebung:

| Was zu sehen ist | Ursache | Behebung |
| --- | --- | --- |
| Avatar oder Icon zum Oval gequetscht | Flex-Kind schrumpft | `flex-shrink: 0` auf Avatar, Icon und jede Box mit fester Größe |
| Text läuft aus der Box statt zu umbrechen | Flex- oder Grid-Kind mit `min-width: auto` | `min-width: 0` auf der Textspalte, `minmax(0, 1fr)` im Grid |
| E-Mail oder URL läuft über den Rand | Keine Umbruchstelle | `overflow-wrap: anywhere` auf dem Element |
| Aktion am Zeilenende verschwindet | Mitte nimmt allen Platz | `min-width: 0` auf der Mitte, `flex-shrink: 0` auf der Aktion |
| Badge bricht auf zwei Zeilen | Badge darf schrumpfen | `white-space: nowrap; flex-shrink: 0`, und festlegen, was stattdessen weicht |
| „1 Einträge“, „0 Eintrag“ | Hartkodierter Plural | `Intl.PluralRules` oder getrennte Strings |
| `1284`, `NaN`, `undefined`, `0.30000000000000004` | Rohe Zahl gerendert | `Intl.NumberFormat("de-DE")`, `null` abfangen |
| Falsche Initialen („J“ für „Jo“, „�“ bei Emoji) | `split(' ')[0][0]` | Grapheme über `Intl.Segmenter`, erstes plus letztes Wort, Fallback-Icon |
| Verwaister Strich, wo das optionale Feld fehlt | Platzhalter für fehlenden Wert | Zeile weglassen oder Höhe bewusst reservieren |
| Übersetzte Button-Beschriftung läuft über | Feste Breite | Breite aus dem Inhalt mit `min-width` |
| Diakritika oben oder unten abgeschnitten | Enge Zeilenhöhe mit `overflow: hidden` | Zeilenhöhe lockern oder Textboxen nicht beschneiden |
| Kaputtes Bild im Avatar | Kein `onError`-Fallback | Initialen als Fallback, `object-fit: cover` |
| Gekürzter Text ohne Weg zum Ganzen | Nur `text-overflow: ellipsis` | `title` oder Tooltip plus voller Wert in der Detailansicht |
| 1 000 Zeilen ruckeln | Jede Zeile gerendert | Virtualisieren oder paginieren |
| Rohe `<b>`, `&amp;` oder `**fett**` sichtbar | Falsche Escaping-Ebene | Einmal beim Rendern escapen, nie `dangerouslySetInnerHTML` mit Nutzerdaten |

6. **Kürzen, umbrechen oder klammern** entscheidest du pro Feld: Umbrechen bei allem, was der Nutzer zum Erkennen ganz braucht (Namen, Titel). Am Ende kürzen bei Nebeninformation, deren Anfang die Bedeutung trägt. In der Mitte kürzen, wenn sich Werte am Ende unterscheiden (Dateinamen, Hashes, E-Mails mit gleicher Domain). `line-clamp` für mehrzeilige Vorschauen in Karten. Zahlen, Beträge und Daten nie kürzen.

## Schwere

- **Hoch:** blockiert eine Aufgabe, führt in die Irre, versteckt Inhalt oder Bedienelemente, riskiert Datenverlust oder ist ein systemischer Fehler in einem geteilten Baustein.
- **Mittel:** schadet Verständnis, Effizienz, Anpassungsfähigkeit oder Konsistenz spürbar.
- **Niedrig:** einzelne Politur mit geringer Auswirkung.

Diese Symptome sind **immer Hoch**, auch auf einer Nebenfläche: ein Bedienelement ohne zugänglichen Namen; ein Fokus-Stopp ohne sichtbaren Fokus; ein Weg, der per Zeiger geht und per Tastatur nicht; Bewegung, die `prefers-reduced-motion` ignoriert; Inhalt oder Bedienelement bei 375 px oder 200 % Zoom abgeschnitten, überlappt oder unerreichbar; Text, dessen gemessenes Kontrastpaar den geforderten Wert verfehlt; Bedeutung nur über Farbe; eine zerstörende Aktion ohne Bestätigung, Rückgängig oder eigene Kennzeichnung; gekürzter Inhalt ohne Weg zum Ganzen; ein Fehler ohne Weg zur Behebung; eine Semantikfarbe gegen ihre Bedeutung; ein Zustandswechsel nur über Bewegung; eine erfundene Aussage im Text.

Die Schwere ordnet die Reihenfolge der Behebung. **Behoben wird alles.**

## Beheben

1. Nimm die günstigste Behebung, die wirkt, in dieser Reihenfolge: **Löschen** (ein Trenner, den Abstand tragen würde, eine Animation auf einer häufigen Interaktion, ein ARIA-Attribut, das das native Element erübrigt), **Plattform nutzen** (natives Element, Browser-Fokusring), **Vorhandenes wiederverwenden** (Token, Spacing-Stufe, Motion-Kurve des Projekts), **Wert korrigieren**, zuletzt **Hinzufügen** (neues Token, Wrapper, Media Query, ARIA).
2. Ein Grundproblem, eine Behebung: Ein falsches Token oder ein geteilter Baustein wird einmal an der Quelle korrigiert, nicht in jeder Verwendung.
3. Nach dem Beheben jeden Zustand erneut rendern, auch mit Demo-Daten: Eine Behebung für den Extremfall darf den Normalfall nicht verschlechtern. Prüfskript erneut laufen lassen, bis es keine Funde mehr meldet.
4. Lint, Typecheck, Tests und Build des Projekts müssen danach grün sein. Die Behebungen werden committet, bevor `factory-verify` läuft:
   `fix(<PROJ-ID oder #nummer>): Oberflächen-Review, <was behoben wurde>`

## Bericht

Der Abschnitt heißt **„Oberflächen-Review“** und steht im `qa-report.md` (beim Bug im PR-Text) sowie im PR-Text. Er enthält in dieser Reihenfolge:

1. **Geltungsbereich:** geprüfte Dateien, geprüfte Oberflächen und Verwender, nicht geprüfte Verwender mit Anzahl.
2. **Abdeckung** als Tabelle, ein Eintrag pro Block A bis G: `Geprüft` mit dem Nachweis (Prüfskript-Lauf, Screenshot, gelesene Datei) oder `Nicht prüfbar` mit Grund. Ein Block ohne Nachweis gilt als nicht geprüft.
3. **Funde** als Tabelle, schwerste zuerst, eine Zeile pro Grundproblem mit allen Stellen:

| Fund | Schwere | Stelle | Behebung |
| --- | --- | --- | --- |
| Icon-Button „Schließen“ ohne zugänglichen Namen | Hoch | `src/components/Dialog.tsx:42` | `aria-label="Dialog schließen"` ergänzt, Commit `a1b2c3d` |
| Zähler „1 Einträge“ bei genau einem Eintrag | Mittel | `src/components/ProjectList.tsx:18` | `Intl.PluralRules` mit getrennten Strings, Commit `a1b2c3d` |
| „Mehr erfahren“ zweimal auf einer Seite | Niedrig | `src/app/preise/page.tsx:77`, `:91` | Linktexte nennen das Ziel, Commit `a1b2c3d` |

   Jede Zeile nennt in „Behebung“ den Commit. Eine Zeile ohne Commit ist kein abgeschlossenes Review. Gibt es keine Funde, steht dort: „Keine Funde. Geprüft wurden A bis G, Nachweise in der Abdeckung.“
4. **Annahmen:** Entscheidungen, die mehrere richtige Antworten hatten, je eine Zeile mit der gewählten Lösung.
5. **Außerhalb des Auftrags:** höchstens drei vorbestehende Probleme außerhalb des Geltungsbereichs, nicht behoben, mit Stelle. Entfällt, wenn es keine gibt.
6. **Screenshots** 375 px und 1440 px je geprüfter Ansicht und Zustand.

## Vor dem Abschluss

| Fehler | Korrektur |
| --- | --- |
| Ein Fund steht in der Tabelle ohne Commit in „Behebung“ | Beheben, committen, Commit eintragen |
| „Niedrig“ als Grund, etwas nicht zu beheben | Die Schwere ordnet nur die Reihenfolge; auch Niedrig wird behoben |
| Ein Kontrastwert, der geschätzt statt gemessen ist | Prüfskript laufen lassen oder das Paar von Hand berechnen |
| Ein Zustand nur im Code gelesen, nicht gerendert | Rendern, Screenshot, dann bewerten |
| Eine geänderte geteilte Komponente ohne geprüften Verwender | Verwender expandieren und die übersprungenen zählen |
| Ein entferntes `aria-label`, `outline` oder `prefers-reduced-motion` ohne Fund und ohne Ersatz | Als Regression behandeln und wiederherstellen |
| Eine Behebung in einem Styling-System, das das Projekt nicht nutzt | Im Idiom des Projekts neu schreiben |
| Fehlender Name oder Fokusring als „Mittel“ eingestuft, weil die Fläche klein ist | Immer Hoch |
| Ein Kaputtmach-Versuch mit Unsinnsdaten („aaaaaaaa“) | Realistische Werte aus [worst-case.md](worst-case.md) oder das Schema-Limit |
| Ein Umschalter oder Worst-Case-Fixture, der in Produktionscode liegt | Nur als Testdaten oder E2E-Fixture behalten |
| Der Abschnitt „Oberflächen-Review“ fehlt im PR-Text | Ergänzen, auch wenn er nur die Entfällt-Zeile enthält |
| Ein Text mit `ae`, `oe`, `ue` statt Umlaut | Umlaut schreiben |
| Eine Aussage über Firma, Kunden, Zahlen oder Preise ohne Beleg in Spec oder Repo | Streichen oder durch die belegte Aussage ersetzen |
