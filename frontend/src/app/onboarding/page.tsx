"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./onboarding.module.css";

type StepType = "splash" | 1 | 2 | 3 | 4;

const BREED_LIST = [
  "말티즈",
  "토이 푸들",
  "포메라니안",
  "믹스견",
  "비숑 프리제",
  "골든 리트리버",
  "시바견",
  "웰시 코기",
  "진돗개",
  "치와와",
  "요크셔 테리어",
  "프렌치 불독",
  "닥스훈트",
  "기타 (직접 입력)"
];

type PersonalityType = "active" | "warm" | "shy" | "";

export default function Onboarding() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 온보딩 단계 상태
  const [step, setStep] = useState<StepType>("splash");
  
  // 견주 정보 상태
  const [ownerName, setOwnerName] = useState("");
  const [ownerGender, setOwnerGender] = useState<"male" | "female" | "">("");
  
  // 강아지 기본 정보 상태
  const [dogName, setDogName] = useState("");
  const [dogGender, setDogGender] = useState<"male" | "female" | "">("");
  const [dogBreed, setDogBreed] = useState("");
  
  // 강아지 성향 상태 (3/4)
  const [dogPersonality, setDogPersonality] = useState<PersonalityType>("");
  
  // 강아지 프로필 사진 상태 (4/4)
  const [dogPhoto, setDogPhoto] = useState<string | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  // 견종 선택 바텀 시트 상태
  const [isBreedSheetOpen, setIsBreedSheetOpen] = useState(false);
  const [customBreed, setCustomBreed] = useState("");
  const [showCustomBreedInput, setShowCustomBreedInput] = useState(false);

  // 스플래시 화면 2.5초 후 1단계 전환
  useEffect(() => {
    if (step === "splash") {
      const timer = setTimeout(() => {
        setStep(1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // 온보딩 완료 처리
  const handleComplete = () => {
    const onboardingData = {
      owner: {
        name: ownerName,
        gender: ownerGender,
      },
      dog: {
        name: dogName,
        gender: dogGender,
        breed: dogBreed === "기타 (직접 입력)" ? customBreed : dogBreed,
        personality: dogPersonality,
        photo: dogPhoto,
      },
      completedAt: new Date().toISOString(),
    };
    
    localStorage.setItem("dangsquare_onboarding_completed", "true");
    localStorage.setItem("dangsquare_onboarding_data", JSON.stringify(onboardingData));
    
    // 홈 화면으로 리다이렉트
    router.push("/");
  };

  // 다음 버튼 활성화 여부
  const isNextEnabled = () => {
    if (step === 1) {
      return ownerName.trim().length > 0 && ownerGender !== "";
    }
    if (step === 2) {
      const isBreedSelected = dogBreed !== "";
      const isCustomBreedValid = dogBreed === "기타 (직접 입력)" ? customBreed.trim().length > 0 : true;
      return dogName.trim().length > 0 && dogGender !== "" && isBreedSelected && isCustomBreedValid;
    }
    if (step === 3) {
      return dogPersonality !== "";
    }
    return true;
  };

  const handleNext = () => {
    if (isNextEnabled()) {
      if (step === 1) setStep(2);
      else if (step === 2) setStep(3);
      else if (step === 3) setStep(4);
    }
  };

  // 사진 업로드 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDogPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    setIsActionSheetOpen(false);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
    setIsActionSheetOpen(false);
  };

  // --- 렌더링 함수들 ---

  // Splash Screen
  if (step === "splash") {
    return (
      <div className={styles.container} onClick={() => setStep(1)}>
        <div className={styles.card}>
          <div className={styles.splash}>
            <div className={styles.splashHeader}>
              <p className={styles.splashSubtitle}>발걸음마다 싱그러운 에코 라이프</p>
              <h1 className={styles.splashLogo}>Dangsquare</h1>
            </div>
            
            <div className={styles.mascotContainer}>
              <Image 
                src="/dangsquare_mascot_official.png" 
                alt="Dangsquare Mascot" 
                fill
                priority
                sizes="(max-width: 480px) 100vw, 450px"
                className={styles.mascotImage}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.stepWrapper}>
          {/* Progress Bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressHeader}>{step}/4</div>
            <div className={styles.progressBarBackground}>
              <div 
                className={styles.progressBarFill} 
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          <div className={styles.contentArea}>
            {/* Step 1: 견주 프로필 */}
            {step === 1 && (
              <>
                <h2 className={styles.gumiTitle}>
                  견주님의 프로필을{"\n"}설정해주세요
                </h2>
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>이름</label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="이름을 입력해주세요"
                    className={styles.textInput}
                    maxLength={15}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>성별</label>
                  <div className={styles.genderGroup}>
                    <button
                      type="button"
                      className={`${styles.genderButton} ${ownerGender === "male" ? styles.genderButtonSelected : ""}`}
                      onClick={() => setOwnerGender("male")}
                    >
                      남성
                    </button>
                    <button
                      type="button"
                      className={`${styles.genderButton} ${ownerGender === "female" ? styles.genderButtonSelected : ""}`}
                      onClick={() => setOwnerGender("female")}
                    >
                      여성
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: 강아지 기본 정보 */}
            {step === 2 && (
              <>
                <h2 className={styles.gumiTitle}>
                  함께할 강아지의{"\n"}기본 정보를 입력해주세요
                </h2>
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>강아지 이름</label>
                  <input
                    type="text"
                    value={dogName}
                    onChange={(e) => setDogName(e.target.value)}
                    placeholder="강아지 이름 입력"
                    className={styles.textInput}
                    maxLength={15}
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>성별</label>
                  <div className={styles.genderGroup}>
                    <button
                      type="button"
                      className={`${styles.genderButton} ${dogGender === "male" ? styles.genderButtonSelected : ""}`}
                      onClick={() => setDogGender("male")}
                    >
                      수컷 ♂
                    </button>
                    <button
                      type="button"
                      className={`${styles.genderButton} ${dogGender === "female" ? styles.genderButtonSelected : ""}`}
                      onClick={() => setDogGender("female")}
                    >
                      암컷 ♀
                    </button>
                  </div>
                </div>
                
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>견종</label>
                  <div className={styles.selectWrapper} onClick={() => setIsBreedSheetOpen(true)}>
                    <input
                      type="text"
                      readOnly
                      value={dogBreed || "견종 선택"}
                      className={styles.selectInput}
                      style={{ color: dogBreed ? "#171d1c" : "#b9c1bf" }}
                    />
                    <span className={styles.selectArrow}>▼</span>
                  </div>
                </div>

                {showCustomBreedInput && dogBreed === "기타 (직접 입력)" && (
                  <div className={styles.inputGroup} style={{ marginTop: "-16px" }}>
                    <label className={styles.inputLabel}>직접 입력</label>
                    <input
                      type="text"
                      value={customBreed}
                      onChange={(e) => setCustomBreed(e.target.value)}
                      placeholder="견종을 입력해주세요"
                      className={styles.textInput}
                      maxLength={20}
                    />
                  </div>
                )}
              </>
            )}

            {/* Step 3: 강아지 성향 선택 */}
            {step === 3 && (
              <>
                <h2 className={styles.gumiTitle}>
                  우리 아이의 성향은{"\n"}어떤가요?
                </h2>
                <p className={styles.subtitle}>
                  산책 친구와 잘 맞을 수 있도록 알려주세요
                </p>
                
                <div className={styles.personalityList}>
                  {/* 카드 1 */}
                  <div 
                    className={`${styles.personalityCard} ${dogPersonality === "active" ? styles.personalityCardSelected : ""}`}
                    onClick={() => setDogPersonality("active")}
                  >
                    <div className={`${styles.radioOuter} ${dogPersonality === "active" ? styles.radioOuterSelected : ""}`}>
                      <div className={`${styles.radioInner} ${dogPersonality === "active" ? styles.radioInnerActive : ""}`} />
                    </div>
                    <div className={styles.cardIcon}>🔥</div>
                    <div className={styles.cardTextContainer}>
                      <span className={styles.cardTitle}>친근하고 활발해요</span>
                      <span className={styles.cardDesc}>낯선 친구도 금방 사귀어요</span>
                    </div>
                  </div>

                  {/* 카드 2 */}
                  <div 
                    className={`${styles.personalityCard} ${dogPersonality === "warm" ? styles.personalityCardSelected : ""}`}
                    onClick={() => setDogPersonality("warm")}
                  >
                    <div className={`${styles.radioOuter} ${dogPersonality === "warm" ? styles.radioOuterSelected : ""}`}>
                      <div className={`${styles.radioInner} ${dogPersonality === "warm" ? styles.radioInnerActive : ""}`} />
                    </div>
                    <div className={styles.cardIcon}>☀️</div>
                    <div className={styles.cardTextContainer}>
                      <span className={styles.cardTitle}>따뜻하고 온순해요</span>
                      <span className={styles.cardDesc}>차분하고 예의 바른 편이에요</span>
                    </div>
                  </div>

                  {/* 카드 3 */}
                  <div 
                    className={`${styles.personalityCard} ${dogPersonality === "shy" ? styles.personalityCardSelected : ""}`}
                    onClick={() => setDogPersonality("shy")}
                  >
                    <div className={`${styles.radioOuter} ${dogPersonality === "shy" ? styles.radioOuterSelected : ""}`}>
                      <div className={`${styles.radioInner} ${dogPersonality === "shy" ? styles.radioInnerActive : ""}`} />
                    </div>
                    <div className={styles.cardIcon}>☁️</div>
                    <div className={styles.cardTextContainer}>
                      <span className={styles.cardTitle}>낯을 많이 가려요</span>
                      <span className={styles.cardDesc}>친해지면 엄청 다정해져요</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 4: 온보딩 완료 및 사진 등록 */}
            {step === 4 && (
              <div className={styles.completeWrapper}>
                {/* 사진 업로드 Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  style={{ display: "none" }} 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                {/* 원형 아바타 영역 */}
                <div className={styles.avatarContainer} onClick={() => setIsActionSheetOpen(true)}>
                  {dogPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={dogPhoto} alt="Dog Profile" className={styles.avatarImage} />
                  ) : (
                    <div className={styles.avatarPlaceholder} />
                  )}
                </div>

                <h2 className={styles.gumiTitle} style={{ textAlign: "center", marginBottom: "16px" }}>
                  &ldquo;{dogName}&rdquo;와 함께할{"\n"}준비가 완료되었습니다!
                </h2>
                
                <div className={styles.guideCard}>
                  <span className={styles.guideTitle}>단추가 안내드릴게요</span>
                  <span className={styles.guideDesc}>
                    가까운 거리의 산책 친구를 탐색하고 소통해 보세요.
                  </span>
                </div>

                {/* 인디케이터 도트 */}
                <div className={styles.indicatorDots}>
                  <div className={styles.dot} />
                  <div className={`${styles.dot} ${styles.dotActive}`} />
                  <div className={styles.dot} />
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className={styles.buttonWrapper}>
            {step === 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isNextEnabled()}
                className={`${styles.primaryButton} ${!isNextEnabled() ? styles.primaryButtonDisabled : ""}`}
              >
                입력 완료
              </button>
            ) : step === 4 ? (
              <button
                type="button"
                onClick={handleComplete}
                className={styles.primaryButton}
              >
                산책 친구 찾으러 가기
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isNextEnabled()}
                className={`${styles.primaryButton} ${!isNextEnabled() ? styles.primaryButtonDisabled : ""}`}
              >
                다음
              </button>
            )}
          </div>
        </div>

        {/* Breed Selector Bottom Sheet */}
        {isBreedSheetOpen && (
          <div 
            className={styles.breedBottomSheetBackdrop}
            onClick={() => setIsBreedSheetOpen(false)}
          >
            <div 
              className={styles.breedBottomSheet}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.sheetHeader}>
                <span className={styles.sheetTitle}>견종 선택</span>
                <button 
                  type="button" 
                  className={styles.sheetCloseButton}
                  onClick={() => setIsBreedSheetOpen(false)}
                >
                  닫기
                </button>
              </div>
              <div className={styles.breedList}>
                {BREED_LIST.map((breed) => (
                  <button
                    key={breed}
                    type="button"
                    className={`${styles.breedItem} ${dogBreed === breed ? styles.breedItemActive : ""}`}
                    onClick={() => {
                      setDogBreed(breed);
                      setIsBreedSheetOpen(false);
                      if (breed === "기타 (직접 입력)") {
                        setShowCustomBreedInput(true);
                      } else {
                        setShowCustomBreedInput(false);
                        setCustomBreed("");
                      }
                    }}
                  >
                    {breed}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* iOS-style Action Sheet for Photo Upload */}
        {isActionSheetOpen && (
          <div 
            className={styles.actionSheetBackdrop}
            onClick={() => setIsActionSheetOpen(false)}
          >
            <div 
              className={styles.actionSheetContainer}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.actionSheetGroup}>
                <button type="button" className={styles.actionButton} onClick={triggerFileUpload}>
                  <span>Photo Library</span>
                  <span className={styles.actionIcon}>📁</span>
                </button>
                <button type="button" className={styles.actionButton} onClick={triggerFileUpload}>
                  <span>Take Photo or Video</span>
                  <span className={styles.actionIcon}>📷</span>
                </button>
                <button type="button" className={styles.actionButton} onClick={triggerFileUpload}>
                  <span>Browse</span>
                  <span className={styles.actionIcon}>•••</span>
                </button>
              </div>
              
              <button 
                type="button" 
                className={styles.actionButtonCancel}
                onClick={() => setIsActionSheetOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
