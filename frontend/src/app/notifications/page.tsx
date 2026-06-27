"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { friendApi, chatApi, type FriendRequestItem } from "@/lib/api";
import styles from "./notifications.module.css";
import FooterBar from "@/components/FooterBar";

export default function NotificationsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<FriendRequestItem[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getToken();
      if (!token) {
        router.replace("/onboarding");
        return;
      }

      // 받은 산책 매칭 요청 로드
      const loadRequests = async () => {
        try {
          const data = await friendApi.getReceivedRequests();
          setRequests(data);
        } catch (e) {
          console.error("Failed to load received friend requests", e);
        } finally {
          setLoading(false);
        }
      };

      loadRequests();
    }
  }, [router]);

  // 친구 요청 수락 핸들러
  const handleAccept = async (requestId: number, partnerNickname: string) => {
    try {
      setLoading(true);
      // 1. 친구 요청 수락
      await friendApi.acceptRequest(requestId);
      
      // 2. 카드 목록에서 제거
      setRequests((prev) => prev.filter((req) => req.requestId !== requestId));
      alert(`${partnerNickname} 견주님과 친구가 되었습니다! 🐾`);
    } catch (e) {
      console.error("Failed to accept friend request", e);
      alert("요청 수락에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 산책 매칭 거절 핸들러 (거절 -> 목록에서 제외)
  const handleReject = async (requestId: number, partnerNickname: string) => {
    try {
      setLoading(true);
      // 산책 요청 거절
      await friendApi.rejectRequest(requestId);
      
      // 상태에서 해당 카드 제거
      setRequests((prev) => prev.filter((req) => req.requestId !== requestId));
      alert(`${partnerNickname} 견주님의 산책 요청을 거절했습니다.`);
    } catch (e) {
      console.error("Failed to reject walk request", e);
      alert("요청 거절에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 시간 포맷팅 헬퍼 (예: 6월 27일 오전 10:24)
  const formatDateTime = (isoString: string): string => {
    const date = new Date(isoString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "오후" : "오전";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${month}월 ${day}일 ${ampm} ${hours}:${minutes}`;
  };

  return (
    <div className={styles.container}>
      {/* 1. Header */}
      <header className={styles.headerBlock}>
        <button 
          type="button" 
          className={styles.backBtn}
          onClick={() => router.push("/")}
          aria-label="홈으로 가기"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className={styles.titleText}>알림</h1>
      </header>

      {/* 2. Content */}
      <main className={styles.content}>
        {loading ? (
          <div className={styles.loadingBox}>
            <p>알림 내역을 불러오는 중입니다...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔔</div>
            <h2 className={styles.emptyText}>새로운 알림이 없어요</h2>
            <p className={styles.emptySubText}>
              도도한 댕댕이 친구들이 산책 매칭을 신청하면<br />
              이곳에서 알림을 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <div className={styles.listContainer}>
            {requests.map((req) => (
              <div key={req.requestId} className={styles.card}>
                <div className={styles.cardHeader}>
                  {/* 프로필 이미지 (디폴트 강아지 마스코트 처리) */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={req.user.profileImageUrl || "/dangsquare_mascot_official.png"} 
                    alt={`${req.user.nickname} 프로필`}
                    className={styles.avatar}
                  />
                  <div className={styles.info}>
                    <div>
                      <span className={styles.senderName}>{req.user.nickname}</span>
                      <span className={styles.timeText}>{formatDateTime(req.createdAt)}</span>
                    </div>
                     <p className={styles.bodyText}>
                      <span>친구 신청</span>을 보냈습니다. 친구가 되어 함께 걸으시겠어요?
                    </p>
                  </div>
                </div>

                {/* 수락 / 거절 액션 버튼 */}
                <div className={styles.actionRow}>
                  <button 
                    type="button" 
                    className={`${styles.btn} ${styles.btnReject}`}
                    onClick={() => handleReject(req.requestId, req.user.nickname)}
                  >
                    거절
                  </button>
                  <button 
                    type="button" 
                    className={`${styles.btn} ${styles.btnAccept}`}
                    onClick={() => handleAccept(req.requestId, req.user.nickname)}
                  >
                    수락
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 3. Footer Bar */}
      <FooterBar activeTab="matching" />
    </div>
  );
}
