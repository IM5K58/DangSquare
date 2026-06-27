"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { chatApi, type ChatRoomResponse } from "@/lib/api";
import styles from "./chat.module.css";
import FooterBar from "@/components/FooterBar";

export default function ChatListPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<ChatRoomResponse[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getToken();
      if (!token) {
        router.replace("/onboarding");
        return;
      }

      // 채팅방 목록 로드
      const loadRooms = async () => {
        try {
          const data = await chatApi.getRooms();
          // 최근 대화 순 정렬
          const sorted = [...data].sort((a, b) => {
            const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return timeB - timeA;
          });
          setRooms(sorted);
        } catch (e) {
          console.error("Failed to load chat rooms", e);
        } finally {
          setLoading(false);
        }
      };

      loadRooms();
    }
  }, [router]);

  // 대화 시간 가독성 있게 포맷팅
  const formatTime = (isoString: string | null): string => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);

    if (diffMin < 1) return "방금 전";
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHr < 24) return `${diffHr}시간 전`;
    
    // 하루 이상 지난 경우 년/월/일 표기
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  const handleRoomClick = (roomId: number) => {
    router.push(`/chat/${roomId}`);
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
        <h1 className={styles.titleText}>메시지</h1>
      </header>

      {/* 2. Content */}
      <main className={styles.content}>
        {loading ? (
          <div className={styles.loadingBox}>
            <p>대화 목록을 불러오는 중입니다...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <h2 className={styles.emptyText}>아직 대화가 없어요!</h2>
            <p className={styles.emptySubText}>
              산책 매칭 지도에서 동네 반려견 친구들을 찾고<br />
              산책 매칭을 신청해 첫 대화를 시작해보세요.
            </p>
            <button 
              type="button" 
              className={styles.emptyBtn}
              onClick={() => router.push("/walk")}
            >
              친구 찾으러 가기
            </button>
          </div>
        ) : (
          <div className={styles.roomList}>
            {rooms.map((room) => (
              <div 
                key={room.roomId} 
                className={styles.roomItem}
                onClick={() => handleRoomClick(room.roomId)}
              >
                {/* 프로필 이미지 (디폴트 강아지 마스코트 처리) */}
                <div className={styles.avatarContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={room.partner.profileImageUrl || "/dangsquare_mascot_official.png"} 
                    alt={`${room.partner.nickname} 프로필`}
                    className={styles.avatar}
                  />
                </div>

                {/* 방 정보 */}
                <div className={styles.roomInfo}>
                  <div className={styles.roomMeta}>
                    <span className={styles.partnerName}>
                      {room.partner.nickname}
                    </span>
                    <span className={styles.timeText}>
                      {formatTime(room.lastMessageAt)}
                    </span>
                  </div>
                  <div className={styles.messageRow}>
                    <p className={styles.lastMessage}>
                      {room.lastMessage || "대화를 시작해 보세요!"}
                    </p>
                  </div>
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
