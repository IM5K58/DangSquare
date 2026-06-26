export type MarketItem = {
  id: number;
  title: string;
  type: "sell" | "buy";
  category: "먹거리" | "장난감" | "생활용품" | "의류" | "기타";
  price: number;
  priceRange?: string; // 사요 글의 희망가격 대역
  priceSuggestible: boolean;
  location: string;
  timeText: string;
  images: string[];
  likes: number;
  comments: number;
  views: number;
  description: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerTemp: number;
  isCompleted: boolean;
};

// NZ마켓플레이스 친환경 상품 타입
export type ShopItem = {
  id: number;
  title: string;
  brandName: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  category: "먹거리" | "생활용품" | "기타" | "장난감"; // 마켓플레이스 카테고리
  images: string[];
  tags: string[];
  isBest?: boolean;
  isEco?: boolean; // 에코 뱃지 표시 여부
};

// 장바구니 아이템 타입
export type CartItem = {
  id: string; // 고유 uuid 또는 타임스탬프 기반 id
  shopItemId: number;
  title: string;
  brandName: string;
  price: number;
  size: "XS" | "S" | "M" | "L" | "XL" | "FREE";
  quantity: number;
  image: string;
  ecoTags: string[];
  checked: boolean;
};

const INITIAL_MARKET_ITEMS: MarketItem[] = [
  {
    id: 1,
    title: "강아지 장난감 콩 KONG 클래식 M 사이즈",
    type: "sell",
    category: "장난감",
    price: 8000,
    priceSuggestible: true,
    location: "동작구 흑석동",
    timeText: "1시간 전",
    images: ["/market_kong.png", "/market_bones.png", "/market_elephant_dog.png"], // 이미지 3장으로 보강 (코끼리 문 강아지 추가)
    likes: 5,
    comments: 2,
    views: 42,
    description: "KONG 클래식 M 사이즈 판매합니다. 저희 강아지가 소형견이라 M이 너무 커서 거의 안 썼어요. 이빨 자국 거의 없고 깨끗한 편입니다. 속에 간식 넣어서 줄 수 있어 노즈워크에 좋아요. 직거래 환영이고 택배도 가능합니다. 🐾",
    sellerName: "멍멍맘_흑석",
    sellerTemp: 36.8,
    isCompleted: false,
  },
  {
    id: 2,
    title: "강아지 뼈다귀 장난감 세트 (3종) 거의 새 것",
    type: "sell",
    category: "장난감",
    price: 12000,
    priceSuggestible: false,
    location: "관악구 봉천동",
    timeText: "3시간 전",
    images: ["/market_bones.png"],
    likes: 8,
    comments: 3,
    views: 15,
    description: "뼈다귀 모양 봉제 장난감과 로프 장난감 3종 세트입니다. 강아지한테 줬더니 흥미가 없는지 냄새만 맡고 구석에 두었네요. 보풀이나 오염 전혀 없는 새 상품급입니다. 연락 주세요!",
    sellerName: "초코파파",
    sellerTemp: 36.5,
    isCompleted: false,
  },
  {
    id: 3,
    title: "소형견 의류 XS 사이즈 구매 원합니다",
    type: "buy",
    category: "의류",
    price: 0,
    priceRange: "5,000~10,000",
    priceSuggestible: false,
    location: "서초구 반포동",
    timeText: "5시간 전",
    images: ["/market_dog_scarf.png"],
    likes: 3,
    comments: 1,
    views: 8,
    description: "몸무게 2kg 전후의 소형견이 입을 수 있는 깔끔한 원피스나 후드티 구매 희망합니다. 구멍 나거나 오염이 심하지 않은 옷이면 좋겠습니다. 반포역 주변 직거래 원합니다. 연락 주세요!",
    sellerName: "해피앤코",
    sellerTemp: 37.2,
    isCompleted: false,
  }
];

// 마켓플레이스 초기 친환경 상품 6개 (이미지 2에 매칭)
const INITIAL_SHOP_ITEMS: ShopItem[] = [
  {
    id: 1,
    title: "친환경 대나무 강아지 밥그릇",
    brandName: "에코펫코리아",
    price: 24900,
    originalPrice: 32000,
    rating: 4.8,
    reviewsCount: 234,
    category: "생활용품",
    images: ["/shop_bamboo_bowl.png"],
    tags: ["친환경 대나무", "에코인증"],
    isEco: true,
  },
  {
    id: 2,
    title: "유기농 천연 강아지 샴푸",
    brandName: "그린독",
    price: 18500,
    rating: 4.6,
    reviewsCount: 187,
    category: "생활용품",
    images: ["/shop_dog_shampoo.png"],
    tags: ["유기농 천연", "피부 저자극"],
    isEco: false,
  },
  {
    id: 3,
    title: "재활용 소재 강아지 하네스 M 사이즈",
    brandName: "NZ펫",
    price: 38000,
    originalPrice: 45000,
    rating: 4.9,
    reviewsCount: 512,
    category: "생활용품",
    images: ["/shop_dog_harness.png", "/shop_bamboo_bowl.png"], // 이미지 3, 4에서 보이는 두 장의 이미지
    tags: ["재활용 소재", "탄소저감", "펫세이프"],
    isEco: true,
    isBest: true,
  },
  {
    id: 4,
    title: "저탄소 유기농 강아지 간식 세트",
    brandName: "퍼피그린",
    price: 15900, // 개별 가격
    rating: 4.7,
    reviewsCount: 98,
    category: "먹거리",
    images: ["/shop_dog_treat.png"],
    tags: ["탄소저감", "유기농"],
    isEco: true,
  },
  {
    id: 5,
    title: "친환경 천연 양모 장난감 공",
    brandName: "그린플레이",
    price: 12000,
    originalPrice: 15000,
    rating: 4.5,
    reviewsCount: 64,
    category: "장난감",
    images: ["/market_bones.png"],
    tags: ["친환경 양모", "무독성"],
    isEco: false,
  },
  {
    id: 6,
    title: "유기농 순면 강아지 타올 세트",
    brandName: "에코바스",
    price: 19000,
    originalPrice: 22000,
    rating: 4.7,
    reviewsCount: 110,
    category: "기타",
    images: ["/shop_dog_scarf.png"],
    tags: ["유기농 순면", "고흡수성"],
    isEco: true,
  }
];

