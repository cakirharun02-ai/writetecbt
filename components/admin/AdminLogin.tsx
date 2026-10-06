"use client";

import React, { useState } from "react";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        onLogin();
        return;
      }
      setError(
        res.status === 401
          ? "Kullanıcı adı veya şifre hatalı."
          : "Giriş yapılamadı, lütfen tekrar deneyin."
      );
    } catch {
      setError("Sunucuya ulaşılamadı, lütfen tekrar deneyin.");
    }
    setLoading(false);
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }

  return (
    <div style={styles.root}>
      {/* Arka plan dekor */}
      <div style={styles.bgBlob1} />
      <div style={styles.bgBlob2} />

      <div style={{ ...styles.card, animation: "adminFadeUp 0.55s cubic-bezier(0.2,0.8,0.2,1) both" }}>
        {/* Logo / Başlık */}
        <div style={styles.logoArea}>
          <div style={styles.logoMark}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="14" fill="#0b2d5a" />
              <path d="M8 20L14 8L20 20H16L14 15.5L12 20H8Z" fill="#c9a84c" />
            </svg>
          </div>
          <span style={styles.logoText}>WRITETEC</span>
        </div>

        <h1 style={styles.title}>Yönetici Girişi</h1>
        <p style={styles.subtitle}>Devam etmek için kimlik bilgilerinizi girin.</p>

        <form onSubmit={handleSubmit} style={{ ...styles.form, ...(shake ? styles.shake : {}) }}>
          {/* Kullanıcı adı */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="admin-username">Kullanıcı Adı</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: "rgba(11,45,90,0.18)", boxShadow: "none" })}
              />
            </div>
          </div>

          {/* Şifre */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="admin-password">Şifre</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="admin-password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={styles.input}
                onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
                onBlur={(e) => Object.assign(e.target.style, { borderColor: "rgba(11,45,90,0.18)", boxShadow: "none" })}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
                tabIndex={-1}
                aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Hata mesajı */}
          {error && (
            <div style={styles.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9b2335" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnLoading : {}) }}
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              <>
                <span>Giriş Yap</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        <p style={styles.footer}>
          WriteTec Bilgi Teknolojileri — Yönetim Paneli
        </p>
      </div>

      <style>{`
        @keyframes adminFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes adminShake {
          0%,100% { transform: translateX(0); }
          20%,60%  { transform: translateX(-8px); }
          40%,80%  { transform: translateX(8px); }
        }
        @keyframes adminSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0b2d5a 0%, #143a72 40%, #1a4d8f 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "var(--font-source, 'Source Sans 3', system-ui, sans-serif)",
  },
  bgBlob1: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
    top: "-200px",
    right: "-150px",
    pointerEvents: "none",
  },
  bgBlob2: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(77,168,229,0.1) 0%, transparent 70%)",
    bottom: "-100px",
    left: "-100px",
    pointerEvents: "none",
  },
  card: {
    position: "relative",
    zIndex: 1,
    background: "rgba(255,255,255,0.97)",
    borderRadius: 20,
    padding: "48px 44px",
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 32px 80px rgba(11,45,90,0.35), 0 0 0 1px rgba(255,255,255,0.1)",
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  logoMark: { flexShrink: 0 },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0b2d5a",
    letterSpacing: "-0.3px",
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#0b2d5a",
    margin: "0 0 6px 0",
    letterSpacing: "-0.5px",
    fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    margin: "0 0 32px 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  shake: {
    animation: "adminShake 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0b2d5a",
    letterSpacing: "0.2px",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "12px 44px",
    fontSize: 15,
    border: "1.5px solid rgba(11,45,90,0.18)",
    borderRadius: 10,
    outline: "none",
    color: "#0b2d5a",
    background: "#f8fafc",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  },
  inputFocus: {
    borderColor: "#2f67b8",
    boxShadow: "0 0 0 3px rgba(47,103,184,0.15)",
    background: "#fff",
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
    display: "flex",
    alignItems: "center",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    color: "#9b2335",
    fontSize: 13,
    fontWeight: 500,
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 24px",
    background: "linear-gradient(135deg, #0b2d5a 0%, #2f67b8 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.15s",
    letterSpacing: "0.2px",
    marginTop: 4,
  },
  submitBtnLoading: {
    opacity: 0.75,
    cursor: "not-allowed",
    pointerEvents: "none",
  },
  spinner: {
    display: "inline-block",
    width: 18,
    height: 18,
    border: "2.5px solid rgba(255,255,255,0.4)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "adminSpin 0.7s linear infinite",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 28,
    marginBottom: 0,
  },
};
