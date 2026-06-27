"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getToken, getUserId } from "@/lib/auth";
import { chatApi, type MessageResponse, type ChatRoomResponse } from "@/lib/api";
import { chatSocket } from "@/lib/chatSocket";
import styles from "./chatRoom.module.css";

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  
  // URL dynamic segment 파싱 (문자열 -> 숫자)
  const roomId = Number(params.roomId);

  const [loading, setLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState<ChatRoomResponse | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputText, setInputText] = useState("");
  
  const myUserId = getUserId() || 0;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤 하단 이동 헬퍼
  const scrollToBottom = (behavior: "auto" | "smooth" = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getToken();
      if (!token || isNaN(roomId)) {
        router.replace("/onboarding");
        return;
      }

      // 1. 초기 대화방 정보 및 이전 메시지 내역 로드
      const loadInitialData = async () => {
        try {
          // 채팅방 목록에서 본 방의 파트너 정보를 탐색
          const allRooms = await chatApi.getRooms();
          const targetRoom = allRooms.find((r) => r.roomId === roomId);
          if (targetRoom) {
            setRoomInfo(targetRoom);
          }

          // 이전 메시지 50개 로드
          const msgPage = await chatApi.getMessages(roomId, 0, 50);
          // 과거 순서대로 정렬 (백엔드는 최신 메시지 역순으로 주는 경우가 많으므로 오름차순 정렬)
          const sortedMsgs = [...msgPage.content].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          setMessages(sortedMsgs);
          
          // 데이터 로드 완료 후 최초 1회 즉시 스크롤 하단 고정
          setTimeout(() => scrollToBottom("auto"), 50);
        } catch (e) {
          console.error("Failed to initialize chat room data", e);
        } finally {
          setLoading(false);
        }
      };

      loadInitialData();

      // 2. 실시간 웹소켓 구독 시작
      chatSocket.subscribeRoom(roomId, (newMsg) => {
        setMessages((prev) => {
          // 중복 메시지 중복 추가 방지 안전망
          if (prev.some((m) => m.messageId === newMsg.messageId)) {
            return prev;
          }
          return [...prev, newMsg];
        });
      });

      // 언마운트 시 해당 방 구독 해제
      return () => {
        chatSocket.unsubscribeRoom(roomId);
      };
    }
  }, [roomId, router]);

  // 새로운 메시지가 추가될 때마다 스크롤을 하단으로 이동
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      // 1. 실시간 STOMP 메시지 발행 (상대방 및 나에게 소켓으로 동시 전파됨)
      chatSocket.sendMessage(roomId, inputText.trim());
      
      // 2. 텍스트 입력창 초기화
      setInputText("");
    } catch (err) {
      console.error("Failed to send message via socket", err);
    }
  };

  // 대화 말풍선 시각 표기 헬퍼 (오후 3:12 포맷)
  const formatTimeLabel = (isoString: string): string => {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "오후" : "오전";
    hours = hours % 12;
    hours = hours ? hours : 12; // 0시는 12시로 표시
    return `${ampm} ${hours}:${minutes}`;
  };

  const partnerNickname = roomInfo?.partner.nickname || "파트너";
  const partnerPhoto = roomInfo?.partner.profileImageUrl || "/dangsquare_mascot_official.png";

  return (
    <div className={styles.container}>
      {/* 1. Header */}
      <header className={styles.headerBlock}>
        <button 
          type="button" 
          className={styles.backBtn}
          onClick={() => router.push("/chat")}
          aria-label="채팅방 목록으로 돌아가기"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className={styles.partnerInfo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={partnerPhoto} 
            alt={`${partnerNickname} 프로필`}
            className={styles.avatar}
          />
          <span className={styles.partnerName}>{partnerNickname}</span>
        </div>
      </header>

      {/* 2. Message Content Area */}
      <main className={styles.messageArea}>
        {loading ? (
          <div className={styles.loadingBox}>
            <p>대화 내용을 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isMine = msg.senderId === myUserId;
              return (
                <div 
                  key={msg.messageId} 
                  className={`${styles.messageItem} ${isMine ? styles.messageMine : styles.messageOther}`}
                >
                  {/* 상대방 메시지일 때만 아바타 노출 */}
                  {!isMine && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={partnerPhoto} 
                      alt={partnerNickname} 
                      className={styles.otherAvatar}
                    />
                  )}

                  {/* 메시지 풍선 */}
                  <div className={`${styles.bubble} ${isMine ? styles.bubbleMine : styles.bubbleOther}`}>
                    {msg.content}
                  </div>

                  {/* 전송 시각 */}
                  <span className={styles.msgTime}>
                    {formatTimeLabel(msg.createdAt)}
                  </span>
                </div>
              );
            })}
            {/* 스크롤 하단 고정용 더미 요소 */}
            <div ref={messagesEndRef} />
          </>
        )}
      </main>

      {/* 3. Message Input Area */}
      <form className={styles.inputArea} onSubmit={handleSend}>
        <input
          type="text"
          className={styles.inputField}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`${partnerNickname} 견주님께 메시지 보내기...`}
          disabled={loading}
        />
        <button
          type="submit"
          className={`${styles.sendBtn} ${!inputText.trim() ? styles.sendBtnDisabled : ""}`}
          disabled={loading || !inputText.trim()}
          aria-label="전송"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
