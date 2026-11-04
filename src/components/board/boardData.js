const imgPath = import.meta.env.BASE_URL + "img/";

// 지금 로그인한 회원 이름 (로그인 기능과 연결하면 실제 회원 이름으로 교체 할 예정)
export const CURRENT_USER = "나";

// 구분 배지에 보여줄 짧은 이름 (post.category 값 -> 화면 글자)
export const BADGE_LABEL = { notice: "공지", inquiry: "문의" };

// ------------------------------------------------------------
// 글 열람 권한 규칙 : "공지사항" 이거나 "내가 쓴 글" 이면 볼 수 있음
//   post 를 받아서 true(볼 수 있음) / false(볼 수 없음) 를 돌려줌
// ------------------------------------------------------------
export const canViewPost = (post) =>
  post.category === "notice" || post.author === CURRENT_USER;

// 글 작성 페이지의 "게시판 선택" 옵션 (value 는 post.type 에 저장되는 값)
export const INQUIRY_TYPES = [
  { value: "general", label: "일반문의" },
  { value: "product", label: "상품문의" },
  { value: "delivery", label: "배송문의" },
  { value: "exchange", label: "교환/반품문의" },
];

// 오늘 날짜를 샘플 데이터와 같은 "2025.04.28" 모양으로 만듦
const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
};

// ------------------------------------------------------------
// 글 등록 / 수정
//   서버가 없어서 POSTS 배열을 직접 바꿈 → 새로고침하면 원래 샘플 데이터로 돌아감
//   (서버가 생기면 이 두 함수 안에서 서버에 요청을 보내도록 바꾸면 됨)
// ------------------------------------------------------------
export const addPost = (data) => {
  const post = {
    id: Math.max(0, ...POSTS.map((item) => item.id)) + 1, // 가장 큰 번호 + 1
    category: "inquiry",
    author: CURRENT_USER,
    date: formatDate(new Date()),
    ...data,
  };
  POSTS.unshift(post); // 최신 글이므로 배열 맨 앞에 추가
  return post;
};

export const updatePost = (id, data) => {
  const post = POSTS.find((item) => item.id === id);
  if (post) Object.assign(post, data); // 찾은 글 객체에 바뀐 값만 덮어씀
  return post;
};

// ------------------------------------------------------------
// 샘플 글 데이터 (서버가 생기면 서버에서 받아온 데이터로 교체 가능)
//   id / category / title / author / date로 구분 짓고,
//   content : 본문 (줄바꿈 \n 이 화면에서도 그대로 보이게)
//   image   : 이미지가 있다면 본문 위에 보여줄 대표 이미지 주소를 기입 (없으면 생략 가능)
// ------------------------------------------------------------
export const POSTS = [
  {
    id: 14,
    category: "notice",
    title: "칼하트 공식 온라인 스토어 이용 안내사항",
    author: "관리자",
    date: "2025.04.28",
    image: imgPath + "boardDetail_ex.png",
    content:
      "안녕하세요, 칼하트 코리아입니다.\n2025년 가을/겨울 시즌을 맞아 새로운 컬렉션이 출시되었습니다.\n이번 시즌에는 더 다채로운 컬러와 실용적인 디테일로 완성된 다양한 아이템을 만나보실 수 있습니다.\n\n주요 업데이트 사항\n• 신상품 20종 추가\n• 기존 인기 상품 재입고\n• 10만원 이상 구매 시 무료배송 이벤트 (4/20 ~ 5/31)\n\n감사합니다.",
  },
  {
    id: 13,
    category: "notice",
    title: "배송 및 교환/반품 안내",
    author: "관리자",
    date: "2025.04.25",
    content:
      "배송은 결제 완료 후 영업일 기준 1~3일 내에 출고됩니다.\n교환/반품은 상품 수령 후 7일 이내에 고객센터로 접수해 주세요.\n\n단, 착용 흔적이 있거나 택이 제거된 상품은 교환/반품이 어려울 수 있습니다.",
  },
  {
    id: 12,
    category: "notice",
    title: "회원 등급 및 적립금 제도 안내",
    author: "관리자",
    date: "2025.04.20",
    content:
      "구매 금액에 따라 회원 등급이 자동으로 조정됩니다.\n등급별 적립률은 마이페이지에서 확인하실 수 있습니다.",
  },
  {
    id: 11,
    category: "inquiry",
    title: "사이즈 문의드립니다.",
    author: "나",
    date: "2025.04.18",
    content:
      "평소 100 사이즈를 입는데 디트로이트 자켓은 어떤 사이즈를 고르면 좋을까요?\n오버핏으로 입고 싶습니다.",
  },
  {
    id: 10,
    category: "inquiry",
    title: "교환은 어떻게 하나요?",
    author: "장재혁",
    date: "2025.04.16",
    content:
      "수령한 상품의 사이즈가 맞지 않아 교환하고 싶습니다. 절차가 궁금합니다.",
  },
  {
    id: 9,
    category: "inquiry",
    title: "배송이 언제쯤 시작되나요?",
    author: "나",
    date: "2025.04.14",
    content:
      "어제 주문했는데 아직 배송 준비 중으로 나옵니다. 출고 일정이 궁금합니다.",
  },
  {
    id: 8,
    category: "notice",
    title: "지금 진행중인 10% 할인 이벤트 안내",
    author: "관리자",
    date: "2025.04.12",
    content:
      "이번 달 말까지 전 품목 10% 할인 이벤트가 진행됩니다.\n일부 상품은 이벤트 대상에서 제외될 수 있습니다.",
  },
  {
    id: 7,
    category: "inquiry",
    title: "재입고 일정이 궁금합니다.",
    author: "김웅기",
    date: "2025.04.10",
    content: "품절된 비니의 재입고 일정을 알 수 있을까요?",
  },
  {
    id: 6,
    category: "inquiry",
    title: "주문 취소하고 싶어요.",
    author: "나",
    date: "2025.04.08",
    content:
      "실수로 같은 상품을 두 번 주문했습니다. 한 건만 취소할 수 있을까요?",
  },
  {
    id: 5,
    category: "inquiry",
    title: "칼하트 WIP 라인도 있나요?",
    author: "김민찬",
    date: "2025.04.07",
    content: "WIP 라인 제품을 이곳에서도 구매할 수 있는지 궁금합니다.",
  },
  {
    id: 4,
    category: "notice",
    title: "신규 회원 가입 시 쿠폰 지급 안내",
    author: "관리자",
    date: "2025.04.05",
    content: "신규 회원 가입 시 5,000원 할인 쿠폰이 자동으로 지급됩니다.",
  },
  {
    id: 3,
    category: "inquiry",
    title: "결제 오류가 발생했습니다.",
    author: "정수빈",
    date: "2025.04.03",
    content:
      "결제 단계에서 오류가 나서 다시 시도했는데 카드 승인 문자가 두 번 왔습니다.",
  },
  {
    id: 2,
    category: "inquiry",
    title: "포장 관련 문의입니다.",
    author: "한소희",
    date: "2025.04.02",
    content: "선물용으로 구매하려고 합니다. 선물 포장이 가능한가요?",
  },
  {
    id: 1,
    category: "notice",
    title: "개인정보 처리방침 개정 안내",
    author: "관리자",
    date: "2025.04.01",
    content:
      "개인정보 처리방침이 일부 개정되었습니다.\n자세한 내용은 사이트 하단의 개인정보 처리방침에서 확인해 주세요.",
  },
];
