#!/usr/bin/env node
// Prüfskript für das Oberflächen-Review: misst eine Seite bei mehreren Breiten
// und gibt Messwerte als JSON aus. Es ersetzt nicht das Hinsehen, es liefert Belege.
//
//   node pruefskript.js <url> [--breiten 375,1440] [--zoom 200] [--max-tabs 200]
//
// --zoom 200 misst jede Breite zusätzlich bei 200 % Browser-Zoom (halber CSS-Viewport),
// so wie WCAG 1.4.4 und 1.4.10 es verlangen.
// Nutzt das global installierte Playwright (NODE_PATH ist im Job-Image gesetzt).
// Ergebnis: { url, breiten: { "375": {...}, "375@200%": {...}, "1440": {...} }, zusammenfassung }
// Jeder Block nennt, was gemessen wurde. Was das Skript nicht sehen kann
// (Text auf Bildern, Bedeutung einer Farbe, Tonfall), steht unter "nichtGemessen".

const { chromium } = require("playwright");

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith("--"));
if (!url) {
  console.error("Aufruf: node pruefskript.js <url> [--breiten 375,1440] [--max-tabs 200]");
  process.exit(2);
}
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const breiten = opt("--breiten", "375,1440").split(",").map((b) => parseInt(b, 10)).filter(Boolean);
const maxTabs = parseInt(opt("--max-tabs", "200"), 10);
const zoom = parseInt(opt("--zoom", "0"), 10);
// Jeder Durchgang: Name für den Bericht, CSS-Viewport-Breite, Höhe.
const durchgaenge = breiten.flatMap((b) => {
  const liste = [{ name: `${b}`, breite: b, hoehe: b < 768 ? 812 : 900 }];
  if (zoom > 100) liste.push({ name: `${b}@${zoom}%`, breite: Math.round(b * 100 / zoom), hoehe: Math.round((b < 768 ? 812 : 900) * 100 / zoom) });
  return liste;
});

