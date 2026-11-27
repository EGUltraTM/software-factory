# Worst-Case-Daten

Realistische Werte, die Oberflächen kaputt machen, geordnet nach der Art des gerenderten Werts. Jeder Wert ist etwas, das ein echter Nutzer erzeugen könnte oder das Limit, das das Schema erlaubt. Für E-Mails und URLs nur `example.com`, `example.org` oder `.test` verwenden, damit kein Testdatensatz auf ein echtes Postfach zeigt.

## Personen und Namen

| Wert | Bricht |
| --- | --- |
| `Aleksandra Wiśniewska-Kowalczyk` | Lang, Bindestrich, Diakritika; bricht auf zwei Zeilen, der Bindestrich ist Umbruchstelle |
| `Christopher Alexander Montgomery III` | Lang mit Suffix; naive Initialen aus erstem und letztem Wort ergeben „CI“ |
| `Hans-Jürgen Freiherr von und zu Guttenberg-Oberammergau` | Deutsches Adelsprädikat, Komposita, Umlaut; Sortierung nach Nachname, Überlauf in einzeiligen Zeilen |
| `Jo` | Zwei Buchstaben; Namensspalte wirkt leer, Initialen „J“ |
| `J` | Ein Buchstabe; sehr kleines Klickziel, wenn der Name der Link ist |
| `Ólafur Darri Ólafsson` | Führender Großbuchstabe mit Akzent; Großschreibung, Sortierung, Initialen „ÓÓ“ |
| `Đặng Thị Ngọc Hân` | Gestapelte vietnamesische Diakritika; von enger Zeilenhöhe mit `overflow: hidden` beschnitten |
| `王秀英` | CJK ohne Leerzeichen; „erstes plus letztes Wort“ findet ein Wort, Umbruch an jeder Stelle |
| `نور الهدى عبد الرحمن` | Rechts-nach-links; Satzzeichen und Icons landen ohne `dir="auto"` auf der falschen Seite |
| `Seán O'Brien-Ó Súilleabháin` | Apostroph und Akzente; Escaping, Initialen, Suche |
| `María José de la Cruz y Fernández` | Kleingeschriebene Partikel; Initialen „Md“, Sortierung nach „Nachname“ |
| `dana` | Alles klein; Initialen trotzdem groß |
| `🦊 Fuchs` | Emoji zuerst; `charAt(0)` liefert ein halbes Surrogatpaar („�“) |
| `👩🏽‍💻 Priya` | ZWJ-Emoji-Sequenz; `.length` ist 7 oder mehr, Slicing zerreißt sie |
| `  Sam   Lee ` | Führende, nachgestellte und doppelte Leerzeichen; Initialen aus leeren Wörtern |
| *(fehlt)* | Kein Name, nur eine E-Mail; die Oberfläche braucht einen Fallback |

## E-Mails, URLs, Kennungen

Unzerbrechliche Zeichenketten: ohne Leerzeichen hat der Browser keine Umbruchstelle.

| Wert | Bricht |
| --- | --- |
| `bartholomew.fitzgerald@northwind-industries-holdings.example.com` | Der Klassiker; schiebt ohne `overflow-wrap: anywhere` jedes Geschwister aus der Zeile |
| `a@b.co` | Kürzeste realistische; ein Layout, das auf lange E-Mails ausgelegt ist, wirkt leer |
| `vorname.nachname+rechnungen-benachrichtigung@example.com` | Plus-Adressierung; Validierung, die `+` ablehnt, Anzeige, die den aussagekräftigen Teil kürzt |
| `buchhaltung@sub.abteilung.region.example.co.uk` | Viele Subdomains, zweiteilige TLD; Logik zur Domain-Extraktion |
| `https://example.com/kunden/mustermann-gmbh/projekte/relaunch-2026/dokumente/9f8e7d6c5b4a?tab=kommentare&filter=offen` | Lange URL; Überlauf, Endkürzung versteckt den unterscheidenden Teil |
| `9f8e7d6c-5b4a-4c3d-8e2f-1a0b9c8d7e6f` | UUID; Breite in Monospace, Kandidat für Mittelkürzung |
| `Angebot Q3 – FINAL (überarbeitet) v12 [freigegeben Rechtsabteilung].pdf` | Dateiname; Endkürzung versteckt Version und Endung, Klammern und Striche in Pfaden |
| `IMG_20250914_183022_HDR_portrait_bearbeitet_bearbeitet.HEIC` | Kameradatei; unzerbrechlich, Endung groß |
| `@a` / `@diesisteinsehrlangerbenutzernamederzulaessigist` | Handle-Extreme |

