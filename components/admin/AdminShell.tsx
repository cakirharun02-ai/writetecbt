"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminLogin } from "./AdminLogin";
import { AdminCongressList } from "./AdminCongressList";
import { AdminParticipantList } from "./AdminParticipantList";
import { AdminParticipantDetail } from "./AdminParticipantDetail";
import { CONGRESSES } from "./congresses";
import type { Congress, CongressData, Participant } from "./types";
import { normalizeDurum } from "./types";

type View = "login" | "congresses" | "participants" | "detail";

const EMPTY_DATA: CongressData = { participants: [], loading: true, error: "" };

export function AdminShell() {
  const [view, setView] = useState<View>("login");
  const [checkingSession, setCheckingSession] = useState(true);
  const [selectedCongress, setSelectedCongress] = useState<Congress | null>(null);
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, CongressData>>({});

  const loadCongress = useCallback(async (congressId: string) => {
    setData((prev) => ({
      ...prev,
      [congressId]: { ...(prev[congressId] ?? EMPTY_DATA), loading: true, error: "" },
    }));
    try {
      const res = await fetch(`/api/admin/participants?congress=${encodeURIComponent(congressId)}`);
      if (res.status === 401) {
        setView("login");
        return;
      }
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Liste alınamadı.");
      const participants: Participant[] = (json.basvurular ?? []).map(
        (p: Participant) => ({
          ...p,
          durum: normalizeDurum(p.durum),
          revizyon: Number(p.revizyon) || 0,
          katilimSekli: String(p.katilimSekli || ""),
        })
      );
      setData((prev) => ({
        ...prev,
        [congressId]: { participants, loading: false, error: "" },
      }));
    } catch (err) {
      setData((prev) => ({
        ...prev,
        [congressId]: {
          participants: prev[congressId]?.participants ?? [],
          loading: false,
          error: err instanceof Error ? err.message : String(err),
        },
      }));
    }
  }, []);

  const loadAll = useCallback(() => {
    CONGRESSES.forEach((c) => void loadCongress(c.id));
  }, [loadCongress]);

  // Oturum kontrolü (httpOnly cookie sunucuda doğrulanır)
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/login")
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setView("congresses");
          loadAll();
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadAll]);

  function handleLogin() {
    setView("congresses");
    loadAll();
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } catch {}
    setSelectedCongress(null);
    setSelectedRef(null);
    setData({});
    setView("login");
  }

  function handleSelectCongress(congress: Congress) {
    setSelectedCongress(congress);
    setView("participants");
    // Detaydan dönüşlerde bayat kalmasın diye tazele
    if (!data[congress.id] || data[congress.id].error) void loadCongress(congress.id);
  }

  function handleSelectParticipant(participant: Participant) {
    setSelectedRef(participant.ref);
    setView("detail");
  }

  /** Karar sonrası Apps Script'in döndürdüğü güncel alanları state'e işler. */
  function handleParticipantUpdated(congressId: string, updated: Partial<Participant> & { ref: string }) {
    setData((prev) => {
      const cd = prev[congressId];
      if (!cd) return prev;
      return {
        ...prev,
        [congressId]: {
          ...cd,
          participants: cd.participants.map((p) =>
            p.ref === updated.ref ? { ...p, ...updated, durum: normalizeDurum(String(updated.durum ?? p.durum)) } : p
          ),
        },
      };
    });
  }

  if (checkingSession) {
    return (
      <div className="admin-shell" style={{ minHeight: "100vh", background: "#f3f7fc" }} />
    );
  }

  const selectedData: CongressData =
    (selectedCongress && data[selectedCongress.id]) || EMPTY_DATA;
  const selectedParticipant =
    selectedRef != null
      ? selectedData.participants.find((p) => p.ref === selectedRef) ?? null
      : null;

  return (
    <div className="admin-shell">
      {view === "login" && <AdminLogin onLogin={handleLogin} />}
      {view === "congresses" && (
        <AdminCongressList
          data={data}
          onSelectCongress={handleSelectCongress}
          onLogout={handleLogout}
        />
      )}
      {view === "participants" && selectedCongress && (
        <AdminParticipantList
          congress={selectedCongress}
          data={selectedData}
          onRefresh={() => void loadCongress(selectedCongress.id)}
          onSelectParticipant={handleSelectParticipant}
          onBack={() => {
            setSelectedCongress(null);
            setSelectedRef(null);
            setView("congresses");
          }}
          onLogout={handleLogout}
        />
      )}
      {view === "detail" && selectedParticipant && selectedCongress && (
        <AdminParticipantDetail
          participant={selectedParticipant}
          congress={selectedCongress}
          onBack={() => {
            setSelectedRef(null);
            setView("participants");
          }}
          onLogout={handleLogout}
          onUpdated={(updated) => handleParticipantUpdated(selectedCongress.id, updated)}
        />
      )}
    </div>
  );
}
