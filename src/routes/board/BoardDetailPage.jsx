// ============================================================
// BoardDetailPage.jsx  (routes/board 폴더 - 새로 만드는 파일, 경로: /board-list/:id)
// 역할: 주소의 글 번호로 글을 찾고, "볼 수 있는 글인지" 검사하고,
//       이전글/다음글을 계산한 뒤 화면 그리기는 PostDetail 에게 맡김
//   - 글이 없다            → "글을 찾을 수 없습니다" 화면
//   - 볼 권한이 없다        → 권한 없음 모달 (확인을 누르면 목록으로 이동)
//   - 볼 수 있다            → 상세 화면
//   (목록에서 막아도 주소창에 /board-list/10 처럼 직접 입력해서 들어올 수 있기 때문에
//    상세 페이지에서도 한 번 더 검사해야 함)
// ============================================================
import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import PostDetail from "../../components/board/PostDetail";
import NoAccessModal from "../../components/board/NoAccessModal";
import { POSTS, canViewPost } from "../../components/board/boardData";

const BoardDetailPage = () => {
  // 주소 /board-list/5 의 5 를 꺼냄 (주소에서 꺼낸 값은 항상 문자열이라 Number 로 변환)
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();

  // 글 번호가 같은 글 찾기 (없으면 undefined)
  const post = POSTS.find((item) => item.id === postId);

  // 다른 글(이전글/다음글)로 이동했을 때 화면을 맨 위로 올림
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  // ---------- 1. 글이 없는 경우 ----------
  // 훅(useEffect 등)은 return 보다 "위"에서 모두 호출해야 하므로, 조건에 따른 return 은 그 아래에 둠
  if (!post) {
    return (
      <div className="post-page">
        <p className="post-empty">글을 찾을 수 없습니다.</p>
        <div className="post-actions">
          <Link to="/board-list" className="post-btn post-btn--outline">
            목록으로
          </Link>
        </div>
      </div>
    );
  }

  // ---------- 볼 권한이 없는 경우 ----------
  // 모달을 띄우고, 닫으면(확인/바깥 클릭/ESC) 목록으로 보냄
  // replace: true 는 뒤로가기를 눌러도 이 막힌 주소로 다시 돌아오지 않게 하는 옵션
  if (!canViewPost(post)) {
    return (
      <div className="post-page">
        <NoAccessModal
          show
          onClose={() => navigate("/board-list", { replace: true })}
        />
      </div>
    );
  }

  // ---------- 이전글 / 다음글 계산 ----------
  // "내가 볼 수 있는 글"만 모아서 번호 순으로 정렬 → 그 안에서 앞/뒤 글을 찾음
  //   (볼 수 없는 글이 이전글/다음글로 나오지 않게 하려는 것)
  //   이전글 = 번호가 바로 앞(더 오래된 글), 다음글 = 번호가 바로 뒤(더 최신 글)
  const viewablePosts = POSTS.filter(canViewPost).sort((a, b) => a.id - b.id);
  const index = viewablePosts.findIndex((item) => item.id === postId);
  const prevPost = index > 0 ? viewablePosts[index - 1] : null;
  const nextPost =
    index < viewablePosts.length - 1 ? viewablePosts[index + 1] : null;

  // ---------- 삭제 ----------
  // 한 번 더 물어보고(confirm) → 목록으로 이동
  const handleDelete = () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    // TODO: 서버(또는 state)와 연결하면 이 자리에서 실제 삭제 요청을 보내면 됨
    navigate("/board-list");
  };

  return (
    <div className="post-page">
      <PostDetail
        post={post}
        prevPost={prevPost}
        nextPost={nextPost}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default BoardDetailPage;
