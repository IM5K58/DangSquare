"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./cart.module.css";
import { 
  getCartItems, 
  updateCartItemQuantity, 
  toggleCartItemCheck, 
  toggleAllCartItemsCheck, 
  deleteCartItem, 
  deleteSelectedCartItems, 
  clearCart, 
  type CartItem 
} from "@/lib/marketMock";

export default function CartPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // 알림 모달 상태
  const [customAlert, setCustomAlert] = useState<{
    message: string;
    type: "success" | "warning" | "feature";
    onConfirm?: () => void;
  } | null>(null);

  // 초기 로드 및 온보딩 체크
  useEffect(() => {
    const isCompleted = localStorage.getItem("dangsquare_onboarding_completed");
    if (isCompleted !== "true") {
      router.push("/onboarding");
      return;
    }

    setCartItems(getCartItems());
    setLoading(false);
  }, [router]);

  // 장바구니 개수 및 목록 동기화
  const refreshCart = () => {
    setCartItems(getCartItems());
  };

  // 수량 변경
  const handleQuantityChange = (id: string, newQty: number) => {
    updateCartItemQuantity(id, newQty);
    refreshCart();
  };

  // 단일 체크박스 토글
  const handleCheckToggle = (id: string) => {
    toggleCartItemCheck(id);
    refreshCart();
  };

  // 전체 선택 토글
  const handleAllCheckToggle = () => {
    const isAllChecked = cartItems.every(item => item.checked);
    toggleAllCartItemsCheck(!isAllChecked);
    refreshCart();
  };

  // 단일 삭제
  const handleDeleteItem = (id: string) => {
    deleteCartItem(id);
    refreshCart();
  };

  // 선택 삭제
  const handleDeleteSelected = () => {
    const selectedCount = cartItems.filter(item => item.checked).length;
    if (selectedCount === 0) {
      setCustomAlert({ message: "선택된 상품이 없습니다.", type: "warning" });
      return;
    }
    deleteSelectedCartItems();
    refreshCart();
  };

  // 결제 진행
  const handleCheckout = () => {
    const selectedCount = cartItems.filter(item => item.checked).length;
    if (selectedCount === 0) {
      setCustomAlert({ message: "결제할 상품을 선택해주세요.", type: "warning" });
      return;
    }

    setCustomAlert({
      message: "결제가 성공적으로 완료되었습니다.\n지구를 사랑하는 걸음에 동참해주셔서 감사합니다! 🐾",
      type: "success",
      onConfirm: () => {
        // 선택된 아이템들만 결제 완료로 비우기
        const remainingItems = cartItems.filter(item => !item.checked);
        localStorage.setItem("dangsquare_cart_items", JSON.stringify(remainingItems));
        window.dispatchEvent(new Event("dangsquare_cart_updated"));
        router.push("/market"); // 목록으로 복귀
      }
    });
  };

  // --- 통계 및 금액 계산 ---
  const checkedItems = cartItems.filter(item => item.checked);
  const totalQty = checkedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalProductPrice = checkedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDeliveryFee = 0; // 무료배송 시뮬레이션
  const finalPrice = totalProductPrice + totalDeliveryFee;

  // 에코 이산화탄소 저감량 동적 계산 (가중치 룰셋)
  // NZ펫 하네스(0.5kg), 대나무 밥그릇(0.4kg), 유기농 간식(0.2kg), 순면 타올(0.2kg), 양모공(0.1kg), 기본 0.1kg
  const calculateEcoReduction = () => {
    return checkedItems.reduce((sum, item) => {
      let coeff = 0.1; // 기본값
      const title = item.title;
      if (title.includes("하네스")) coeff = 0.5;
      else if (title.includes("밥그릇")) coeff = 0.4;
      else if (title.includes("간식")) coeff = 0.2;
      else if (title.includes("타올")) coeff = 0.2;
      else if (title.includes("장난감")) coeff = 0.1;
      
      return sum + (coeff * item.quantity);
    }, 0);
  };

  const ecoReduction = calculateEcoReduction();

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ color: "#0e7060", fontWeight: 600 }}>장바구니 로드 중…</div>
      </div>
    );
  }

  const isAllChecked = cartItems.length > 0 && cartItems.every(item => item.checked);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {/* Header */}
        <header className={styles.headerBlock}>
          <button 
            type="button" 
            className={styles.closeBtn}
            onClick={() => router.push("/market")} // NZ마켓 목록으로 이동
          >
            {/* 뒤로가기 화살표 */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <span className={styles.headerTitle}>장바구니</span>
          <div className={styles.cartBadge}>{cartItems.length}</div>
        </header>

        {cartItems.length === 0 ? (
          /* =================== 장바구니 빈 상태 =================== */
          <div className={styles.emptyCartBlock}>
            <div style={{ fontSize: "48px" }}>🛒</div>
            <span className={styles.emptyText}>장바구니에 담긴 상품이 없습니다.</span>
            <button 
              type="button" 
              className={styles.shopBtn}
              onClick={() => router.push("/market")}
            >
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          /* =================== 장바구니 리스트 상태 =================== */
          <>
            <div className={styles.scrollWrapper}>
              
              {/* Selection Control Row */}
              <div className={styles.selectControlRow}>
                <div className={styles.checkboxLabel} onClick={handleAllCheckToggle}>
                  <div className={`${styles.customCheck} ${isAllChecked ? styles.customCheckActive : ""}`}>
                    {isAllChecked && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span>전체선택 ({checkedItems.length}/{cartItems.length})</span>
                </div>
                
                <button 
                  type="button" 
                  className={styles.deleteSelectedBtn}
                  onClick={handleDeleteSelected}
                >
                  선택삭제
                </button>
              </div>

              {/* Cart Items Cards */}
              <div className={styles.cartList}>
                {cartItems.map(item => (
                  <div key={item.id} className={styles.cartCard}>
                    
                    {/* Checkbox */}
                    <div className={styles.cardLeft}>
                      <div 
                        className={`${styles.customCheck} ${item.checked ? styles.customCheckActive : ""}`}
                        onClick={() => handleCheckToggle(item.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {item.checked && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className={styles.cartThumbnail}
                    />

                    {/* Details */}
                    <div className={styles.cardDetails}>
                      <div>
                        <div className={styles.cardHeaderRow}>
                          <div className={styles.brandRow}>
                            <span className={styles.brandName}>{item.brandName}</span>
                            {item.ecoTags.length > 0 && (
                              <span className={styles.ecoTagBadge}>에코</span>
                            )}
                          </div>
                        </div>

                        <h4 className={styles.productName}>{item.title}</h4>
                        <div className={styles.optionText}>
                          {item.size !== "FREE" ? `사이즈: ${item.size}` : "옵션: FREE"}
                        </div>
                      </div>

                      <div className={styles.cardBottomRow}>
                        <span className={styles.cardPrice}>
                          {(item.price * item.quantity).toLocaleString()}원
                        </span>

                        {/* Quantity Counter */}
                        <div className={styles.counterContainer}>
                          <button 
                            type="button" 
                            className={styles.counterBtn}
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <div className={styles.counterValue}>{item.quantity}</div>
                          <button 
                            type="button" 
                            className={styles.counterBtn}
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Single delete button */}
                    <button 
                      type="button" 
                      className={styles.deleteItemBtn}
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      {/* 휴지통 아이콘 */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>

                  </div>
                ))}
              </div>

              {/* Order summary section */}
              <div className={styles.summarySection}>
                <h4 className={styles.summaryTitle}>주문 금액</h4>
                
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>상품 금액</span>
                  <span className={styles.summaryVal}>{totalProductPrice.toLocaleString()}원</span>
                </div>

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>배송비</span>
                  <span className={styles.summaryVal} style={{ color: "#10B981" }}>
                    무료 🥳
                  </span>
                </div>

                <hr style={{ width: "100%", border: "none", borderTop: "1px solid #F3F4F6", margin: "4px 0" }} />

                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel} style={{ fontWeight: 700, color: "#1F2937" }}>최종 결제금액</span>
                  <span className={styles.summaryValHighlight}>{finalPrice.toLocaleString()}원</span>
                </div>
              </div>

              {/* Eco Contribution Card */}
              {ecoReduction > 0 && (
                <div className={styles.ecoCard}>
                  <div className={styles.ecoInnerCard}>
                    <div className={styles.ecoIcon}>🌱</div>
                    <div className={styles.ecoTexts}>
                      <span className={styles.ecoTitleText}>이번 주문의 에코 기여</span>
                      <span className={styles.ecoDescText}>
                        이 주문으로 이산화탄소 약 <strong>{ecoReduction.toFixed(1)}kg</strong>을 저감할 수 있어요!
                      </span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Fixed Bottom Payment Action Bar */}
            <div className={styles.paymentFixedBar}>
              <span className={styles.paymentMetaText}>
                선택 {checkedItems.length}개 상품 • 총 {finalPrice.toLocaleString()}원
              </span>
              <button
                type="button"
                className={`${styles.paymentBtn} ${checkedItems.length === 0 ? styles.paymentBtnDisabled : ""}`}
                disabled={checkedItems.length === 0}
                onClick={handleCheckout}
              >
                {finalPrice.toLocaleString()}원 · 결제하기 &gt;
              </button>
            </div>
          </>
        )}

        {/* 커스텀 알림 모달 */}
        {customAlert && (
          <div className={styles.alertBackdrop}>
            <div className={styles.alertCard}>
              <div className={styles.alertIcon}>
                {customAlert.type === "success" ? "🎉" : "🐶"}
              </div>
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

      </div>
    </div>
  );
}