// Läuft im Browser. Alles, was hier steht, darf nur DOM und computed styles nutzen.
function messungen() {
  const sichtbar = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none";
  };
  const kurz = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" && el.className.trim()
      ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
      : "";
    const text = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return `${el.tagName.toLowerCase()}${id}${cls}${text ? ` „${text}“` : ""}`;
  };

  // Zugänglicher Name, vereinfacht nach der Reihenfolge der Accessible-Name-Berechnung.
  const name = (el) => {
    const byIds = (attr) => (el.getAttribute(attr) || "")
      .split(/\s+/).filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent || "").join(" ").trim();
    if (el.getAttribute("aria-labelledby") && byIds("aria-labelledby")) return byIds("aria-labelledby");
    if ((el.getAttribute("aria-label") || "").trim()) return el.getAttribute("aria-label").trim();
    if (/^(input|select|textarea)$/i.test(el.tagName)) {
      const label = (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) || el.closest("label");
      if (label && label.textContent.trim()) return label.textContent.trim();
      if (/^(submit|button|reset)$/i.test(el.type) && el.value) return el.value;
    }
    const alt = [...el.querySelectorAll("img[alt], svg[aria-label], [aria-label]")]
      .map((n) => n.getAttribute("alt") || n.getAttribute("aria-label")).filter(Boolean).join(" ").trim();
    const text = (el.textContent || "").trim();
    return text || alt || (el.getAttribute("title") || "").trim();
  };

  const interaktiv = [...document.querySelectorAll(
    'a[href], button, input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="checkbox"], [role="switch"], [role="radio"], [tabindex]:not([tabindex="-1"])'
  )].filter(sichtbar);

  const innen = document.documentElement.clientWidth;

  // Horizontaler Überlauf: Dokument breiter als Viewport, plus die Elemente, die überstehen.
  const ueberlauf = {
    dokumentBreite: document.documentElement.scrollWidth,
    viewport: innen,
    ueberstehend: [...document.querySelectorAll("body *")]
      .filter((el) => sichtbar(el) && el.getBoundingClientRect().right > innen + 1)
      .slice(0, 15).map(kurz),
  };

  // Text, der an einer Box ohne Auslassungspunkte abgeschnitten wird.
  const abgeschnitten = [...document.querySelectorAll("body *")].filter((el) => {
    if (!sichtbar(el) || el.children.length > 0 || !(el.textContent || "").trim()) return false;
    const s = getComputedStyle(el);
    const clipt = /hidden|clip/.test(s.overflowX) || /hidden|clip/.test(s.overflowY);
    const ellipsis = s.textOverflow === "ellipsis" || s.webkitLineClamp !== "none";
    return clipt && !ellipsis && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
  }).slice(0, 15).map(kurz);

  // Formularfelder stehen unter felderOhneLabel, nicht doppelt hier.
  const ohneNamen = interaktiv.filter((el) => !/^(input|select|textarea)$/i.test(el.tagName) && !name(el)).map(kurz);

  // Links im Fließtext sind von WCAG 2.5.8 ausgenommen, deshalb keine inline dargestellten Elemente.
  const kleineZiele = interaktiv.filter((el) => {
    if (getComputedStyle(el).display === "inline") return false;
    const r = el.getBoundingClientRect();
    return r.width < 24 || r.height < 24;
  }).map((el) => `${kurz(el)} (${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)} px)`);

  const felderOhneLabel = [...document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]), select, textarea')]
    .filter((el) => sichtbar(el) && !name(el)).map(kurz);

  // Kontrast: tatsächliches Paar aus Textfarbe und erstem deckenden Hintergrund darüber.
  const farbe = (str) => {
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = "1"] = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { r, g, b, a: Number.isNaN(a) ? 1 : a };
  };
  const mischen = (vorne, hinten) => ({
    r: vorne.r * vorne.a + hinten.r * (1 - vorne.a),
    g: vorne.g * vorne.a + hinten.g * (1 - vorne.a),
    b: vorne.b * vorne.a + hinten.b * (1 - vorne.a),
    a: 1,
  });
  const leuchtdichte = ({ r, g, b }) => {
    const k = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2];
  };
  const verhaeltnis = (a, b) => {
    const [h, d] = [leuchtdichte(a), leuchtdichte(b)].sort((x, y) => y - x);
    return (h + 0.05) / (d + 0.05);
  };
  const hintergrund = (el) => {
    let node = el; let bild = false; let ergebnis = { r: 255, g: 255, b: 255, a: 1 }; const schichten = [];
    while (node && node !== document) {
      const s = getComputedStyle(node);
      if (s.backgroundImage && s.backgroundImage !== "none") bild = true;
      const bg = farbe(s.backgroundColor);
      if (bg && bg.a > 0) { schichten.unshift(bg); if (bg.a >= 1) break; }
      node = node.parentElement;
    }
    for (const schicht of schichten) ergebnis = mischen(schicht, ergebnis);
    return { farbe: ergebnis, bild };
  };
  const kontrast = []; const kontrastBild = [];
  for (const el of document.querySelectorAll("body *")) {
    if (!sichtbar(el)) continue;
    const eigenerText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!eigenerText) continue;
    const s = getComputedStyle(el);
    const vorne = farbe(s.color);
    if (!vorne || vorne.a === 0) continue;
    const { farbe: hinten, bild } = hintergrund(el);
    if (bild) { kontrastBild.push(kurz(el)); continue; }
    const text = mischen(vorne, hinten);
    const groesse = parseFloat(s.fontSize);
    const fett = parseInt(s.fontWeight, 10) >= 700;
    const gross = groesse >= 24 || (groesse >= 18.66 && fett);
    const soll = gross ? 3 : 4.5;
    const ist = verhaeltnis(text, hinten);
    if (ist < soll) {
      kontrast.push({
        element: kurz(el),
        text: s.color, hintergrund: `rgb(${Math.round(hinten.r)}, ${Math.round(hinten.g)}, ${Math.round(hinten.b)})`,
        gemessen: Math.round(ist * 100) / 100, soll, schriftgroesse: `${groesse}px`,
      });
    }
  }

  const ueberschriften = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].filter(sichtbar)
    .map((h) => ({ ebene: parseInt(h.tagName[1], 10), text: h.textContent.trim().replace(/\s+/g, " ").slice(0, 60) }));
  const spruenge = [];
  for (let i = 1; i < ueberschriften.length; i++) {
    if (ueberschriften[i].ebene > ueberschriften[i - 1].ebene + 1) spruenge.push(`h${ueberschriften[i - 1].ebene} → h${ueberschriften[i].ebene} bei „${ueberschriften[i].text}“`);
  }

  // Ersatzschreibungen für Umlaute und ß in sichtbarem Text. Heuristik, Treffer sind Verdachtsfälle.
  const verdacht = /\b\w*(fuer|ueber|koenn|muess|aender|loesch|zurueck|groess|gross\b|grosse\b|oeffn|schliess|waehl|pruef|uebersicht|menue|moeglich|naechst|zusaetz|buero|kuendig|gueltig|strasse|gruss|spass|massnahme|fussnote|waehrend|taetig|gehoer|erhoeh|verfueg|hinzufueg|ausfuehr|einfueg|bestaetig|loesung|rueck|fuehr|hoeh|laenge|voellig|regelmaess|zuverlaess)\w*\b/gi;
  const text = document.body.innerText || "";
  const asciiUmlaute = [...new Set((text.match(verdacht) || []).map((w) => w.trim()))].slice(0, 30);

  return {
    lang: document.documentElement.getAttribute("lang") || null,
    ueberlauf,
    abgeschnitten,
    ohneNamen,
    kleineZiele,
    felderOhneLabel,
    kontrast,
    kontrastBild,
    ueberschriften: { reihenfolge: ueberschriften.map((h) => `h${h.ebene} ${h.text}`), spruenge, anzahlH1: ueberschriften.filter((h) => h.ebene === 1).length },
    asciiUmlaute,
    anzahlInteraktiv: interaktiv.length,
  };
}

