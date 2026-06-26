"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, type Health, type Sample } from "@/lib/api";
import styles from "./home.module.css";
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
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

  const [health, setHealth] = useState<Health | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 커스텀 알림 모달 상태
  const [customAlert, setCustomAlert] = useState<{
    message: string;
    type: "success" | "warning" | "feature";
    onConfirm?: () => void;
  } | null>(null);

  // 커스텀 확인(Confirm) 모달 상태
  const [customConfirm, setCustomConfirm] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

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

  // 온보딩 완료 상태 체크
  useEffect(() => {
    const isCompleted = localStorage.getItem("dangsquare_onboarding_completed");
    if (isCompleted !== "true") {
      router.push("/onboarding");
    } else {
      const dataStr = localStorage.getItem("dangsquare_onboarding_data");
      if (dataStr) {
        try {
          setOnboardingData(JSON.parse(dataStr));
        } catch (e) {
          console.error("Failed to parse onboarding data", e);
        }
      }
      setCheckingOnboarding(false);
      refresh();
    }
  }, [router, refresh]);

  // 온보딩 리셋
  const handleResetOnboarding = () => {
    setCustomConfirm({
      message: "온보딩을 다시 진행하시겠습니까?\n현재 저장된 정보가 모두 초기화됩니다.",
      onConfirm: () => {
        localStorage.removeItem("dangsquare_onboarding_completed");
        localStorage.removeItem("dangsquare_onboarding_data");
        router.push("/onboarding");
      }
    });
  };

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

  const handleFeatureAlert = (featureName: string) => {
    setCustomAlert({
      message: `"${featureName}" 기능은 다음 업데이트에 추가될 예정입니다!\n단추가 곧 안내해 드릴게요 🐶`,
      type: "feature"
    });
  };

  if (checkingOnboarding) {
    return (
      <div className={styles.container}>
        <div style={{ color: "#0e7060", fontWeight: 600 }}>온보딩 여부를 확인하는 중…</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.scrollWrapper}>
          
          {/* Header */}
          <div className={styles.headerBlock}>
            <div className={styles.headerRow}>
              <div>
                <div className={styles.title}>Dangsquare</div>
                <div className={styles.subtitle}>발걸음마다 싱그러운 에코 라이프</div>
              </div>
              <button 
                type="button" 
                className={styles.resetBtn}
                onClick={handleResetOnboarding}
              >
                리셋 🔄
              </button>
            </div>
          </div>

          {/* Onboarding Info Card */}
          {onboardingData && (
            <div className={styles.infoCard}>
              <div className={styles.welcomeText}>반갑습니다, {onboardingData.owner.name} 견주님!</div>
              <div className={styles.gridInfo}>
                <div className={styles.infoTile}>
                  <div>
                    <p className={styles.tileLabel}>내 정보</p>
                    <p className={styles.tileValue}>
                      {onboardingData.owner.name} ({onboardingData.owner.gender === "male" ? "남성" : "여성"})
                    </p>
                  </div>
                </div>

                <div className={styles.infoTile}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={onboardingData.dog.photo || "/dangsquare_mascot_official.png"}
                    alt="Dog Avatar"
                    className={styles.dogAvatar}
                  />
                  <div>
                    <p className={styles.tileLabel}>함께하는 강아지</p>
                    <p className={styles.tileValue}>{onboardingData.dog.name}</p>
                    <p className={styles.tileSub}>
                      {onboardingData.dog.gender === "male" ? "남아" : "여아"} • {onboardingData.dog.breed}
                    </p>
                    <p className={styles.tileSub} style={{ marginTop: 2, fontWeight: 500 }}>
                      성향: {onboardingData.dog.personality === "active" ? "🔥 활발" : onboardingData.dog.personality === "warm" ? "☀️ 온순" : "☁️ 소심"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Connection & Samples */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitle}>백엔드 상태</div>
            {health ? (
              <pre className={styles.preBlock}>
                {JSON.stringify(health, null, 2)}
              </pre>
            ) : (
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>불러오는 중…</p>
            )}
          </div>

          <div className={styles.sectionBlock} style={{ paddingBottom: 24 }}>
            <div className={styles.sectionTitle}>샘플 목록</div>
            <form onSubmit={onSubmit} className={styles.formRow}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름 입력"
                className={styles.formInput}
              />
              <button type="submit" className={styles.addBtn}>
                추가
              </button>
            </form>
            
            {samples.length === 0 ? (
              <div className={styles.sampleList}>
                <div className={styles.emptyText}>아직 샘플이 없습니다.</div>
              </div>
            ) : (
              <ul className={styles.sampleList}>
                {samples.map((s) => (
                  <li key={s.id} className={styles.sampleItem}>
                    #{s.id} {s.name} <small>({s.createdAt})</small>
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <p className={styles.errorText}>
                ⚠️ 백엔드(8080) 연결 상태를 확인하세요. ({error})
              </p>
            )}
          </div>

          <FooterBar activeTab="matching" onFeatureAlert={handleFeatureAlert} />
        </div>

        {/* 커스텀 알림 모달 */}
        {customAlert && (
          <div className={styles.alertBackdrop}>
            <div className={styles.alertCard}>
              {customAlert.type !== "success" && (
                <div className={styles.alertIcon}>
                  {customAlert.type === "warning" && "⚠️"}
                  {customAlert.type === "feature" && "🐶"}
                </div>
              )}
              <div className={styles.alertMessage}>
                {customAlert.message}
              </div>
              <button
                type="button"
                className={styles.alertConfirmBtn}
                onClick={() => {
                  if (customAlert.onConfirm) {
                    customAlert.onConfirm();
                  }
                  setCustomAlert(null);
                }}
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* 커스텀 확인 모달 */}
        {customConfirm && (
          <div className={styles.alertBackdrop}>
            <div className={styles.alertCard}>
              <div className={styles.alertMessage}>
                {customConfirm.message}
              </div>
              <div className={styles.confirmBtnRow}>
                <button
                  type="button"
                  className={styles.confirmCancelBtn}
                  onClick={() => setCustomConfirm(null)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className={styles.confirmOkBtn}
                  onClick={() => {
                    customConfirm.onConfirm();
                    setCustomConfirm(null);
                  }}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


