// ============================================================
// MyPage.jsx  (routes/mypage 폴더 - 새로 만드는 파일, 경로: /mypage)
// 역할: 마이페이지 화면 (지금은 디자인만, 메뉴/버튼 기능은 아직 없음)
//   왼쪽 : 마이페이지 제목 + 접고 펼치는 메뉴(아코디언)
//   오른쪽 : 회원 정보 배너(이름/이메일/쿠폰/위시리스트) → 최근 주문 내역(비어 있음)
//   로그인하지 않았으면 로그인 페이지로 보내고, 로그인 후 다시 마이페이지로 돌아오게 함
// ============================================================
import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../auth/useAuth";
import { findUser } from "../../auth/userStore";
import "./MyPage.scss";

// ------------------------------------------------------------
// 왼쪽 메뉴 데이터 : 그룹 제목(title) + 하위 메뉴(items)
// ------------------------------------------------------------
const MENU_GROUPS = [
  {
    id: "shopping",
    title: "나의 쇼핑 정보",
    items: ["주문 배송", "반품/취소/환불 내역", "상품 리뷰", "위시리스트"],
  },
  {
    id: "activity",
    title: "나의 활동 내역",
    items: ["1:1 문의 내역", "상품 Q&A", "최근 본 상품"],
  },
  {
    id: "info",
    title: "나의 정보 관리",
    items: ["회원정보 수정", "배송지 관리", "비밀번호 변경", "회원 탈퇴"],
  },
];

// 빈 주문 내역에 보여줄 웃는 쇼핑백 아이콘 (선만 있는 SVG)
const EmptyBagIcon = () => (
  <svg
    className="mypage-empty-icon"
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {/* 손잡이 */}
    <path d="M23 22v-4a9 9 0 0 1 18 0v4" />
    {/* 가방 몸통 (위가 넓은 사다리꼴) */}
    <path d="M10 22h44l-4 34H14z" />
    {/* 눈 두 개 + 웃는 입 */}
    <path d="M25 33v2M39 33v2" />
    <path d="M24 42c4 4 12 4 16 0" />
  </svg>
);

const MyPage = () => {
  const { user } = useAuth();
  const location = useLocation();

  // 펼쳐진 메뉴 그룹 id 목록 (처음에는 "나의 쇼핑 정보"만 펼침)
  const [openGroups, setOpenGroups] = useState(["shopping"]);

  // ---------- 로그인하지 않은 경우 ----------
  // <Navigate> : 그려지는 순간 다른 주소로 이동시키는 컴포넌트
  //   state.from 에 지금 주소를 담아 보내면 로그인 페이지가 로그인 후 여기로 돌려보냄
  //   replace : 뒤로가기를 눌렀을 때 마이페이지 ↔ 로그인 페이지를 왔다 갔다 하지 않게
  if (!user) {
    return <Navigate to="/social-login" replace state={{ from: location.pathname }} />;
  }

  // 이메일은 세션에 없어서 회원 목록에서 찾아옴 (소셜 로그인 회원은 없음)
  const email = findUser(user.userId)?.email;

  // 그룹 제목을 누르면 열려 있으면 닫고, 닫혀 있으면 엶
  const toggleGroup = (id) =>
    setOpenGroups((prev) =>
      prev.includes(id) ? prev.filter((groupId) => groupId !== id) : [...prev, id],
    );

  return (
    <div className="mypage">
      {/* ==================== 왼쪽 : 제목 + 메뉴 ==================== */}
      <aside className="mypage-side">
        <h1 className="mypage-title">마이페이지</h1>

        <nav className="mypage-nav" aria-label="마이페이지 메뉴">
          {MENU_GROUPS.map((group) => {
            const isOpen = openGroups.includes(group.id);
            return (
              <div key={group.id} className={`mypage-group${isOpen ? " is-open" : ""}`}>
                <button
                  type="button"
                  className="mypage-group-title"
                  aria-expanded={isOpen}
                  aria-controls={`mypage-group-${group.id}`}
                  onClick={() => toggleGroup(group.id)}
                >
                  {group.title}
                  <FontAwesomeIcon icon={faChevronDown} className="mypage-group-arrow" />
                </button>

                {/* 하위 메뉴 : 항상 그려 두고 높이만 0 ↔ 원래 높이로 애니메이션 */}
                <div className="mypage-group-body" id={`mypage-group-${group.id}`}>
                  <ul>
                    {group.items.map((item) => (
                      <li key={item}>
                        {/* 기능은 아직 없음 : 페이지가 생기면 Link 로 바꾸면 됨 */}
                        <button type="button" tabIndex={isOpen ? 0 : -1}>
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ==================== 오른쪽 : 회원 배너 + 최근 주문 ==================== */}
      <main className="mypage-main">
        <section className="mypage-banner" aria-label="회원 정보">
          <div className="mypage-profile">
            {/* 회원가입 때 쓴 닉네임 (소셜 로그인처럼 닉네임이 없으면 이름) */}
            <p className="mypage-name">{user.nickname || user.name}님</p>
            <div className="mypage-profile-row">
              {email && <span className="mypage-email">{email}</span>}
              <button type="button" className="mypage-edit-btn">
                회원정보 수정
              </button>
            </div>
          </div>

          {/* 쿠폰 / 위시리스트 개수 (기능이 없어서 0 고정) */}
          <dl className="mypage-stats">
            <div>
              <dt>쿠폰</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt>위시리스트</dt>
              <dd>0</dd>
            </div>
          </dl>
        </section>

        <section className="mypage-orders">
          <h2 className="mypage-section-title">최근 주문 내역</h2>
          <p className="mypage-orders-head">
            주문목록 / 배송조회 내역 총 <strong>0</strong>건
          </p>

          <div className="mypage-empty">
            <EmptyBagIcon />
            <p>최근 주문 내역이 없습니다.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MyPage;
