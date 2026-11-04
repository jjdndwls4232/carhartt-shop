// ============================================================
// PostList.jsx  (components 폴더 - 화면을 "그리기만" 하는 컴포넌트)
// 역할: 시안 이미지의 글 목록 화면 전체를 그림
//   위에서 아래 순서 : 경로(Home / Community) → 제목 → 설명
//                    → 탭 + 글쓰기 버튼 → 전체 N + 검색창 + 정렬
//                    → 글 목록 표 → 페이지 번호
// 이 컴포넌트는 state 를 갖지 않고, 필요한 값과 함수를 모두 props 로 받음
//   (값을 바꾸는 일은 부모인 BoardDetailPage 가 담당)
// ============================================================
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faMagnifyingGlass,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import { BADGE_LABEL, canViewPost } from "./boardData";

// 정렬 select 의 옵션 (value 는 BoardDetailPage 의 정렬 코드와 같은 이름)
const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "oldest", label: "오래된순" },
];

const PostList = ({
  categories, // 탭 목록 [{ value, label }, ...]
  category, // 지금 선택된 탭의 value
  onCategoryChange, // 탭을 눌렀을 때 실행할 함수
  total, // 조건에 맞는 전체 글 수 ("전체 N" 에 표시)
  keyword, // 검색어
  onKeywordChange, // 검색어가 바뀔 때 실행할 함수
  sort, // 정렬 기준
  onSortChange, // 정렬이 바뀔 때 실행할 함수
  posts, // 지금 페이지에 보여줄 글 배열
  currentPage, // 현재 페이지 번호
  totalPages, // 전체 페이지 수
  onPageChange, // 페이지를 바꿀 때 실행할 함수
  onBlockedClick, // 권한 없는 글을 눌렀을 때 실행할 함수
  pageSize = 10, // 한 페이지에 보여줄 줄 수 (글이 적으면 빈 줄로 채움)
}) => {
  // 전체 페이지가 3이면 [1, 2, 3] 배열을 만듦 (페이지 번호 버튼을 그리는 데 사용)
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // 글이 pageSize 보다 적으면 남는 줄 수만큼 빈 줄을 채워서 표 높이(= 페이지 버튼 위치)를 고정
  // 글이 하나도 없으면 첫 줄은 안내 문구가 차지하므로 1 줄을 빼고 채움
  const usedRows = posts.length === 0 ? 1 : posts.length;
  const emptyRows = Math.max(0, pageSize - usedRows);

  return (
    <div className="board-page">
      {/* ---------- 1. 상단: 경로 / 제목 / 설명 ---------- */}
      <nav className="board-breadcrumb" aria-label="현재 위치">
        <Link to="/">Home</Link>
        <span>/</span>
        Notice
      </nav>
      <h1 className="board-title">NOTICE BOARD</h1>
      <p className="board-desc">
        칼하트의 다양한 소식과 이야기를 나누어보세요.
        <br />
        상품 후기부터 공지사항까지, 고객 여러분의 소중한 의견을 기다립니다.
      </p>

      {/* ---------- 2. 탭 + 글쓰기 버튼 ---------- */}
      <div className="board-tabbar">
        <div className="board-tabs" role="tablist">
          {/* map : 탭 데이터 하나당 버튼 하나를 만듦 */}
          {categories.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={category === tab.value}
              // 선택된 탭에는 "active" 클래스를 붙여서 CSS 로 강조
              className={`board-tab${category === tab.value ? " active" : ""}`}
              onClick={() => onCategoryChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 글쓰기 : BoardWritePage (App.jsx 의 /board-list/write 라우트) */}
        <Link to="/board-list/write" className="board-btn board-btn--primary">
          <FontAwesomeIcon icon={faPen} />
          글쓰기
        </Link>
      </div>

      {/* ---------- 3. 전체 N / 검색창 / 정렬 ---------- */}
      <div className="board-toolbar">
        <p className="board-total">
          전체 <strong>{total}</strong>
        </p>

        <div className="board-toolbar-right">
          {/* 검색창 : 글자를 입력할 때마다 부모의 keyword 가 바뀌어 목록이 바로 걸러짐 */}
          <div className="board-search">
            <input
              type="text"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="검색어를 입력하세요."
              aria-label="게시글 검색"
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="board-search-icon"
            />
          </div>

          {/* 정렬 select : 기본 화살표는 CSS 로 숨기고 아이콘을 따로 올려 둠 */}
          <div className="board-select">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              aria-label="정렬 기준"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="board-select-icon"
            />
          </div>
        </div>
      </div>

      {/* ---------- 4. 글 목록 표 ---------- */}
      <table className="board-table">
        <thead>
          <tr>
            {/* hide-mobile 이 붙은 칸은 좁은 화면(모바일)에서 CSS 로 숨김 */}
            <th className="col-id hide-mobile">번호</th>
            <th className="col-category">구분</th>
            <th className="col-title">제목</th>
            <th className="col-author hide-mobile">작성자</th>
            <th className="col-date">작성일</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            // 글이 없을 때 : colSpan={5} 는 이 칸 하나가 표의 5칸을 모두 차지한다는 뜻
            <tr>
              <td colSpan={5} className="board-empty">
                {category === "inquiry"
                  ? "작성한 문의 내역이 없습니다."
                  : "등록된 글이 없습니다."}
              </td>
            </tr>
          ) : (
            // 글 하나당 표의 한 줄(tr)을 만듦. key 는 React 가 줄을 구분하는 고유 이름표
            posts.map((post) => (
              <tr key={post.id}>
                <td className="col-id hide-mobile">{post.id}</td>

                {/* 구분 배지 : board-badge--notice 처럼 종류별 클래스가 붙어 색을 다르게 줄 수 있음 */}
                <td className="col-category">
                  <span className={`board-badge board-badge--${post.category}`}>
                    {BADGE_LABEL[post.category]}
                  </span>
                </td>

                {/* 제목 : 누르면 상세 페이지로 이동 (경로는 실제 라우트에 맞게 바꾸세요) */}
                <td className="col-title">
                  <Link
                    to={`/board-list/${post.id}`}
                    onClick={(e) => {
                      // 볼 수 없는 글이면 이동을 막고(preventDefault) 권한 없음 모달을 띄움
                      if (!canViewPost(post)) {
                        e.preventDefault();
                        onBlockedClick();
                      }
                    }}
                  >
                    {post.title}
                    {/* 공지글이면 제목 옆에 자물쇠 아이콘 */}
                    {post.category === "notice" && (
                      <FontAwesomeIcon
                        icon={faLock}
                        className="board-lock"
                        aria-label="공지"
                      />
                    )}
                  </Link>
                </td>

                <td className="col-author hide-mobile">{post.author}</td>
                <td className="col-date">{post.date}</td>
              </tr>
            ))
          )}

          {/* 빈 줄 : 내용 없이 높이만 차지 (aria-hidden 으로 스크린리더에서는 무시) */}
          {Array.from({ length: emptyRows }, (_, i) => (
            <tr
              key={`empty-${i}`}
              className="board-row--empty"
              aria-hidden="true"
            >
              <td colSpan={5}></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ---------- 5. 페이지 번호 ( < 1 2 3 > ) ---------- */}
      <nav className="board-pagination" aria-label="페이지 이동 버튼">
        {/* 이전 : 첫 페이지에서는 disabled(누를 수 없음) */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="이전 페이지"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            type="button"
            className={number === currentPage ? "active" : ""}
            aria-current={number === currentPage ? "page" : undefined}
            onClick={() => onPageChange(number)}
          >
            {number}
          </button>
        ))}

        {/* 다음 : 마지막 페이지에서는 disabled */}
        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="다음 페이지"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </nav>
    </div>
  );
};

export default PostList;
