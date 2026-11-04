// ============================================================
// BoardDetailPage.jsx  (routes 폴더 - 실제로 화면에 보여지는 페이지)
// 역할: 글 목록 화면의 "두뇌"
//   1) 샘플 글 데이터를 갖고 있음 (나중에 서버 데이터로 교체)
//   2) 탭 / 검색어 / 정렬 / 페이지 번호를 state 로 기억함
//   3) 그 값에 맞게 글을 "필터 → 검색 → 정렬 → 페이지 자르기" 한 뒤
//      화면 그리기는 PostDetail 컴포넌트에 맡김
// ============================================================
import { useState } from "react";
import PostList from "../../components/board/PostList";
import NoAccessModal from "../../components/board/NoAccessModal";
import { POSTS, CURRENT_USER } from "../../components/board/boardData";
import "../../components/board/Board.scss";

// ------------------------------------------------------------
// 1. 설정값
// ------------------------------------------------------------
const PAGE_SIZE = 10; // 한 페이지에 보여줄 글 개수

// 카테고리(탭) 목록 : value 는 코드에서 구분할 때 쓰는 값, label 은 화면에 보이는 글자
const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "notice", label: "공지사항" },
  { value: "inquiry", label: "내 문의내역" },
];

const BoardListPage = () => {
  // ---------- 화면 상태 (값이 바뀌면 화면이 다시 그려짐) ----------
  const [category, setCategory] = useState("all"); // 선택된 탭
  const [keyword, setKeyword] = useState(""); // 검색어
  const [sort, setSort] = useState("latest"); // 정렬 기준 ("latest" 최신순 / "oldest" 오래된순)
  const [page, setPage] = useState(1); // 현재 페이지 번호
  const [noAccessOpen, setNoAccessOpen] = useState(false); // 권한 없음 모달 열림 여부

  // ---------- 1단계: 탭에 맞는 글만 남기기 ----------
  const byCategory = POSTS.filter((post) => {
    if (category === "notice") return post.category === "notice";
    // 내 문의내역 : 문의글이면서 작성자가 지금 로그인한 회원인 글
    if (category === "inquiry") {
      return post.category === "inquiry" && post.author === CURRENT_USER;
    }
    return true; // "all" 이면 전부 통과
  });

  // ---------- 2단계: 검색 (제목 또는 작성자에 검색어가 들어있는 글) ----------
  // 대소문자 구분 없이 찾으려고 둘 다 소문자로 바꿔서 비교
  const query = keyword.trim().toLowerCase();
  const searched = query
    ? byCategory.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query),
      )
    : byCategory;

  // ---------- 3단계: 정렬 ----------
  // sort() 는 원본 배열을 바꿔버리므로 [...searched] 로 복사본을 만들어서 정렬
  const sorted = [...searched].sort((a, b) =>
    sort === "oldest" ? a.id - b.id : b.id - a.id,
  );

  // ---------- 4단계: 현재 페이지에 보여줄 글만 자르기 ----------
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages); // 페이지 수가 줄어도 범위를 벗어나지 않게
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedPosts = sorted.slice(startIndex, startIndex + PAGE_SIZE);

  // ---------- 이벤트 핸들러 ----------
  // 탭 / 검색어 / 정렬이 바뀌면 결과가 달라지므로 1페이지로 되돌림
  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };
  const handleKeywordChange = (value) => {
    setKeyword(value);
    setPage(1);
  };
  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
  };

  // 필요한 값과 함수를 props 로 넘겨서 화면 그리기를 PostDetail 에 맡김
  return (
    <>
      <PostList
        categories={CATEGORIES}
        category={category}
        onCategoryChange={handleCategoryChange}
        total={sorted.length}
        keyword={keyword}
        onKeywordChange={handleKeywordChange}
        sort={sort}
        onSortChange={handleSortChange}
        posts={pagedPosts}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        pageSize={PAGE_SIZE}
        onBlockedClick={() => setNoAccessOpen(true)}
      />
      <NoAccessModal
        show={noAccessOpen}
        onClose={() => setNoAccessOpen(false)}
      />
    </>
  );
};

export default BoardListPage;
