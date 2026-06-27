"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, consumeAuthFromQuery } from "@/lib/auth";
import { userApi } from "@/lib/api";
import styles from "./dashboard.module.css";
import FooterBar from "@/components/FooterBar";

type OnboardingData = {
  owner: {
    name: string;
    gender: "male" | "female" | "";
  };
  dog: {
    name: string;
    gender: "male" | "female" | "";
    breed: string;
    personality: "active" | "warm" | "shy" | "";
    photo: string | null;
  };
  completedAt: string;
};

export default function Home() {
  const router = useRouter();

  // 온보딩 & 사용자 정보 상태
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  
  // 에코 라이프 웰컴 배너 표시 상태
  const [showEcoBanner, setShowEcoBanner] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. URL 쿼리 파라미터(?token=...&onboarded=...) 추출 및 로컬 스토리지 보관
      const { onboarded: queryOnboarded } = consumeAuthFromQuery();
      
      const token = getToken();
      const onboarded = queryOnboarded || localStorage.getItem("dangsquare_onboarded") === "true";

      if (!token) {
        router.push("/onboarding");
        return;
      }
      if (!onboarded) {
        router.push("/onboarding");
        return;
      }

      // 에코 배너 닫힘 여부 체크
      const isBannerClosed = localStorage.getItem("dangsquare_eco_banner_closed") === "true";
      if (isBannerClosed) {
        setShowEcoBanner(false);
      }

      // 2. 온보딩 데이터 로드 및 백엔드 동기화
      const dataStr = localStorage.getItem("dangsquare_onboarding");
      if (dataStr) {
        try {
          setOnboardingData(JSON.parse(dataStr));
          setCheckingOnboarding(false);
        } catch (e) {
          console.error("Failed to parse onboarding data", e);
          setCheckingOnboarding(false);
        }
      } else {
        // 기존 회원이 새 기기/세션으로 로그인하여 캐시가 없는 경우 백엔드에서 사용자 데이터를 가져옴
        const syncOnboardingCache = async () => {
          try {
            const userMe = await userApi.me();
            if (userMe) {
              const firstDog = userMe.dogs && userMe.dogs.length > 0 ? userMe.dogs[0] : null;
              const syncedData: OnboardingData = {
                owner: {
                  name: userMe.nickname || "견주",
                  gender: userMe.gender === "MALE" ? "male" : userMe.gender === "FEMALE" ? "female" : "",
                },
                dog: firstDog ? {
                  name: firstDog.name,
                  gender: firstDog.gender === "MALE" ? "male" : firstDog.gender === "FEMALE" ? "female" : "",
                  breed: firstDog.breed || "",
                  personality: firstDog.temperament === "ACTIVE" ? "active" : firstDog.temperament === "FRIENDLY" ? "warm" : firstDog.temperament === "SHY" ? "shy" : "",
                  photo: firstDog.imageUrl || null,
                } : {
                  name: "강아지",
                  gender: "",
                  breed: "",
                  personality: "",
                  photo: null,
                },
                completedAt: new Date().toISOString(),
              };
              localStorage.setItem("dangsquare_onboarding", JSON.stringify(syncedData));
              localStorage.setItem("dangsquare_onboarded", "true");
              setOnboardingData(syncedData);
            }
          } catch (e) {
            console.error("Failed to sync user onboarding data from backend", e);
          } finally {
            setCheckingOnboarding(false);
          }
        };

        syncOnboardingCache();
      }
    }
  }, [router]);

  // 에코 웰컴 배너 닫기
  const handleCloseEcoBanner = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEcoBanner(false);
    localStorage.setItem("dangsquare_eco_banner_closed", "true");
  };

  // 피그마 시안과 동일한 핫게시글 모의 클릭 핸들러
  const handleFeatureAlert = (featureName: string) => {
    alert(`"${featureName}" 서비스는 준비 중입니다.`);
  };

  if (checkingOnboarding) {
    return (
      <div className={styles.container} style={{ justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "#9ca3af", fontSize: "14px" }}>대시보드를 불러오는 중입니다...</p>
      </div>
    );
  }

  const ownerName = onboardingData?.owner?.name || "견주";
  const dogName = onboardingData?.dog?.name || "강아지";

  return (
    <div className={styles.container}>
      {/* 1. Header */}
      <header className={styles.headerBlock}>
        <div className={styles.logoText}>Dangsquare</div>
        <div className={styles.headerActions}>
          {/* 검색 아이콘 */}
          <button 
            type="button" 
            className={styles.iconBtn}
            onClick={() => handleFeatureAlert("통합 검색")}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.3">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* 알림 아이콘 */}
          <button 
            type="button" 
            className={styles.iconBtn}
            onClick={() => handleFeatureAlert("실시간 알림")}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className={styles.alarmDot}></span>
          </button>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className={styles.content}>
        
        {/* 안녕하세요 & 산책 대시보드 헤더 */}
        <div className={styles.greetingRow}>
          <div>
            <div className={styles.welcomeText}>안녕하세요 👋</div>
            <div className={styles.userNameText}>
              <span>{ownerName}</span>님의 산책 대시보드
            </div>
          </div>
          
          {/* 이번 달 산책 횟수 배지 */}
          <div className={styles.walkBadge}>
            <div className={styles.walkBadgeNum}>28</div>
            <div className={styles.walkBadgeLabel}>이번 달 산책</div>
          </div>
        </div>

        {/* 에코 라이프 웰컴 배너 */}
        {showEcoBanner && (
          <div className={styles.ecoBanner}>
            <div className={styles.ecoLeft}>
              <div className={styles.ecoTag}>
                <span>🌿</span> 에코 라이프
              </div>
              <h2 className={styles.ecoTitle}>
                반가워요! <span>{dogName}</span>와 함께<br />
                댕스퀘어 시작하기
              </h2>
              <p className={styles.ecoDesc}>
                동네 친구와 산책 매칭도 하고 저탄소 마켓을 탐색해 보세요.
              </p>
              <button 
                type="button" 
                className={styles.ecoBtn}
                onClick={() => router.push("/walk")}
              >
                시작하기
              </button>
            </div>
            
            <div className={styles.ecoRight}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/eco_dog_banner.png" 
                alt="Eco Dog Banner Illustration" 
                className={styles.ecoDogImg}
              />
            </div>

            <button 
              type="button" 
              className={styles.ecoCloseBtn}
              onClick={handleCloseEcoBanner}
              aria-label="웰컴 배너 닫기"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* 지도 카드 (지도 보기로 이동하는 링크 포함) */}
        <div className={styles.mapCard} onClick={() => router.push("/walk")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/map_preview.png" 
            alt="Map Preview Background" 
            className={styles.mapCardBg}
          />
          
          {/* 말풍선 오버레이 */}
          <div className={styles.mapBubble}>
            📍 지금 <span>흑석동</span>에 <span>6</span>마리의 친구들이 산책 중이에요!
          </div>

          {/* 지도 보기 버튼 */}
          <button 
            type="button" 
            className={styles.mapGoBtn}
            onClick={(e) => {
              e.stopPropagation();
              router.push("/walk");
            }}
          >
            지도 보기 →
          </button>
        </div>

        {/* 실시간 동네 핫게시글 섹션 */}
        <div className={styles.postsSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              🔥 실시간 동네 핫게시글
            </div>
            <div 
              className={styles.sectionMore}
              onClick={() => router.push("/community")}
            >
              더보기 &gt;
            </div>
          </div>

          <div className={styles.postsScrollRow}>
            {/* 핫게시글 카드 1 */}
            <div className={styles.postCard} onClick={() => router.push("/community")}>
              <div>
                <span className={`${styles.postTag} ${styles.postTagHot}`}>
                  핫게시글
                </span>
                <h3 className={styles.postTitle}>🌱 이달의 산책왕 발표!</h3>
                <p className={styles.postDesc}>
                  이번 달 가장 많이 산책한 댕스퀘어 멤버를 공개합니다. 무려 월 52회, 총 138km를 달성한...
                </p>
              </div>
              <span className={styles.postDetailLink}>자세히 &gt;</span>
            </div>

            {/* 핫게시글 카드 2 */}
            <div className={styles.postCard} onClick={() => router.push("/community")}>
              <div>
                <span className={`${styles.postTag} ${styles.postTagNotice}`}>
                  공지
                </span>
                <h3 className={styles.postTitle}>🏆 에코 캐릭터 공모전 결...</h3>
                <p className={styles.postDesc}>
                  제2회 저탄소 강아지 캐릭터 공모전의 심사 결과 및 수상작이 발표되었습니다. 총 1,240개 작...
                </p>
              </div>
              <span className={styles.postDetailLink}>자세히 &gt;</span>
            </div>
          </div>
        </div>

      </main>

      {/* 3. Footer Bar */}
      <FooterBar activeTab="matching" />
    </div>
  );
}
