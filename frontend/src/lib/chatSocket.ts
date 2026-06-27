import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getToken } from "./auth";
import { type MessageResponse } from "./api";

export type MessageCallback = (message: MessageResponse) => void;

class ChatSocketService {
  private client: Client | null = null;
  private subscriptions: Map<number, any> = new Map();
  private onConnectCallbacks: Set<() => void> = new Set();
  private connecting = false;

  /** WebSocket & STOMP 서버에 접속을 시작합니다. */
  public connect(onConnect?: () => void): void {
    if (onConnect) {
      this.onConnectCallbacks.add(onConnect);
    }

    if (this.client?.active || this.connecting) {
      // 이미 활성화되어 있거나 연결 중이면 즉시 콜백을 실행(연결되어 있다면)하거나 대기
      if (this.client?.connected && onConnect) {
        onConnect();
      }
      return;
    }

    this.connecting = true;
    console.log("[ChatSocket] Initiating socket connection...");

    const token = getToken();
    if (!token) {
      console.warn("[ChatSocket] Cannot connect to socket: No authentication token found.");
      this.connecting = false;
      return;
    }

    // SockJS 및 STOMP Client 설정
    const socketFactory = () => new SockJS("/ws");

    this.client = new Client({
      webSocketFactory: socketFactory,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (msg) => {
        // 개발 디버그용 로그
        console.log(`[STOMP Debug] ${msg}`);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      this.connecting = false;
      console.log("[ChatSocket] Socket connected successfully!", frame);
      
      // 연결 대기 콜백들 실행
      this.onConnectCallbacks.forEach((cb) => cb());
      this.onConnectCallbacks.clear();
    };

    this.client.onStompError = (frame) => {
      this.connecting = false;
      console.error("[ChatSocket] Broker reported error: " + frame.headers["message"]);
      console.error("[ChatSocket] Additional details: " + frame.body);
    };

    this.client.onDisconnect = () => {
      this.connecting = false;
      console.log("[ChatSocket] Socket disconnected.");
    };

    this.client.onWebSocketClose = () => {
      this.connecting = false;
      console.log("[ChatSocket] Underlying WebSocket connection closed.");
    };

    this.client.activate();
  }

  /** 특정 채팅방의 실시간 대화를 구독합니다. */
  public subscribeRoom(roomId: number, onMessage: MessageCallback): void {
    const action = () => {
      if (!this.client || !this.client.connected) {
        console.warn("[ChatSocket] Cannot subscribe: STOMP client is not connected.");
        return;
      }

      // 이미 구독 중인 동일 방 해제 처리
      this.unsubscribeRoom(roomId);

      const destination = `/topic/rooms/${roomId}`;
      console.log(`[ChatSocket] Subscribing to room channel: ${destination}`);

      const sub = this.client.subscribe(destination, (stompMessage) => {
        try {
          const messageData = JSON.parse(stompMessage.body) as MessageResponse;
          console.log("[ChatSocket] Received real-time message:", messageData);
          onMessage(messageData);
        } catch (e) {
          console.error("[ChatSocket] Failed to parse raw message body:", e);
        }
      });

      this.subscriptions.set(roomId, sub);
    };

    if (this.client?.connected) {
      action();
    } else {
      console.log("[ChatSocket] Deferring subscription until connected...");
      this.connect(action);
    }
  }

  /** 특정 채팅방의 구독을 해제합니다. */
  public unsubscribeRoom(roomId: number): void {
    const sub = this.subscriptions.get(roomId);
    if (sub) {
      console.log(`[ChatSocket] Unsubscribing from room channel: ${roomId}`);
      sub.unsubscribe();
      this.subscriptions.delete(roomId);
    }
  }

  /** 대화방에 실시간 메시지를 발송합니다. */
  public sendMessage(roomId: number, content: string): void {
    if (!this.client || !this.client.connected) {
      console.error("[ChatSocket] Cannot send message: Socket is not connected.");
      return;
    }

    const destination = "/app/chat.send";
    const body = {
      roomId,
      content,
    };

    console.log(`[ChatSocket] Publishing message to ${destination}:`, body);
    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  /** 소켓 연결을 완전히 종료합니다. */
  public disconnect(): void {
    if (this.client) {
      console.log("[ChatSocket] Disconnecting STOMP client...");
      // 모든 구독 취소
      Array.from(this.subscriptions.keys()).forEach((roomId) => {
        this.unsubscribeRoom(roomId);
      });
      this.client.deactivate();
      this.client = null;
      this.connecting = false;
    }
  }
}

// 싱글톤 인스턴스로 관리하여 앱 전역에서 유일한 WebSocket 세션을 유지
export const chatSocket = new ChatSocketService();