// Läuft im Browser nach jedem Tab-Druck: Hat das fokussierte Element einen sichtbaren Fokus?
function fokusStopp(vorher) {
  const el = document.activeElement;
  if (!el || el === document.body) return { ende: true };
  const s = getComputedStyle(el);
  const jetzt = { outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, boxShadow: s.boxShadow, border: s.borderColor, background: s.backgroundColor };
  const ring = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
  const alt = vorher[el.__pruefId] || null;
  const geaendert = alt ? Object.keys(jetzt).some((k) => jetzt[k] !== alt[k]) : ring;
  const id = el.id ? `#${el.id}` : "";
  const text = (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
  return { ende: false, pruefId: el.__pruefId, element: `${el.tagName.toLowerCase()}${id}${text ? ` „${text}“` : ""}`, sichtbar: ring || geaendert };
}

(async () => {
  const browser = await chromium.launch();
  const ergebnis = { url, breiten: {}, nichtGemessen: [
    "Text auf Bildern und Verläufen (steht unter kontrastBild, selbst messen)",
    "Bedeutung, die nur über Farbe getragen wird",
    "Tonfall, Begriffe, erfundene Aussagen",
    "Zustände leer, laden, fehler (Seite in jedem Zustand aufrufen und erneut messen)",
    ...(zoom > 100 ? [] : ["Zoom 200 % (mit --zoom 200 erneut laufen lassen)"]),
  ] };
  for (const { name: durchgang, breite, hoehe } of durchgaenge) {
    const page = await browser.newPage({ viewport: { width: breite, height: hoehe } });
    const konsole = [];
    page.on("console", (m) => { if (m.type() === "error") konsole.push(m.text().slice(0, 200)); });
    page.on("pageerror", (e) => konsole.push(`pageerror: ${String(e.message || e).slice(0, 200)}`));
    await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
    const werte = await page.evaluate(messungen);

    // Fokus-Durchgang: Stile aller fokussierbaren Elemente vor dem Fokus merken, dann Tab für Tab.
    const vorher = await page.evaluate(() => {
      const map = {};
      let n = 0;
      for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"], [role="tab"], [role="menuitem"]')) {
        el.__pruefId = `f${n++}`;
        const s = getComputedStyle(el);
        map[el.__pruefId] = { outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, boxShadow: s.boxShadow, border: s.borderColor, background: s.backgroundColor };
      }
      return map;
    });
    const fokusOhneRing = []; const gesehen = new Set(); let stopps = 0;
    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press("Tab");
      const stopp = await page.evaluate(fokusStopp, vorher);
      if (stopp.ende || (stopp.pruefId && gesehen.has(stopp.pruefId))) break;
      if (stopp.pruefId) gesehen.add(stopp.pruefId);
      stopps++;
      if (!stopp.sichtbar) fokusOhneRing.push(stopp.element);
    }

    ergebnis.breiten[durchgang] = { ...werte, fokus: { stopps, fokusOhneRing }, konsolenfehler: konsole };
    await page.close();
  }
  await browser.close();

  const summe = (f) => Object.values(ergebnis.breiten).reduce((n, b) => n + f(b), 0);
  ergebnis.zusammenfassung = {
    horizontalerUeberlauf: Object.entries(ergebnis.breiten).filter(([, b]) => b.ueberlauf.dokumentBreite > b.ueberlauf.viewport).map(([w]) => w.includes("@") ? w : `${w}px`),
    abgeschnitten: summe((b) => b.abgeschnitten.length),
    ohneNamen: summe((b) => b.ohneNamen.length),
    fokusOhneRing: summe((b) => b.fokus.fokusOhneRing.length),
    kleineZiele: summe((b) => b.kleineZiele.length),
    felderOhneLabel: summe((b) => b.felderOhneLabel.length),
    kontrastFehler: summe((b) => b.kontrast.length),
    ueberschriftenSpruenge: summe((b) => b.ueberschriften.spruenge.length),
    asciiUmlaute: summe((b) => b.asciiUmlaute.length),
    konsolenfehler: summe((b) => b.konsolenfehler.length),
    lang: Object.values(ergebnis.breiten)[0]?.lang || null,
  };
  console.log(JSON.stringify(ergebnis, null, 2));
  const offen = Object.entries(ergebnis.zusammenfassung).filter(([k, v]) => k !== "lang" && (Array.isArray(v) ? v.length : v) > 0);
  console.error(offen.length ? `Funde: ${offen.map(([k, v]) => `${k}=${Array.isArray(v) ? v.join("/") : v}`).join(", ")}` : "Keine Funde in den gemessenen Punkten.");
  if (!ergebnis.zusammenfassung.lang) console.error("Hinweis: <html> hat kein lang-Attribut.");
})().catch((e) => { console.error(e.message || e); process.exit(1); });
