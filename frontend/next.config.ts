import type { NextConfig } from "next";

// 개발 중 /api/* 요청을 백엔드(Spring)로 프록시한다.
// 브라우저는 같은 오리진(3000)으로 호출 → CORS 불필요.
// 배포/환경별로 BACKEND_URL 로 대상 주소를 바꿀 수 있다.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
