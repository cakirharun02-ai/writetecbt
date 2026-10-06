"use client";

import React, { useState } from "react";
import type { Congress, Participant } from "./types";
import { DURUM_STYLE, ODEME_DURUM_STYLE, dekontDriveUrl, participantTitle } from "./types";

interface AdminParticipantDetailProps {
  participant: Participant;
  congress: Congress;
  onBack: () => void;
  onLogout: () => void;
  onUpdated: (updated: Partial<Participant> & { ref: string }) => void;
}

type Modal = "onay" | "ret" | "odeme-onay" | "odeme-ret" | null;

export function AdminParticipantDetail({
  participant,
  congress,
  onBack,
  onLogout,
  onUpdated,
}: AdminParticipantDetailProps) {
  const [modal, setModal] = useState<Modal>(null);
  const [duzeltmeNotu, setDuzeltmeNotu] = useState("");
  const [odemeNot, setOdemeNot] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const p = participant;
  const durum = p.durum;

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  }

  async function karar(karar: "onay" | "ret") {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          congress: congress.id,
          ref: p.ref,
          karar,
          duzeltmeNotu: karar === "ret" ? duzeltmeNotu.trim() : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `İşlem başarısız (HTTP ${res.status}).`);
      }
      onUpdated({
        ref: p.ref,
        durum: json.durum,
        kararTarihi: json.kararTarihi || new Date().toISOString(),
        duzeltmeNotu: karar === "ret" ? duzeltmeNotu.trim() : p.duzeltmeNotu,
        klasorUrl: json.klasorUrl || p.klasorUrl,
      });
      setModal(null);
      setDuzeltmeNotu("");
      if (karar === "onay") {
        showToast(
          "Onaylandı — kabul mektubu ve sertifika üretildi, kabul maili gönderildi." +
            (json.sertifikaUyari ? ` (${json.sertifikaUyari})` : ""),
          "success"
        );
      } else {
        showToast("Reddedildi — düzeltme maili yazarlara gönderildi.", "success");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err), "error");
    } finally {
      setBusy(false);
    }
  }

  async function odemeKarar(karar: "onay" | "ret") {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          congress: congress.id,
          ref: p.ref,
          karar,
          not: karar === "ret" ? odemeNot.trim() : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `İşlem başarısız (HTTP ${res.status}).`);
      }
      onUpdated({
        ref: p.ref,
        odemeDurumu: json.odemeDurumu,
        odemeOnayTarihi: json.odemeOnayTarihi || p.odemeOnayTarihi,
      });
      setModal(null);
      setOdemeNot("");
      if (karar === "onay") {
        showToast("Ödeme onaylandı — kayıt kesinleşti maili katılımcıya gönderildi.", "success");
      } else {
        showToast("Dekont reddedildi — tekrar yükleme maili katılımcıya gönderildi.", "success");
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : String(err), "error");
    } finally {
      setBusy(false);
    }
  }

  const abstractTr = String(p.ozetTr || "").trim();
  const abstractEn = String(p.ozetEn || "").trim();

  return (
    <div style={shellStyles.root}>
      {/* Toast bildirimi */}
      {toast && (
        <div style={{ ...styles.toast, ...(toast.type === "success" ? styles.toastSuccess : styles.toastError) }}>
          {toast.type === "success"
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* Üst bar */}
      <header style={shellStyles.header}>
        <div style={shellStyles.headerLeft}>
          <button onClick={onBack} style={shellStyles.backBtn} aria-label="Geri">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Katılımcı Listesi
          </button>
          <div style={shellStyles.breadcrumbSep}>›</div>
          <div style={shellStyles.breadcrumbCurrent}>{p.adSoyad}</div>
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
        <div style={styles.layout}>
          {/* Sol kolon */}
          <div style={styles.leftCol}>
            {/* Kişi kartı */}
            <div style={styles.personCard}>
              <div style={styles.personAvatar}>
                {(p.ad[0] || "?")}{(p.soyad[0] || "")}
              </div>
              <div style={styles.personName}>{p.adSoyad}</div>
              <div style={styles.personInstitution}>{p.universite || "—"}</div>
              <div style={styles.personCity}>
                {[p.sehir, p.ulke].filter(Boolean).join(" / ") || "—"}
              </div>

              {/* Durum badge */}
              <div style={{ ...styles.statusBadge, ...DURUM_STYLE[durum] }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor", display: "inline-block", marginRight: 6 }} />
                {durum}
                {p.revizyon > 0 && <span style={{ marginLeft: 8, fontWeight: 700 }}>· Rev {p.revizyon}</span>}
              </div>
              {p.kararTarihi && (
                <div style={styles.decisionDate}>
                  Karar: {new Date(p.kararTarihi).toLocaleString("tr-TR")}
                </div>
              )}
            </div>

            {/* Başvuru bilgileri */}
            <div style={styles.infoCard}>
              <h3 style={styles.cardTitle}>Başvuru Bilgileri</h3>
              <div style={styles.infoList}>
                <InfoRow icon="🔖" label="Başvuru Ref" value={p.ref} />
                <InfoRow
                  icon="📅"
                  label="Başvuru Tarihi"
                  value={p.timestamp ? new Date(p.timestamp).toLocaleString("tr-TR") : "—"}
                />
                <InfoRow icon="🔬" label="Bilim Alanı" value={p.bilimAlani || "—"} />
                {p.katilimSekli && (
                  <InfoRow
                    icon={p.katilimSekli.toLowerCase().includes("online") ? "💻" : "🏨"}
                    label="Katılım Şekli"
                    value={p.katilimSekli}
                  />
                )}
                <InfoRow icon="📚" label="Yayın Tercihi" value={p.yayinTercihi || "—"} />
                <InfoRow icon="🌐" label="Form Dili" value={p.formLocale === "en" ? "İngilizce" : "Türkçe"} />
                {p.tezNotu && <InfoRow icon="🎓" label="Tez Notu" value={p.tezNotu} />}
              </div>
              {p.klasorUrl && (
                <a href={p.klasorUrl} target="_blank" rel="noreferrer" style={styles.driveLink}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  Drive klasörünü aç
                </a>
              )}
            </div>

            {/* Yazarlar */}
            <div style={styles.infoCard}>
              <h3 style={styles.cardTitle}>
                {p.authors.length > 1 ? `Yazarlar (${p.authors.length})` : "Yazar"}
              </h3>
              <div style={styles.authorList}>
                {p.authors.map((a, i) => (
                  <div key={i} style={styles.authorItem}>
                    <div style={styles.authorName}>
                      {[a.unvan, a.ad, a.soyad].filter(Boolean).join(" ")}
                    </div>
                    <div style={styles.authorMeta}>
                      {[a.universite, a.bolum].filter(Boolean).join(" · ") || "—"}
                    </div>
                    <div style={styles.authorMeta}>
                      {[a.email, a.telefon].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kongre */}
            <div style={styles.infoCard}>
              <h3 style={styles.cardTitle}>Kongre</h3>
              <div style={styles.congressPill}>
                <div style={{ ...styles.congressDot, background: congress.color }} />
                <div>
                  <div style={styles.congressName}>{congress.title}</div>
                  <div style={styles.congressSub}>{congress.date}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ kolon */}
          <div style={styles.rightCol}>
            {/* Bildiri */}
            <div style={styles.abstractCard}>
              <h2 style={styles.abstractTitle}>{participantTitle(p)}</h2>
              {abstractTr && (
                <>
                  <div style={styles.abstractDivider} />
                  <h3 style={styles.abstractSubhead}>Özet (Türkçe)</h3>
                  <p style={styles.abstractText}>{abstractTr}</p>
                  {p.keywordsTr && (
                    <p style={styles.keywords}>
                      <strong>Anahtar kelimeler:</strong> {p.keywordsTr}
                    </p>
                  )}
                </>
              )}
              {abstractEn && (
                <>
                  <div style={styles.abstractDivider} />
                  <h3 style={styles.abstractSubhead}>
                    {p.baslikEn && p.baslikEn !== participantTitle(p) ? p.baslikEn : "Abstract (English)"}
                  </h3>
                  <p style={styles.abstractText}>{abstractEn}</p>
                  {p.keywordsEn && (
                    <p style={styles.keywords}>
                      <strong>Keywords:</strong> {p.keywordsEn}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Önceki düzeltme notu */}
            {p.duzeltmeNotu && (
              <div style={styles.noteCard}>
                <h3 style={styles.noteTitle}>
                  {p.revizyon > 0 && durum === "Beklemede"
                    ? `Önceki Düzeltme Talebi (yanıt olarak güncellendi — Rev ${p.revizyon})`
                    : "Gönderilen Düzeltme Notu"}
                </h3>
                <p style={styles.noteText}>{p.duzeltmeNotu}</p>
              </div>
            )}

            {/* Onay / Ret Butonları */}
            <div style={styles.actionCard}>
              <h3 style={styles.actionTitle}>Hakem Değerlendirmesi</h3>
              <p style={styles.actionSub}>
                {durum === "Onaylandı"
                  ? "Bu bildiri onaylandı; kabul mektubu gönderildi. Kararı değiştirebilirsiniz."
                  : durum === "Reddedildi"
                    ? "Bu bildiri için düzeltme istendi; maildeki bağlantıdan düzeltilmiş sürüm gönderildiğinde aynı kayıt güncellenecek."
                    : p.revizyon > 0
                      ? "Bu bildiri düzeltme talebinize yanıt olarak yeniden gönderildi. İnceleyip kararınızı bildirin."
                      : "Onay: kabul mektubu + sertifika üretilir, kabul maili yazarlara gider. Ret: düzeltme notlarınız mail ile iletilir."}
              </p>

              <div style={styles.actionBtns}>
                <button
                  id="btn-approve"
                  disabled={busy || durum === "Onaylandı"}
                  onClick={() => setModal("onay")}
                  style={{
                    ...styles.approveBtn,
                    ...(durum === "Onaylandı" ? styles.approveBtnActive : {}),
                    ...(busy || durum === "Onaylandı" ? { opacity: 0.6, cursor: "default" } : {}),
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {durum === "Onaylandı" ? "Onaylandı ✓" : "Onayla"}
                </button>

                <button
                  id="btn-reject"
                  disabled={busy || durum === "Reddedildi"}
                  onClick={() => setModal("ret")}
                  style={{
                    ...styles.rejectBtn,
                    ...(durum === "Reddedildi" ? styles.rejectBtnActive : {}),
                    ...(busy || durum === "Reddedildi" ? { opacity: 0.6, cursor: "default" } : {}),
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  {durum === "Reddedildi" ? "Reddedildi ✗" : "Reddet"}
                </button>
              </div>
            </div>

            {/* Ödeme Bildirimi — yalnızca bunu destekleyen kongrelerde (şu an: 7. kongre) */}
            {p.odemeDurumu !== undefined && (
              <div style={styles.actionCard}>
                <h3 style={styles.actionTitle}>Ödeme Bildirimi</h3>
                {!p.odemeDurumu ? (
                  <p style={styles.actionSub}>
                    Bu başvuru için henüz dekont yüklenmedi. Katılımcı, kabul mailindeki referans
                    numarasıyla ödeme bildirim formundan dekontunu yükleyebilir.
                  </p>
                ) : (
                  <>
                    <div style={{ ...styles.statusBadge, marginTop: 0, marginBottom: 12, ...ODEME_DURUM_STYLE[p.odemeDurumu] }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "currentColor", display: "inline-block", marginRight: 6 }} />
                      {p.odemeDurumu}
                    </div>
                    <div style={styles.infoList}>
                      {p.dekontYuklemeTarihi && (
                        <InfoRow icon="📤" label="Dekont Yükleme Tarihi" value={new Date(p.dekontYuklemeTarihi).toLocaleString("tr-TR")} />
                      )}
                      {p.dekontBeyan && <InfoRow icon="📝" label="Form Beyanı" value={p.dekontBeyan} />}
                      {p.odemeOnayTarihi && (
                        <InfoRow icon="✅" label="Ödeme Onay Tarihi" value={new Date(p.odemeOnayTarihi).toLocaleString("tr-TR")} />
                      )}
                    </div>
                    {p.dekontDosyaId && (
                      <a href={dekontDriveUrl(p.dekontDosyaId)} target="_blank" rel="noreferrer" style={styles.driveLink}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                        Dekontu görüntüle (Drive)
                      </a>
                    )}
                    <p style={{ ...styles.actionSub, marginTop: 16 }}>
                      Dekontu gözden geçirip onaylayın veya okunamıyorsa reddederek katılımcıdan tekrar
                      yüklemesini isteyin.
                    </p>
                    <div style={styles.actionBtns}>
                      <button
                        disabled={busy || p.odemeDurumu === "Ödendi"}
                        onClick={() => setModal("odeme-onay")}
                        style={{
                          ...styles.approveBtn,
                          ...(p.odemeDurumu === "Ödendi" ? styles.approveBtnActive : {}),
                          ...(busy || p.odemeDurumu === "Ödendi" ? { opacity: 0.6, cursor: "default" } : {}),
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                        {p.odemeDurumu === "Ödendi" ? "Ödendi ✓" : "Ödemeyi Onayla"}
                      </button>
                      <button
                        disabled={busy || p.odemeDurumu === "Reddedildi"}
                        onClick={() => setModal("odeme-ret")}
                        style={{
                          ...styles.rejectBtn,
                          ...(p.odemeDurumu === "Reddedildi" ? styles.rejectBtnActive : {}),
                          ...(busy || p.odemeDurumu === "Reddedildi" ? { opacity: 0.6, cursor: "default" } : {}),
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        {p.odemeDurumu === "Reddedildi" ? "Reddedildi ✗" : "Dekontu Reddet"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Onay modalı */}
      {modal === "onay" && (
        <div style={styles.modalOverlay} onClick={() => !busy && setModal(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Bildiriyi onayla</h3>
            <p style={styles.modalText}>
              <strong>{participantTitle(p)}</strong>
            </p>
            <p style={styles.modalText}>
              Onayladığınızda kabul mektubu PDF&apos;i ve katılım sertifikası üretilip Drive
              klasörüne eklenecek; kabul mektubu {p.authors.length > 1 ? `${p.authors.length} yazara` : "yazara"} e-posta
              ile hemen gönderilecek.
            </p>
            <div style={styles.modalBtns}>
              <button disabled={busy} onClick={() => setModal(null)} style={styles.modalCancelBtn}>
                Vazgeç
              </button>
              <button
                id="modal-approve-confirm"
                disabled={busy}
                onClick={() => void karar("onay")}
                style={{ ...styles.modalApproveBtn, ...(busy ? { opacity: 0.6 } : {}) }}
              >
                {busy ? <span style={styles.spinnerLight} /> : null}
                {busy ? "Onaylanıyor…" : "Onayla ve maili gönder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ret / düzeltme modalı */}
      {modal === "ret" && (
        <div style={styles.modalOverlay} onClick={() => !busy && setModal(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Düzeltme iste</h3>
            <p style={styles.modalText}>
              <strong>{participantTitle(p)}</strong>
            </p>
            <p style={styles.modalText}>
              Düzeltme istenen yerleri yazın; not, düzeltme talebi mail şablonuyla{" "}
              {p.authors.length > 1 ? `${p.authors.length} yazara` : "yazara"} otomatik gönderilecek.
            </p>
            <textarea
              id="reject-note"
              value={duzeltmeNotu}
              onChange={(e) => setDuzeltmeNotu(e.target.value)}
              placeholder={"Örn:\n1) Özet 300 kelimeyi aşıyor, kısaltınız.\n2) Anahtar kelimeler alfabetik sıralanmalı."}
              rows={7}
              style={styles.modalTextarea}
              disabled={busy}
            />
            <div style={styles.modalBtns}>
              <button disabled={busy} onClick={() => setModal(null)} style={styles.modalCancelBtn}>
                Vazgeç
              </button>
              <button
                id="modal-reject-confirm"
                disabled={busy || !duzeltmeNotu.trim()}
                onClick={() => void karar("ret")}
                style={{
                  ...styles.modalRejectBtn,
                  ...(busy || !duzeltmeNotu.trim() ? { opacity: 0.6, cursor: "default" } : {}),
                }}
              >
                {busy ? <span style={styles.spinnerLight} /> : null}
                {busy ? "Gönderiliyor…" : "Reddet ve düzeltme maili gönder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ödeme onay modalı */}
      {modal === "odeme-onay" && (
        <div style={styles.modalOverlay} onClick={() => !busy && setModal(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Ödemeyi onayla</h3>
            <p style={styles.modalText}>
              <strong>{p.adSoyad}</strong> — Ref: {p.ref}
            </p>
            <p style={styles.modalText}>
              Dekontu inceleyip doğruladıysanız onaylayın. Onayladığınızda katılımcıya kaydının
              kesinleştiğini bildiren bir e-posta hemen gönderilecek.
            </p>
            <div style={styles.modalBtns}>
              <button disabled={busy} onClick={() => setModal(null)} style={styles.modalCancelBtn}>
                Vazgeç
              </button>
              <button
                disabled={busy}
                onClick={() => void odemeKarar("onay")}
                style={{ ...styles.modalApproveBtn, ...(busy ? { opacity: 0.6 } : {}) }}
              >
                {busy ? <span style={styles.spinnerLight} /> : null}
                {busy ? "Onaylanıyor…" : "Onayla ve maili gönder"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dekont ret modalı */}
      {modal === "odeme-ret" && (
        <div style={styles.modalOverlay} onClick={() => !busy && setModal(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Dekontu reddet</h3>
            <p style={styles.modalText}>
              <strong>{p.adSoyad}</strong> — Ref: {p.ref}
            </p>
            <p style={styles.modalText}>
              İsteğe bağlı bir not ekleyebilirsiniz; katılımcıya aynı referans numarasıyla dekontunu
              tekrar yüklemesini isteyen nazik bir mail gönderilecek.
            </p>
            <textarea
              value={odemeNot}
              onChange={(e) => setOdemeNot(e.target.value)}
              placeholder={"Örn: Dekont görüntüsü okunamıyor, lütfen daha net bir kopya yükleyin."}
              rows={5}
              style={styles.modalTextarea}
              disabled={busy}
            />
            <div style={styles.modalBtns}>
              <button disabled={busy} onClick={() => setModal(null)} style={styles.modalCancelBtn}>
                Vazgeç
              </button>
              <button
                disabled={busy}
                onClick={() => void odemeKarar("ret")}
                style={{ ...styles.modalRejectBtn, ...(busy ? { opacity: 0.6 } : {}) }}
              >
                {busy ? <span style={styles.spinnerLight} /> : null}
                {busy ? "Gönderiliyor…" : "Reddet ve tekrar yükleme maili gönder"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes adminSpin {
          to { transform: rotate(360deg); }
        }
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoIcon}>{icon}</span>
      <div>
        <div style={styles.infoLabel}>{label}</div>
        <div style={styles.infoValue}>{value}</div>
      </div>
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
    fontFamily: "inherit",
  },
  breadcrumbSep: { color: "#cbd5e1", fontSize: 18 },
  breadcrumbCurrent: { fontSize: 14, fontWeight: 600, color: "#0b2d5a" },
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
    fontFamily: "inherit",
  },
  main: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "36px 24px",
  },
};

const styles: Record<string, React.CSSProperties> = {
  layout: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: 20,
    alignItems: "start",
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  personCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "28px 24px",
    boxShadow: "0 4px 16px rgba(11,45,90,0.07)",
    border: "1px solid rgba(11,45,90,0.09)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: 8,
  },
  personAvatar: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0b2d5a, #2f67b8)",
    color: "#fff",
    fontSize: 24,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    letterSpacing: "1px",
  },
  personName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0b2d5a",
    fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
  },
  personInstitution: {
    fontSize: 13,
    color: "#6b7280",
  },
  personCity: {
    fontSize: 13,
    color: "#94a3b8",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "5px 14px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    marginTop: 8,
  },
  decisionDate: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
  },
  infoCard: {
    background: "#fff",
    borderRadius: 14,
    padding: "20px 20px",
    boxShadow: "0 4px 16px rgba(11,45,90,0.06)",
    border: "1px solid rgba(11,45,90,0.09)",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    margin: "0 0 14px 0",
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  infoRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  infoIcon: {
    fontSize: 16,
    marginTop: 1,
    flexShrink: 0,
  },
  infoLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  infoValue: {
    fontSize: 13,
    color: "#0b2d5a",
    fontWeight: 500,
    marginTop: 1,
    wordBreak: "break-word",
  },
  driveLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    padding: "8px 12px",
    background: "#eef4fb",
    color: "#2f67b8",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
  },
  authorList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  authorItem: {
    padding: "10px 12px",
    background: "#f8fafc",
    borderRadius: 10,
  },
  authorName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0b2d5a",
  },
  authorMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
    wordBreak: "break-word",
  },
  congressPill: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    background: "#f8fafc",
    borderRadius: 10,
  },
  congressDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    flexShrink: 0,
  },
  congressName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0b2d5a",
  },
  congressSub: {
    fontSize: 11,
    color: "#94a3b8",
  },
  abstractCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "28px 32px",
    boxShadow: "0 4px 16px rgba(11,45,90,0.07)",
    border: "1px solid rgba(11,45,90,0.09)",
  },
  abstractTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0b2d5a",
    margin: 0,
    lineHeight: 1.4,
    fontFamily: "var(--font-playfair, 'Playfair Display', Georgia, serif)",
  },
  abstractDivider: {
    height: 1,
    background: "rgba(11,45,90,0.1)",
    margin: "16px 0",
  },
  abstractSubhead: {
    fontSize: 12,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    margin: "0 0 10px 0",
  },
  abstractText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 1.75,
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  keywords: {
    fontSize: 13,
    color: "#6b7280",
    margin: "10px 0 0 0",
  },
  noteCard: {
    background: "#fef9ec",
    border: "1px solid #fde68a",
    borderRadius: 14,
    padding: "18px 22px",
  },
  noteTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#92400e",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    margin: "0 0 8px 0",
  },
  noteText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.65,
    margin: 0,
    whiteSpace: "pre-wrap",
  },
  actionCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "28px 32px",
    boxShadow: "0 4px 16px rgba(11,45,90,0.07)",
    border: "1px solid rgba(11,45,90,0.09)",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0b2d5a",
    margin: "0 0 6px 0",
  },
  actionSub: {
    fontSize: 13,
    color: "#6b7280",
    margin: "0 0 20px 0",
  },
  actionBtns: {
    display: "flex",
    gap: 12,
  },
  approveBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 24px",
    background: "#f0fdf4",
    color: "#2d6a4f",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "#86efac",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  approveBtnActive: {
    background: "#2d6a4f",
    color: "#fff",
    borderColor: "#2d6a4f",
  },
  rejectBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 24px",
    background: "#fef2f2",
    color: "#9b2335",
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "#fecaca",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  rejectBtnActive: {
    background: "#9b2335",
    color: "#fff",
    borderColor: "#9b2335",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(11,45,90,0.45)",
    backdropFilter: "blur(2px)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    background: "#fff",
    borderRadius: 16,
    padding: "28px 30px",
    maxWidth: 520,
    width: "100%",
    boxShadow: "0 24px 64px rgba(11,45,90,0.3)",
    animation: "modalFadeIn 0.25s cubic-bezier(0.2,0.8,0.2,1) both",
    fontFamily: "var(--font-source, 'Source Sans 3', system-ui, sans-serif)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0b2d5a",
    margin: "0 0 12px 0",
  },
  modalText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.6,
    margin: "0 0 12px 0",
  },
  modalTextarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1.5px solid rgba(11,45,90,0.18)",
    borderRadius: 10,
    fontSize: 14,
    color: "#0b2d5a",
    lineHeight: 1.6,
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    marginBottom: 16,
  },
  modalBtns: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  modalCancelBtn: {
    padding: "11px 18px",
    background: "#fff",
    border: "1.5px solid rgba(11,45,90,0.15)",
    borderRadius: 10,
    color: "#6b7280",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  modalApproveBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 20px",
    background: "#2d6a4f",
    border: "2px solid #2d6a4f",
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  modalRejectBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 20px",
    background: "#9b2335",
    border: "2px solid #9b2335",
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  spinnerLight: {
    display: "inline-block",
    width: 14,
    height: 14,
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "adminSpin 0.7s linear infinite",
  },
  toast: {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 20px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    animation: "toastSlideIn 0.35s cubic-bezier(0.2,0.8,0.2,1) both",
    maxWidth: "min(90vw, 640px)",
    fontFamily: "var(--font-source, 'Source Sans 3', system-ui, sans-serif)",
  },
  toastSuccess: {
    background: "#2d6a4f",
    color: "#fff",
  },
  toastError: {
    background: "#9b2335",
    color: "#fff",
  },
};