## Beschriftungen, Titel und Texte aus Daten

| Wert | Bricht |
| --- | --- |
| `Senior Product Design Engineer, Plattform-Infrastruktur` | Langer Titel; bricht in einem Nebenfeld auf drei Zeilen |
| `Einladung vor 12 Tagen abgelaufen` | Langes Status-Badge; Badge bricht oder quetscht die Namensspalte |
| `Benachrichtigungseinstellungen` | Deutsches Kompositum, 30 Zeichen ohne Leerzeichen; Label-Überlauf |
| `Donaudampfschifffahrtsgesellschaftskapitänsmütze` | Noch länger, noch unzerbrechlicher; prüft `overflow-wrap` auf jedem Textelement |
| `Datenschutz- und Sicherheitseinstellungen` | Deutsche Entsprechung von „Privacy & security“; Texte laufen in der Übersetzung rund 30 % länger |
| Zwölf Tags an einem Eintrag: `design`, `frontend`, `q3`, `dringend`, `review-noetig`, … | Tag-Zeilen werden zur Wand; braucht ein „+8“ |
| Ein Tag namens `kundenfeedback-aus-dem-enterprise-onboarding` | Ein Tag breiter als sein Container |
| `Ohne Titel` / leerer String / `   ` | Titel fehlt; eingeklappte Überschrift, Zeile ohne Höhe |
| `<script>alert(1)</script>` / `&amp;` / `**fett**` | Escaping; muss als Text erscheinen |
| `Zeile eins` + Zeilenumbruch + `Zeile zwei` | Umbruch in einem einzeiligen Feld; verdoppelt die Zeilenhöhe oder wird still verworfen |
| Eine eingefügte Beschreibung mit 2 000 Zeichen | `line-clamp`, „Mehr anzeigen“, Wachstum von Textfeldern |

## Zahlen und Beträge

| Wert | Bricht |
| --- | --- |
| `0` | Nullzustände: „0 Mitglieder“, leerer Fortschrittsbalken, Division durch null in Prozenten |
| `1` | Plural: „1 Einträge“, „vor 1 Tagen“ |
| `1284` | Braucht Tausendertrennzeichen: `1.284` |
| `1000000` | Breite des Zähl-Badges; Kompaktform „1 Mio.“ erwägen, wo Genauigkeit nicht zählt |
| `12345678.9` als Betrag | `12.345.678,90 €`; sprengt Summenspalten |
| `-42.5` | Minuszeichen, Rot-Logik, Klammern in Buchhaltungsformaten |
| `0.1 + 0.2` | `0.30000000000000004` roh gerendert |
| `142 %` / `-3 %` | Fortschrittsbalken und Skalen jenseits der Grenzen |
| `null` / `undefined` / `NaN` | Wörtlich gerendert |
| `1.284` (de-DE) gegen `1,284` (en-US) | Hartkodierte Trennzeichen sind für die Hälfte der Welt falsch |
| Ein Wert, der live wechselt (`99` → `100`) | Breitensprung und Zittern ohne `tabular-nums` |

## Sammlungen

