// 브라우저(클라이언트 컴포넌트)에서 호출하는 API 클라이언트.
// 요청은 상대경로 /api/* 로 나가고, next.config.ts 의 rewrites 가
// 백엔드(기본 http://localhost:8080)로 프록시한다 → 개발 중 CORS 불필요.
//
// 서버 컴포넌트나 route handler 에서 호출할 때는 절대경로가 필요하므로
// 그 경우엔 process.env.BACKEND_URL 을 직접 사용하세요.

export type Health = {
  status: string;
  service: string;
  time: string;
};

export type Sample = {
  id: number;
  name: string;
  createdAt: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${path} 요청 실패 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<Health>("/health"),
  listSamples: () => request<Sample[]>("/samples"),
  createSample: (name: string) =>
    request<Sample>("/samples", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
};
