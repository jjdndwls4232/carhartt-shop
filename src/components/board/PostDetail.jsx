// ============================================================
// PostDetail.jsx  (components/board 폴더 - 새로 만드는 파일)
// 역할: 글 상세 화면을 "그리기만" 하는 컴포넌트 (데이터 찾기, 권한 검사는 BoardDetailPage 가 담당)
//   위에서 아래 순서 : 배지 / 제목 / 작성자·작성일 / 공유·북마크 아이콘
//                    → 대표 이미지 → 본문
//                    → 이전글·다음글 → 목록으로 / 수정하기 / 삭제하기 버튼
// props
//   - post     : 보여줄 글
//   - prevPost : 이전글 (없으면 null)
//   - nextPost : 다음글 (없으면 null)
//   - onDelete : 삭제 버튼을 눌렀을 때 실행할 함수
// ============================================================
import { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShareNodes,
  faBookmark,
  faUser,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { BADGE_LABEL, CURRENT_USER } from "./boardData";
import "./PostDetail.scss";

// ------------------------------------------------------------
// 이전글 / 다음글 한 칸을 그리는 작은 컴포넌트 (이 파일 안에서만 사용)
//   direction : "prev" 또는 "next"
//   target    : 이동할 글 (없으면 null -> 눌러지지 않는 칸으로 표시)
// ------------------------------------------------------------
const PostNavItem = ({ direction, target }) => {
  const isPrev = direction === "prev";
  const label = isPrev ? "이전글" : "다음글";
  const arrow = (
    <span className="post-nav-arrow">
      <FontAwesomeIcon icon={isPrev ? faChevronLeft : faChevronRight} />
    </span>
  );

  // 이동할 글이 없으면 링크가 아닌 일반 칸으로 보여줌
  if (!target) {
    return (
      <div className={`post-nav-item ${direction} is-empty`}>
        {arrow}
        <span className="post-nav-text">
          <em>{label}</em>
          <span>{label}이 없습니다.</span>
        </span>
      </div>
    );
  }

  return (
    <Link
      to={`/board-list/${target.id}`}
      className={`post-nav-item ${direction}`}
    >
      {arrow}
      <span className="post-nav-text">
        <em>{label}</em>
        <span>{target.title}</span>
      </span>
    </Link>
  );
};

// ------------------------------------------------------------
// 메인 컴포넌트
// ------------------------------------------------------------
const PostDetail = ({ post, prevPost, nextPost, onDelete }) => {
  // 북마크 아이콘 on/off 상태 (화면에서만 바뀌는 예시 기능)
  const [bookmarked, setBookmarked] = useState(false);

  // 내가 쓴 글인지 : 내 글일 때만 수정/삭제 버튼을 보여줌 (공지사항은 관리자 글이라 안 보임)
  const isMine = post.author === CURRENT_USER;

  // 공유 아이콘 : 지금 주소(URL)를 클립보드에 복사
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("링크가 복사되었습니다.");
    } catch {
      alert("링크를 복사하지 못했습니다.");
    }
  };

  return (
    <article className="post-detail">
      {/* ---------- 상단 : 배지 / 제목 / 작성자·작성일 / 아이콘 ---------- */}
      <header className="post-head">
        <div className="post-head-main">
          <span className={`post-badge post-badge--${post.category}`}>
            {BADGE_LABEL[post.category]}
          </span>
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span className="post-avatar" aria-hidden="true">
              <FontAwesomeIcon icon={faUser} />
            </span>
            <span>{post.author}</span>
            <span>{post.date}</span>
          </div>
        </div>

        <div className="post-tools">
          <button type="button" onClick={handleShare} aria-label="링크 복사">
            <FontAwesomeIcon icon={faShareNodes} />
          </button>
          <button
            type="button"
            className={bookmarked ? "active" : ""}
            onClick={() => setBookmarked((prev) => !prev)}
            aria-label="북마크"
            aria-pressed={bookmarked}
          >
            <FontAwesomeIcon icon={faBookmark} />
          </button>
        </div>
      </header>

      {/* ---------- 본문 ---------- */}
      <div className="post-body">
        {/* 대표 이미지가 있는 글만 보여줌 (post.image && ... : 값이 있을 때만 그림) */}
        {post.image && <img src={post.image} alt="" className="post-image" />}

        {/* 줄바꿈(\n)이 그대로 보이도록 CSS 에서 white-space: pre-wrap 적용 */}
        <p className="post-content">{post.content}</p>
      </div>

      {/* ---------- 이전글 / 다음글 ---------- */}
      <nav className="post-nav" aria-label="이전글 다음글">
        <PostNavItem direction="prev" target={prevPost} />
        <PostNavItem direction="next" target={nextPost} />
      </nav>

      {/* ---------- 하단 버튼 ---------- */}
      <div className="post-actions">
        <Link to="/board-list" className="post-btn post-btn--outline">
          목록으로
        </Link>

        {isMine && (
          <div className="post-actions-right">
            {/* 수정 : 작성/수정 페이지를 만들 때 이 경로로 라우트를 추가하면 됨 */}
            <Link
              to={`/board-list/edit/${post.id}`}
              className="post-btn post-btn--outline"
            >
              수정하기
            </Link>
            <button
              type="button"
              className="post-btn post-btn--primary"
              onClick={onDelete}
            >
              삭제하기
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default PostDetail;
