"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, type Health, type Sample } from "@/lib/api";

export default function Home() {
  const [health, setHealth] = useState<Health | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [h, s] = await Promise.all([api.health(), api.listSamples()]);
      setHealth(h);
      setSamples(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setError(null);
      await api.createSample(name.trim());
      setName("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    }
  }

  return (
    <main
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: 32,
        fontFamily: "system-ui, sans-serif",
        lineHeight: 1.5,
      }}
    >
      <h1>netzero</h1>
      <p>프론트엔드(Next.js) ↔ 백엔드(Spring) 연결 확인 페이지</p>

      <section style={{ marginTop: 24 }}>
        <h2>백엔드 상태</h2>
        {health ? (
          <pre
            style={{
              background: "#f4f4f5",
              padding: 12,
              borderRadius: 8,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(health, null, 2)}
          </pre>
        ) : (
          <p>불러오는 중…</p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>샘플 목록</h2>
        <form
          onSubmit={onSubmit}
          style={{ display: "flex", gap: 8, marginBottom: 12 }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 입력"
            style={{ flex: 1, padding: 8 }}
          />
          <button type="submit" style={{ padding: "8px 16px" }}>
            추가
          </button>
        </form>
        {samples.length === 0 ? (
          <p>아직 샘플이 없습니다.</p>
        ) : (
          <ul>
            {samples.map((s) => (
              <li key={s.id}>
                #{s.id} {s.name} <small>({s.createdAt})</small>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && (
        <p style={{ color: "crimson", marginTop: 16 }}>
          오류: {error} — 백엔드(8080)가 실행 중인지 확인하세요.
        </p>
      )}
    </main>
  );
}
