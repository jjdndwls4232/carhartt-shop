// ============================================================
// goodsData.js  (components/goods 폴더)
// 역할: Goods 페이지에서 쓰는 상수 + 상품 JSON 을 화면용 데이터로 바꾸는 함수
//   상품 데이터 : public/data/goods.json  (상품 추가/수정은 이 파일에서)
//   상품 사진   : public/img/goods/       (JSON 의 image 에 적은 이름과 같게)
// ============================================================

const BASE = import.meta.env.BASE_URL; // 배포 주소 앞부분 (로컬에서는 "/")

// 상품 목록 주소 : 나중에 실제 서버가 생기면 이 주소만 바꾸면 됨
export const PRODUCTS_URL = BASE + "data/goods.json";

// ------------------------------------------------------------
// 카테고리 탭 : key 는 주소(?category=) 와 JSON 의 category 에 쓰는 값
// ------------------------------------------------------------
export const CATEGORY_TABS = [
  {
    key: "all",
    label: "전체",
    title: "전체 상품",
    desc: "작업복에서 시작된 칼하트 WIP 의 모든 컬렉션을 한 곳에서 만나보세요",
  },
  {
    key: "men",
    label: "MEN",
    title: "남성",
    desc: "일상과 작업 현장 어디서나 어울리는 튼튼하고 실용적인 남성 컬렉션",
  },
  {
    key: "women",
    label: "WOMEN",
    title: "여성",
    desc: "워크웨어의 감성을 담아 편안하게 입을 수 있는 여성 컬렉션",
  },
  {
    key: "accessories",
    label: "ACCESSORIES",
    title: "액세서리",
    desc: "스타일을 완성하는 모자, 가방, 슈즈 컬렉션",
  },
];

// 정렬 옵션 : value 는 select 의 값, compare 는 배열 sort 에 넘길 비교 함수
export const SORT_OPTIONS = [
  { value: "latest", label: "최신순", compare: (a, b) => b.id - a.id },
  { value: "priceLow", label: "낮은 가격순", compare: (a, b) => a.finalPrice - b.finalPrice },
  { value: "priceHigh", label: "높은 가격순", compare: (a, b) => b.finalPrice - a.finalPrice },
];

// 사이즈 필터 옵션 ("all" = 전체 사이즈)
export const SIZE_OPTIONS = ["all", "S", "M", "L", "XL", "FREE"];

// 가격 표시 : 830000 → "830,000원"
export const formatPrice = (won) => `${won.toLocaleString("ko-KR")}원`;

/**
 * goods.json 상품 1개 → 화면에서 쓰는 상품 객체
 *   JSON 에 없는 값(실제 판매가, 할인율, 사진 전체 주소)을 계산해서 붙임
 */
export const toGoods = (item) => {
  const isSale = item.salePrice != null; // salePrice 가 숫자면 세일 상품
  return {
    ...item,
    isSale,
    finalPrice: isSale ? item.salePrice : item.price, // 실제 판매 가격
    discountRate: isSale ? Math.round((1 - item.salePrice / item.price) * 100) : 0,
    // "img/..." 앞에 BASE 를 붙여 어느 주소에 배포해도 사진이 보이게
    colors: item.colors.map((color) => ({ ...color, image: BASE + color.image })),
  };
};
