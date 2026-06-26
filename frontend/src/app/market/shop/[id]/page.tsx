"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import styles from "./shopDetail.module.css";
import FooterBar from "@/components/FooterBar";
import { getShopItemById, addToCart, type ShopItem } from "@/lib/marketMock";

type SizeOption = "XS" | "S" | "M" | "L" | "XL" | "FREE";

export default function ShopDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id ? Number(params.id) : null;

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<ShopItem | null>(null);

  // 이미지 슬라이더 상태
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // 찜 상태
  const [hasStarred, setHasStarred] = useState(false);

  // 사이즈 및 수량 조절 상태
  const [selectedSize, setSelectedSize] = useState<SizeOption>("M");
  const [quantity, setQuantity] = useState(1);

  // 알림 모달 상태
  const [customAlert, setCustomAlert] = useState<{
    message: string;
    type: "success" | "warning" | "feature";
  } | null>(null);

  // 데이터 바인딩 및 초기화
  useEffect(() => {
    const isCompleted = localStorage.getItem("dangsquare_onboarding_completed");
    if (isCompleted !== "true") {
      router.push("/onboarding");
      return;
    }

    if (id) {
      const data = getShopItemById(id);
      if (data) {
        setItem(data);
        
        // 사이즈 디토 세팅 (하네스가 아니면 FREE로 기본값 설정)
        const isHarness = data.title.includes("하네스");
        setSelectedSize(isHarness ? "M" : "FREE");

        // 찜(즐겨찾기) 상태 조회
        const starredStr = localStorage.getItem("dangsquare_shop_starred_ids");
        if (starredStr) {
          try {
            const parsed = JSON.parse(starredStr) as number[];
            if (parsed.includes(id)) {
              setHasStarred(true);
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
    setLoading(false);
  }, [id, router]);

  // 커스텀 알림 처리
  const handleFeatureAlert = (featureName: string) => {
    setCustomAlert({
      message: `"${featureName}" 서비스는 준비 중입니다!\n단추가 열심히 개발하고 있어요 🐶`,
      type: "feature"
    });
  };

  // 찜 토글
  const handleStarToggle = () => {
    if (!item) return;

    const newStarred = !hasStarred;
    setHasStarred(newStarred);

    const starredStr = localStorage.getItem("dangsquare_shop_starred_ids");
    let starredList: number[] = [];
    if (starredStr) {
      try {
        starredList = JSON.parse(starredStr) as number[];
      } catch (e) {
        console.error(e);
      }
    }

    if (newStarred) {
      if (!starredList.includes(item.id)) {
        starredList.push(item.id);
      }
    } else {
      starredList = starredList.filter(starId => starId !== item.id);
    }
    localStorage.setItem("dangsquare_shop_starred_ids", JSON.stringify(starredList));
  };

  // 장바구니 담기
  const handleAddToCart = () => {
    if (!item) return;
    addToCart(item, selectedSize, quantity);
    
    setCustomAlert({
      message: `"${item.title}" (${selectedSize}) ${quantity}개가\n장바구니에 담겼습니다.`,
      type: "success"
    });
  };

  // 바로구매 하기
  const handleBuyNow = () => {
    if (!item) return;
    addToCart(item, selectedSize, quantity);
    router.push("/market/cart");
  };

  // 슬라이더 사진 조절
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item) return;
    setCurrentImgIndex(prev => (prev === 0 ? item.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item) return;
    setCurrentImgIndex(prev => (prev === item.images.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ color: "#0e7060", fontWeight: 600 }}>NZ마켓플레이스 상품 로드 중…</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.errorBlock}>
            <div style={{ fontSize: "40px" }}>⚠️</div>
            <div className={styles.errorText}>존재하지 않는 쇼핑몰 상품입니다.</div>
            <button 
              type="button" 
              className={styles.backBtn}
              onClick={() => router.push("/market")}
            >
              NZ마켓 목록으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasMultipleImages = item.images.length > 1;
  const isHarness = item.title.includes("하네스");

  // 할인율 연산
  const discountPercent = item.originalPrice 
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) 
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.scrollWrapper}>
          
          {/* Image Slider */}
          <div className={styles.sliderContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={item.images[currentImgIndex]} 
              alt={`${item.title} Slide ${currentImgIndex + 1}`} 
              className={styles.sliderImage}
            />

            {/* 에코 인증 오버레이 배너 */}
            {item.isEco && (
              <div className={styles.ecoOverlayBadge}>
                <span>🍃</span> 저탄소/재활용 에코 인증
              </div>
            )}

            {/* Slide Navigation buttons */}
            {hasMultipleImages && (
              <>
                <button type="button" className={`${styles.navBtn} ${styles.prevBtn}`} onClick={handlePrevImage}>
                  {/* 왼쪽 화살표 */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button type="button" className={`${styles.navBtn} ${styles.nextBtn}`} onClick={handleNextImage}>
                  {/* 오른쪽 화살표 */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}

            {/* Slide Indicators */}
            {hasMultipleImages && (
              <div className={styles.indicatorContainer}>
                {item.images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.indicatorDot} ${currentImgIndex === idx ? styles.activeDot : ""}`}
                  />
                ))}
              </div>
            )}

            {/* Overlay Header Buttons */}
            <div className={styles.overlayHeader}>
              <button 
                type="button" 
                className={styles.overlayBtn}
                onClick={() => router.push("/market")} // 목록으로 이동
              >
                {/* 뒤로가기 화살표 */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              
              <div className={styles.overlayHeaderRight}>
                <button 
                  type="button" 
                  className={styles.overlayBtn}
                  onClick={() => handleFeatureAlert("공유하기")}
                >
                  {/* 공유 아이콘 */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
                <button 
                  type="button" 
                  className={`${styles.overlayBtn} ${hasStarred ? styles.heartActive : ""}`}
                  onClick={handleStarToggle}
                >
                  {/* 하트 아이콘 */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>

          </div>

          {/* Product Basic Info Section */}
          <div className={styles.infoSection}>
            <div className={styles.partnerBadgeRow}>
              <span className={styles.partnerBadge}>{item.brandName} • 공식 파트너</span>
            </div>

            <h1 className={styles.productTitle}>{item.title}</h1>
            
            <div className={styles.ratingRow}>
              ★★★★★ {item.rating}
              <span className={styles.reviewsText}>({item.reviewsCount}개 리뷰)</span>
            </div>

            <div className={styles.priceBlock}>
              {item.originalPrice && (
                <span className={styles.originalPrice}>
                  {item.originalPrice.toLocaleString()}원
                </span>
              )}
              <div className={styles.priceRow}>
                <span className={styles.currentPrice}>
                  {item.price.toLocaleString()}원
                </span>
                {discountPercent > 0 && (
                  <span className={styles.discountRate}>
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Buy / Cart Buttons */}
            <div className={styles.buttonGroup}>
              <button 
                type="button" 
                className={styles.cartBtn}
                onClick={handleAddToCart}
              >
                🛒 장바구니
              </button>
              <button 
                type="button" 
                className={styles.buyBtn}
                onClick={handleBuyNow}
              >
                바로구매
              </button>
            </div>
          </div>

          {/* Eco Certification Details Card */}
          {item.isEco && (
            <div className={styles.ecoCard}>
              <div className={styles.ecoInnerCard}>
                <div className={styles.ecoHeader}>
                  <div className={styles.ecoCircle}>🌱</div>
                  <div className={styles.ecoHeaderTexts}>
                    <span className={styles.ecoCardTitle}>저탄소/재활용 에코 인증 제품</span>
                    <span className={styles.ecoCardDesc}>재활용 소재 60% 이상 • 탄소발자국 저감 인증</span>
                  </div>
                </div>

                <div className={styles.ecoTagRow}>
                  <span className={styles.ecoTag}>🍃 재활용 소재</span>
                  <span className={styles.ecoTag}>🍃 탄소저감</span>
                  <span className={styles.ecoTag}>🐾 펫세이프</span>
                </div>
              </div>
            </div>
          )}

          {/* Options Selection (Size & Quantity) */}
          <div className={styles.optionsSection}>
            {isHarness && (
              <div>
                <h4 className={styles.optionLabel}>사이즈 선택</h4>
                <div className={styles.sizeList}>
                  {(["XS", "S", "M", "L", "XL"] as SizeOption[]).map(sz => (
                    <button
                      key={sz}
                      type="button"
                      className={`${styles.sizeBtn} ${selectedSize === sz ? styles.sizeBtnActive : ""}`}
                      onClick={() => setSelectedSize(sz)}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.quantityRow}>
              <span className={styles.optionLabel} style={{ marginBottom: 0 }}>수량</span>
              <div className={styles.counterContainer}>
                <button 
                  type="button" 
                  className={styles.counterBtn}
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <div className={styles.counterValue}>{quantity}</div>
                <button 
                  type="button" 
                  className={styles.counterBtn}
                  onClick={() => setQuantity(prev => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <FooterBar activeTab="market" onFeatureAlert={handleFeatureAlert} />

        {/* 커스텀 알림 모달 */}
        {customAlert && (
          <div className={styles.alertBackdrop}>
            <div className={styles.alertCard}>
              <div className={styles.alertIcon}>
                {customAlert.type === "success" ? "🛒" : "🐶"}
              </div>
              <div className={styles.alertMessage}>
                {customAlert.message}
              </div>
              <button
                type="button"
                className={styles.alertConfirmBtn}
                onClick={() => setCustomAlert(null)}
              >
                확인
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
