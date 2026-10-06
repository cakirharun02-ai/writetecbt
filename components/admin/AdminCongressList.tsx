"use client";

import React from "react";
import { CONGRESSES } from "./congresses";
import type { Congress, CongressData } from "./types";

interface AdminCongressListProps {
  data: Record<string, CongressData>;
  onSelectCongress: (congress: Congress) => void;
  onLogout: () => void;
}

const CONGRESS_ICONS: Record<string, string> = {
  "saglik-bilimleri": "🏥",
  "sosyal-saglik-bilimleri": "🧠",
};

export function AdminCongressList({ data, onSelectCongress, onLogout }: AdminCongressListProps) {
  const loaded = CONGRESSES.filter((c) => data[c.id] && !data[c.id].loading && !data[c.id].error);
  const anyLoading = CONGRESSES.some((c) => !data[c.id] || data[c.id].loading);
  const total = loaded.reduce((s, c) => s + data[c.id].participants.length, 0);
  const approved = loaded.reduce(
    (s, c) => s + data[c.id].participants.filter((p) => p.durum === "Onaylandı").length,
    0
  );
  const pending = loaded.reduce(
    (s, c) => s + data[c.id].participants.filter((p) => p.durum === "Beklemede").length,
    0
  );

  function countLabel(c: Congress): string {
    const cd = data[c.id];
    if (!cd || cd.loading) return "yükleniyor…";
    if (cd.error) return "liste alınamadı";
    const bekleyen = cd.participants.filter((p) => p.durum === "Beklemede").length;
    return `${cd.participants.length} başvuru · ${bekleyen} beklemede`;
  }

  return (
    <div style={shellStyles.root}>
      {/* Üst bar */}
      <header style={shellStyles.header}>
        <div style={shellStyles.headerLeft}>
          <div style={shellStyles.logoMark}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="14" fill="#0b2d5a" />
              <path d="M8 20L14 8L20 20H16L14 15.5L12 20H8Z" fill="#c9a84c" />
            </svg>
          </div>
          <div>
            <div style={shellStyles.headerTitle}>Yönetim Paneli</div>
            <div style={shellStyles.headerSub}>WriteTec Bilgi Teknolojileri</div>
          </div>
        </div>
        <button onClick={onLogout} style={shellStyles.logoutBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Çıkış Yap
        </button>
      </header>

      <main style={shellStyles.main}>
        {/* Özet istatistik */}
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statNum}>{CONGRESSES.length}</div>
            <div style={styles.statLabel}>Aktif Kongre</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: "#c9a84c" }}>{anyLoading ? "…" : total}</div>
            <div style={styles.statLabel}>Toplam Başvuru</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: "#b45309" }}>{anyLoading ? "…" : pending}</div>
            <div style={styles.statLabel}>Beklemede</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statNum, color: "#2d6a4f" }}>{anyLoading ? "…" : approved}</div>
            <div style={styles.statLabel}>Onaylanan</div>
          </div>
        </div>

        <h2 style={styles.sectionTitle}>Kongreler</h2>
        <p style={styles.sectionSub}>Detaylarını görüntülemek istediğiniz kongreye tıklayın.</p>

        <div style={styles.grid}>
          {CONGRESSES.map((congress, i) => (
            <button
              key={congress.id}
              onClick={() => onSelectCongress(congress)}
              style={{
                ...styles.card,
                animationDelay: `${i * 80}ms`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 48px rgba(11,45,90,0.15)";
                (e.currentTarget as HTMLElement).style.borderColor = congress.color;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(11,45,90,0.07)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(11,45,90,0.1)";
              }}
            >
              <div style={styles.cardIcon}>{CONGRESS_ICONS[congress.id] ?? "📋"}</div>
              <div style={styles.cardContent}>
                <div style={styles.cardTitle}>{congress.title}</div>
                <div style={styles.cardSubtitle}>{congress.date}</div>
                <div style={{ ...styles.cardBadge, background: congress.color + "18", color: congress.color }}>
                  {countLabel(congress)}
                </div>
              </div>
              <div style={{ ...styles.cardArrow, color: congress.color }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </main>

      <style>{`
        @keyframes cardFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
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
    gap: 12,
  },
  logoMark: { display: "flex" },
  headerTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0b2d5a",
    lineHeight: 1.2,
  },
  headerSub: {
    fontSize: 11,
    color: "#94a3b8",
    lineHeight: 1.2,
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    background: "transparent",
    border: "1.5px solid rgba(11,45,90,0.15)",
    borderRadius: 8,
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  main: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "40px 24px",
  },
};

const styles: Record<string, React.CSSProperties> = {
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 40,
  },
  statCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "24px 28px",
    boxShadow: "0 2px 8px rgba(11,45,90,0.06)",
    border: "1px solid rgba(11,45,90,0.08)",
  },
  statNum: {
    fontSize: 36,
    fontWeight: 700,
    color: "#0b2d5a",
    lineHeight: 1,
    marginBottom: 6,
    fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
  },
  statLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#0b2d5a",
    margin: "0 0 6px 0",
    fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
  },
  sectionSub: {
    fontSize: 14,
    color: "#6b7280",
    margin: "0 0 24px 0",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    background: "#fff",
    border: "1.5px solid rgba(11,45,90,0.1)",
    borderRadius: 14,
    padding: "20px 24px",
    cursor: "pointer",
    textAlign: "left",
    transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
    boxShadow: "0 4px 16px rgba(11,45,90,0.07)",
    animation: "cardFadeUp 0.45s cubic-bezier(0.2,0.8,0.2,1) both",
  },
  cardIcon: {
    fontSize: 32,
    width: 56,
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    borderRadius: 12,
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0b2d5a",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6b7280",
  },
  cardBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    marginTop: 4,
    width: "fit-content",
  },
  cardArrow: {
    flexShrink: 0,
    opacity: 0.6,
  },
};
