export const SOSYAL_BASE = "/kongrelerimiz/sosyal-saglik-bilimleri";
export const SOSYAL_HOME = `${SOSYAL_BASE}/guncel`;

export type SosyalLeaf = { key: string; href: string; external?: boolean };

export type SosyalEntry =
  | { kind: "link"; key: string; href: string }
  | { kind: "dropdown"; key: string; items: SosyalLeaf[] };

const p = (path = "") => `${SOSYAL_BASE}${path}`;

const NAV = "pages.sosyal.nav";

export const SOSYAL_NAV: SosyalEntry[] = [
  { kind: "link", key: `${NAV}.home`, href: SOSYAL_HOME },
  {
    kind: "dropdown",
    key: `${NAV}.congressInfo`,
    items: [
      { key: `${NAV}.duzenlemeKurulu`, href: p("/duzenleme-kurulu") },
      { key: `${NAV}.bilimKurulu`, href: p("/bilim-kurulu") },
      { key: `${NAV}.yabanciDilKurulu`, href: p("/yabanci-dil-kurulu") },
      { key: `${NAV}.takvim`, href: p("/takvim") },
      { key: `${NAV}.konular`, href: p("/konular") },
      { key: `${NAV}.yukselmeTesvik`, href: p("/yukselme-tesvik") },
      { key: `${NAV}.degerlendirmeSureci`, href: p("/degerlendirme-sureci") },
      { key: `${NAV}.kongreYeri`, href: p("/kongre-yeri") },
      { key: `${NAV}.konusmaci`, href: p("/konusmaci") },
    ],
  },
  {
    kind: "dropdown",
    key: `${NAV}.publications`,
    items: [
      { key: `${NAV}.bildiriKitabi`, href: p("/bildiri-kitabi") },
      { key: `${NAV}.bildiriYukleme`, href: p("/bildiri-yukleme") },
      { key: `${NAV}.makale`, href: p("/makale") },
      { key: `${NAV}.editorluKitap`, href: p("/editorlu-kitap") },
    ],
  },
  {
    kind: "dropdown",
    key: `${NAV}.registration`,
    items: [
      { key: `${NAV}.kayitBilgisi`, href: p("/kayit-bilgisi") },
      { key: `${NAV}.odemeBildirimi`, href: p("/odeme-bildirimi") },
      { key: `${NAV}.konaklama`, href: p("/konaklama") },
      { key: `${NAV}.sosyalEtkinlik`, href: p("/sosyal-etkinlik") },
    ],
  },
  {
    kind: "dropdown",
    key: `${NAV}.application`,
    items: [
      { key: `${NAV}.basvuruFormu`, href: p("/basvuru-formu") },
      { key: `${NAV}.katilimKurallari`, href: p("/katilim-kurallari") },
      { key: `${NAV}.basvuruSureci`, href: p("/basvuru-sureci") },
      { key: `${NAV}.yazimKurallari`, href: "/saglik/yazimkurallari.pdf", external: true },
    ],
  },
  {
    kind: "dropdown",
    key: `${NAV}.ourCongresses`,
    items: [{ key: `${NAV}.firstCongress`, href: SOSYAL_HOME }],
  },
  { kind: "link", key: `${NAV}.contact`, href: p("/iletisim") },
];
