// ============================================================
// BoardWritePage.jsx  (routes/board 폴더 - 새로 만드는 파일)
// 경로: /board-list/write      → 글 작성
//       /board-list/edit/:id   → 글 수정
// 역할: 주소에 글 번호(id)가 있으면 "수정", 없으면 "작성"으로 판단하고
//       수정할 글 찾기 / 권한 검사 / 저장을 담당. 화면 그리기는 PostForm 에게 맡김
//   - 수정할 글이 없다          → "글을 찾을 수 없습니다" 화면
//   - 내 글이 아니다(수정 불가)  → 권한 없음 모달 (확인을 누르면 목록으로 이동)
// ============================================================
import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import PostForm from "../../components/board/PostForm";
import NoAccessModal from "../../components/board/NoAccessModal";
import {
  POSTS,
  CURRENT_USER,
  addPost,
  updatePost,
} from "../../components/board/boardData";

const BoardWritePage = () => {
  // /board-list/edit/5 이면 id = "5", /board-list/write 이면 id = undefined
  const { id } = useParams();
  const isEdit = id !== undefined;
  const postId = Number(id);
  const navigate = useNavigate();

  // 수정일 때만 원래 글을 찾음
  const post = isEdit ? POSTS.find((item) => item.id === postId) : null;

  // 작성 ↔ 수정 페이지로 넘어올 때 화면 맨 위에서 시작
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // ---------- 수정할 글이 없는 경우 ----------
  if (isEdit && !post) {
    return (
      <div className="write-page">
        <p className="write-empty">글을 찾을 수 없습니다.</p>
        <Link to="/board-list" className="write-back">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // ---------- 내 글이 아닌 경우 (주소를 직접 입력해서 들어온 경우 대비) ----------
  if (isEdit && post.author !== CURRENT_USER) {
    return (
      <div className="write-page">
        <NoAccessModal
          show
          onClose={() => navigate("/board-list", { replace: true })}
        />
      </div>
    );
  }

  // ---------- 저장 ----------
  // values : PostForm 이 넘겨준 입력값 { type, title, content, files }
  const handleSubmit = (values) => {
    // 첨부파일 중 첫 번째 이미지를 상세 페이지의 대표 이미지로 사용
    const firstImage = values.files.find((file) => file.type.startsWith("image/"));
    const data = { ...values, image: firstImage?.url };

    if (isEdit) {
      updatePost(postId, data);
      alert("글이 수정되었습니다.");
      // replace : 뒤로가기를 눌렀을 때 수정 화면으로 다시 돌아오지 않게
      navigate(`/board-list/${postId}`, { replace: true });
    } else {
      const newPost = addPost(data);
      alert("글이 등록되었습니다.");
      navigate(`/board-list/${newPost.id}`, { replace: true });
    }
  };

  // ---------- 취소 ----------
  const handleCancel = () => {
    if (!window.confirm("작성 중인 내용이 사라집니다. 취소하시겠습니까?")) return;
    // 수정이면 원래 글로, 작성이면 목록으로
    navigate(isEdit ? `/board-list/${postId}` : "/board-list");
  };

  return (
    <PostForm
      // key : 다른 글의 수정 화면으로 바뀌면 PostForm 을 새로 만들어 입력값을 초기화
      key={id ?? "write"}
      mode={isEdit ? "edit" : "write"}
      initialValues={post}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default BoardWritePage;
