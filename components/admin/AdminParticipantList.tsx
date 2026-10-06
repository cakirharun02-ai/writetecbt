"use client";

import React, { useState } from "react";
import type { Congress, CongressData, Durum, Participant } from "./types";
import { DURUM_STYLE, ODEME_DURUM_STYLE, participantTitle } from "./types";

interface AdminParticipantListProps {
  congress: Congress;
  data: CongressData;
  onRefresh: () => void;
  onSelectParticipant: (participant: Participant) => void;
  onBack: () => void;
  onLogout: () => void;
}

export function AdminParticipantList({
  congress,
  data,
  onRefresh,
  onSelectParticipant,
  onBack,
  onLogout,
}: AdminParticipantListProps) {
  const { participants, loading, error } = data;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"hepsi" | Durum>("hepsi");
  const [odemeBekleyenlerOnly, setOdemeBekleyenlerOnly] = useState(false);

  // Hibrit kongrelerde (7. kongre) dolu gelir; boşsa sütun hiç gösterilmez
  const katilimVar = participants.some((p) => p.katilimSekli);
  // Ödeme bildirimi yalnızca bunu destekleyen kongrelerde dolu gelir (şu an: 7. kongre)
  const odemeVar = participants.some((p) => p.odemeDurumu);
  const odemeBekleyenSayisi = participants.filter((p) => p.odemeDurumu === "Onay Bekliyor").length;

  const filtered = participants.filter((p) => {
    const q = search.toLowerCase();
    const yazarlar = p.authors.map((a) => `${a.ad} ${a.soyad} ${a.email}`).join(" ");
    const matchSearch =
      !q ||
      p.adSoyad.toLowerCase().includes(q) ||
      yazarlar.toLowerCase().includes(q) ||
      p.universite.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      participantTitle(p).toLowerCase().includes(q);
    const matchFilter = filter === "hepsi" || p.durum === filter;
    const matchOdeme = !odemeBekleyenlerOnly || p.odemeDurumu === "Onay Bekliyor";
    return matchSearch && matchFilter && matchOdeme;
  });

  return (
    <div style={shellStyles.root}>
      {/* Üst bar */}
      <header style={shellStyles.header}>
        <div style={shellStyles.headerLeft}>
          <button onClick={onBack} style={shellStyles.backBtn} aria-label="Geri">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Kongreler
          </button>
          <div style={shellStyles.breadcrumbSep}>›</div>
          <div style={shellStyles.breadcrumbCurrent}>{congress.title}</div>
        </div>
        <button onClick={onLogout} style={shellStyles.logoutBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Çıkış
        </button>
      </header>

      <main style={shellStyles.main}>
        {/* Başlık */}
        <div style={styles.pageHead}>
          <div>
            <h1 style={styles.pageTitle}>{congress.title}</h1>
            <p style={styles.pageSub}>
              {loading ? "Yükleniyor…" : `${participants.length} başvuru`} &nbsp;·&nbsp; {congress.date}
            </p>
          </div>
          <button onClick={onRefresh} disabled={loading} style={styles.refreshBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
            {loading ? "Yenileniyor…" : "Yenile"}
          </button>
        </div>

        {/* Filtre + Arama */}
        <div style={styles.toolbar}>
          <div style={styles.searchWrapper}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={styles.searchIcon}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Yazar, kurum, e-posta veya bildiri başlığı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterGroup}>
            {(["hepsi", "Beklemede", "Onaylandı", "Reddedildi"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterBtn,
                  ...(filter === f ? { ...styles.filterBtnActive, borderColor: congress.color, color: congress.color, background: congress.color + "12" } : {}),
                }}
              >
                {f === "hepsi" ? "Hepsi" : f}
              </button>
            ))}
            {odemeVar && (
              <button
                onClick={() => setOdemeBekleyenlerOnly((v) => !v)}
                style={{
                  ...styles.filterBtn,
                  ...(odemeBekleyenlerOnly
                    ? { ...styles.filterBtnActive, borderColor: "#1e40af", color: "#1e40af", background: "#eff6ff" }
                    : {}),
                }}
              >
                Ödeme Bekliyor{odemeBekleyenSayisi > 0 ? ` (${odemeBekleyenSayisi})` : ""}
              </button>
            )}
          </div>
        </div>

        {/* Hata */}
        {error && (
          <div style={styles.errorBox}>
            Başvurular alınamadı: {error}{" "}
            <button onClick={onRefresh} style={styles.errorRetry}>Tekrar dene</button>
          </div>
        )}

        {/* Tablo */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                {[
                  "Yazarlar",
                  "Bildiri Başlığı",
                  "Bilim Alanı",
                  ...(katilimVar ? ["Katılım"] : []),
                  "Kurum",
                  "Başvuru Tarihi",
                  "Durum",
                ].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={katilimVar ? 7 : 6} style={styles.emptyCell}>Başvurular yükleniyor…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={katilimVar ? 7 : 6} style={styles.emptyCell}>
                    {participants.length === 0 ? "Henüz başvuru yok." : "Sonuç bulunamadı."}
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.ref}
                    style={{ ...styles.tr, animationDelay: `${i * 40}ms` }}
                    onClick={() => onSelectParticipant(p)}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#f0f6ff";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = i % 2 === 0 ? "#fff" : "#fafbfd";
                    }}
                  >
                    <td style={styles.td}>
                      <div style={styles.nameCell}>
                        <div style={styles.avatar}>
                          {(p.ad[0] || "?")}{(p.soyad[0] || "")}
                        </div>
                        <span style={styles.nameCellText}>
                          {p.adSoyad}
                          {p.authors.length > 1 && (
                            <span style={{ color: "#94a3b8", fontWeight: 500 }}> +{p.authors.length - 1} yazar</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, maxWidth: 260 }}>
                      <span style={styles.titleCell}>{participantTitle(p)}</span>
                    </td>
                    <td style={styles.td}>{p.bilimAlani || "—"}</td>
                    {katilimVar && (
                      <td style={styles.td}>
                        {p.katilimSekli ? (
                          <span
                            style={{
                              ...styles.typeTag,
                              background: p.katilimSekli.toLowerCase().includes("online") ? "#eef4fb" : "#fdf6ee",
                              color: p.katilimSekli.toLowerCase().includes("online") ? "#2f67b8" : "#b45309",
                            }}
                          >
                            {p.katilimSekli.toLowerCase().includes("online") ? "💻 Online" : "🏨 Yüz yüze"}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    )}
                    <td style={styles.td}>{p.universite || "—"}</td>
                    <td style={styles.td}>
                      {p.timestamp ? new Date(p.timestamp).toLocaleDateString("tr-TR") : "—"}
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.statusBadge, ...DURUM_STYLE[p.durum] }}>
                        {p.durum}
                      </span>
                      {p.revizyon > 0 && (
                        <span style={styles.revBadge} title="Düzeltme sonrası yeniden gönderildi">
                          Rev {p.revizyon}
                        </span>
                      )}
                      {p.odemeDurumu && (
                        <span
                          style={{ ...styles.statusBadge, marginLeft: 6, ...ODEME_DURUM_STYLE[p.odemeDurumu] }}
                        >
                          {p.odemeDurumu}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <style>{`
        @keyframes rowFadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

const shellStyles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    background: "#f3f7fc",
    fontFamily: "var(--font-source, 'Source Sans 3', system-ui, sans-serif)",
  },
  header: {
    background: "#fff",
    borderBottom: "1px solid rgba(11,45,90,0.1)",
    padding: "0 40px",
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 50,
    boxShadow: "0 2px 8px rgba(11,45,90,0.06)",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: 14,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 6,
    transition: "color 0.2s",
    fontFamily: "inherit",
  },
  breadcrumbSep: {
    color: "#cbd5e1",
    fontSize: 18,
  },
  breadcrumbCurrent: {
    fontSize: 14,
    fontWeight: 600,
    color: "#0b2d5a",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    background: "transparent",
    border: "1.5px solid rgba(11,45,90,0.15)",
    borderRadius: 8,
    color: "#6b7280",
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "36px 24px",
  },
};

const styles: Record<string, React.CSSProperties> = {
  pageHead: {
    marginBottom: 28,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    background: "#fff",
    border: "1.5px solid rgba(11,45,90,0.15)",
    borderRadius: 8,
    color: "#0b2d5a",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    flexShrink: 0,
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#9b2335",
    borderRadius: 10,
    padding: "12px 16px",
    fontSize: 13,
    marginBottom: 16,
  },
  errorRetry: {
    background: "none",
    border: "none",
    color: "#9b2335",
    fontWeight: 700,
    textDecoration: "underline",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
    padding: 0,
  },
  titleCell: {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: 1.4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#0b2d5a",
    margin: "0 0 4px 0",
    fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
  },
  pageSub: {
    fontSize: 14,
    color: "#6b7280",
    margin: 0,
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  searchWrapper: {
    position: "relative",
    flex: 1,
    minWidth: 240,
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "10px 14px 10px 36px",
    border: "1.5px solid rgba(11,45,90,0.15)",
    borderRadius: 10,
    fontSize: 14,
    color: "#0b2d5a",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  filterGroup: {
    display: "flex",
    gap: 6,
  },
  filterBtn: {
    padding: "8px 14px",
    borderWidth: 1.5,
    borderStyle: "solid",
    borderColor: "rgba(11,45,90,0.15)",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    background: "#fff",
    color: "#6b7280",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  filterBtnActive: {
    fontWeight: 700,
  },
  tableWrapper: {
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 4px 16px rgba(11,45,90,0.07)",
    border: "1px solid rgba(11,45,90,0.09)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "14px 18px",
    fontSize: 12,
    fontWeight: 700,
    color: "#94a3b8",
    textAlign: "left",
    background: "#f8fafc",
    borderBottom: "1px solid rgba(11,45,90,0.08)",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  tr: {
    cursor: "pointer",
    transition: "background 0.15s",
    animation: "rowFadeIn 0.35s cubic-bezier(0.2,0.8,0.2,1) both",
  },
  td: {
    padding: "14px 18px",
    fontSize: 14,
    color: "#374151",
    borderBottom: "1px solid rgba(11,45,90,0.06)",
    verticalAlign: "middle",
  },
  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0b2d5a, #2f67b8)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    letterSpacing: "0.5px",
  },
  nameCellText: {
    fontWeight: 600,
    color: "#0b2d5a",
  },
  typeTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  revBadge: {
    display: "inline-flex",
    alignItems: "center",
    marginLeft: 6,
    padding: "3px 8px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: "#eef4fb",
    color: "#2f67b8",
    border: "1px solid #bfdbfe",
  },
  emptyCell: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    fontSize: 14,
  },
};