// --- 중고거래 (MarketItem) CRUD ---
export const getMarketItems = (): MarketItem[] => {
  if (typeof window === "undefined") return INITIAL_MARKET_ITEMS;
  
  const stored = localStorage.getItem("dangsquare_market_items");
  if (!stored) {
    localStorage.setItem("dangsquare_market_items", JSON.stringify(INITIAL_MARKET_ITEMS));
    return INITIAL_MARKET_ITEMS;
  }
  
  try {
    return JSON.parse(stored) as MarketItem[];
  } catch (e) {
    console.error("Failed to parse market items", e);
    return INITIAL_MARKET_ITEMS;
  }
};

export const saveMarketItems = (items: MarketItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("dangsquare_market_items", JSON.stringify(items));
  }
};

export const getMarketItemById = (id: number): MarketItem | undefined => {
  const items = getMarketItems();
  return items.find(item => item.id === id);
};

export const addMarketItem = (item: Omit<MarketItem, "id" | "likes" | "comments" | "views" | "timeText" | "sellerTemp" | "isCompleted">): MarketItem => {
  const items = getMarketItems();
  
  const newItem: MarketItem = {
    ...item,
    id: items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1,
    likes: 0,
    comments: 0,
    views: 0,
    timeText: "방금 전",
    sellerTemp: 36.5,
    isCompleted: false
  };
  
  const updated = [newItem, ...items];
  saveMarketItems(updated);
  return newItem;
};

export const updateMarketItem = (updatedItem: MarketItem) => {
  const items = getMarketItems();
  const index = items.findIndex(item => item.id === updatedItem.id);
  if (index !== -1) {
    items[index] = updatedItem;
    saveMarketItems(items);
  }
};

// --- 마켓플레이스 (ShopItem) CRUD ---
export const getShopItems = (): ShopItem[] => {
  if (typeof window === "undefined") return INITIAL_SHOP_ITEMS;
  
  const stored = localStorage.getItem("dangsquare_shop_items");
  if (!stored) {
    localStorage.setItem("dangsquare_shop_items", JSON.stringify(INITIAL_SHOP_ITEMS));
    return INITIAL_SHOP_ITEMS;
  }
  
  try {
    return JSON.parse(stored) as ShopItem[];
  } catch (e) {
    console.error("Failed to parse shop items", e);
    return INITIAL_SHOP_ITEMS;
  }
};

export const getShopItemById = (id: number): ShopItem | undefined => {
  const items = getShopItems();
  return items.find(item => item.id === id);
};

// --- 장바구니 (CartItem) CRUD ---
export const getCartItems = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem("dangsquare_cart_items");
  if (!stored) {
    return [];
  }
  
  try {
    return JSON.parse(stored) as CartItem[];
  } catch (e) {
    console.error("Failed to parse cart items", e);
    return [];
  }
};

export const saveCartItems = (items: CartItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("dangsquare_cart_items", JSON.stringify(items));
    // 장바구니 상태 갱신 이벤트를 전역 브라우저에 발송하여 동기화 유도
    window.dispatchEvent(new Event("dangsquare_cart_updated"));
  }
};

export const addToCart = (
  shopItem: ShopItem, 
  size: CartItem["size"], 
  quantity: number = 1
): CartItem => {
  const cart = getCartItems();
  
  // 동일 상품 & 동일 사이즈가 장바구니에 이미 들어있는지 검색
  const existingIndex = cart.findIndex(
    item => item.shopItemId === shopItem.id && item.size === size
  );
  
  if (existingIndex !== -1) {
    cart[existingIndex].quantity += quantity;
    saveCartItems(cart);
    return cart[existingIndex];
  }
  
  const newCartItem: CartItem = {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    shopItemId: shopItem.id,
    title: shopItem.title,
    brandName: shopItem.brandName,
    price: shopItem.price,
    size,
    quantity,
    image: shopItem.images[0],
    ecoTags: shopItem.tags,
    checked: true // 기본 선택 상태
  };
  
  cart.push(newCartItem);
  saveCartItems(cart);
  return newCartItem;
};

export const updateCartItemQuantity = (id: string, quantity: number) => {
  const cart = getCartItems();
  const index = cart.findIndex(item => item.id === id);
  if (index !== -1) {
    cart[index].quantity = Math.max(1, quantity);
    saveCartItems(cart);
  }
};

export const toggleCartItemCheck = (id: string) => {
  const cart = getCartItems();
  const index = cart.findIndex(item => item.id === id);
  if (index !== -1) {
    cart[index].checked = !cart[index].checked;
    saveCartItems(cart);
  }
};

export const toggleAllCartItemsCheck = (checked: boolean) => {
  const cart = getCartItems();
  const updated = cart.map(item => ({ ...item, checked }));
  saveCartItems(updated);
};

export const deleteCartItem = (id: string) => {
  const cart = getCartItems();
  const updated = cart.filter(item => item.id !== id);
  saveCartItems(updated);
};

export const deleteSelectedCartItems = () => {
  const cart = getCartItems();
  const updated = cart.filter(item => !item.checked);
  saveCartItems(updated);
};

export const clearCart = () => {
  saveCartItems([]);
};