| Wert | Bricht |
| --- | --- |
| 0 Einträge | Der Leerzustand, und ob es überhaupt einen gibt |
| 1 Eintrag | Raster, die mit einer Karte kaputt aussehen; „1 von 1“ |
| Genau Seitengröße und Seitengröße plus 1 | Off-by-one in „40 von 40“, Paginierung mit leerer Seite 2 |
| 1 000 und mehr, unpaginiert | Scrollleistung, Renderzeit, Speicher; auch der Text „40 von 1.284“ |
| Ein Eintrag zehnmal so groß wie die anderen | Masonry- und Grid-Zeilen strecken sich zum höchsten Eintrag |
| Einträge mit identischem Namen | Listen, in denen der Name das einzige Unterscheidungsmerkmal ist |

## Zeit

| Wert | Bricht |
| --- | --- |
| Jetzt | „vor 0 Sekunden“ statt „gerade eben“ |
| Vor 12 Tagen, vor 11 Monaten, vor 3 Jahren | Schwellen relativer Zeit; nach etwa einer Woche auf ein absolutes Datum wechseln |
| Ein Datum in der Zukunft | „in 3 Tagen“ gegen „vor -3 Tagen“ |
| `1970-01-01` | Nullzeitstempel als echtes Datum gezeigt |
| `2025-12-31T23:30:00-08:00` | In UTC und in der Zeitzone des Nutzers ein anderer Tag |
| Sehr lange Dauer (`1.284 Stunden`) | Dauerformat, das nie auf Tage aufrundet |

`Intl.RelativeTimeFormat("de")` und `Intl.DateTimeFormat("de-DE")` statt handgebauter Strings.

## Bilder und Medien

| Wert | Bricht |
| --- | --- |
| Avatar-URL mit 404 | Symbol für kaputtes Bild statt Initialen |
| Gar kein Avatar | Der Fallback selbst: Initialen, Farbe, gleiche Größe wie echte Avatare |
| 4000 × 200 Panorama als Avatar oder Titelbild | Verzerrung ohne `object-fit: cover` |
| 200 × 4000 hochkant | Dasselbe auf der anderen Achse; kann die Kartenhöhe sprengen |
| Transparentes PNG-Logo, dunkles Logo im Dunkelmodus | Unsichtbar auf dem Hintergrund |
| Langsam ladendes Bild | Layoutsprung ohne feste Maße oder `aspect-ratio` |

## Zustände

| Wert | Bricht |
| --- | --- |
| Laden | Skelette, die nicht zum späteren Layout passen, Spinner, die Inhalt verschieben |
| Fehler von der API | Kein Fehlerzustand oder roher Fehlertext (`TypeError: Cannot read properties of undefined`) |
| Teilweise Daten | Optionale Felder teils gefüllt, teils nicht, in derselben Liste; verschobene Zeilen |
| Jeder Status gleichzeitig | Alle Enum-Werte in einer Liste (`aktiv`, `eingeladen`, `abgelaufen`, `gesperrt`); Badge-Breiten variieren |
| Keine Berechtigung | Deaktivierte Aktionen; bleibt die Zeile gleich aufgebaut? |
| Der aktuelle Nutzer in der Liste | „Sie“-Markierung, Aktionen, die auf sich selbst nicht passen |

## Umgebung

Keine Daten, aber genauso geprüft: Worst-Case laden, dann diese Bedingungen ändern.

| Bedingung | Bricht |
| --- | --- |
| Viewport 375 px | Jeder Überlauf von oben, gleichzeitig |
| Schmale Seitenleiste | Komponenten für Vollbreite gebaut, in einer 280-px-Spalte wiederverwendet |
| 1440 px und breiter | Zu lange Zeilen, Inhalt an einer Seite gestrandet |
| Browser-Zoom 200 % | Feste Höhen, die wachsenden Text abschneiden |
| Dunkelmodus | Hartkodierte Farben, unsichtbare Rahmen und Logos |
| `dir="rtl"` | Icons, Chevrons, Padding und die Reihenfolge nachgestellter Aktionen |
| Touch-Gerät | Nur bei Hover sichtbare Aktionen (das „…“, das beim Überfahren erscheint) sind unerreichbar |
